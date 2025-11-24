// backend/src/utils/metricsAggregator.js
// Reads metrics-log.jsonl and aggregates into SQLite tables for Phase 8.

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { getDb, getMeta, setMeta } = require("./metricsDb");

const JSONL_PATH = path.join(__dirname, "..", "..", "data", "metrics-log.jsonl");
const META_KEY_LAST_TS = "metrics_last_processed_timestamp_ms";

// Latency buckets we want to track.
const LATENCY_BUCKETS = [
  { label: "0-10", from: 0, to: 10 },
  { label: "10-25", from: 10, to: 25 },
  { label: "25-100", from: 25, to: 100 },
  { label: "100+", from: 100, to: Infinity },
];

function toDateKey(timestampMs) {
  const d = new Date(timestampMs);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function classifyResultType(event) {
  if (event.resultType === "hit" || event.resultType === "miss" || event.resultType === "error") {
    return event.resultType;
  }
  // Fallbacks based on shape.
  if (event.error || event.type === "error") return "error";
  return "hit"; // default optimistic
}

function bucketLabelForLatency(latencyMs) {
  for (const bucket of LATENCY_BUCKETS) {
    if (latencyMs >= bucket.from && latencyMs < bucket.to) {
      return bucket.label;
    }
  }
  return "100+";
}

/**
 * Aggregate new events from JSONL into SQLite.
 * Returns { processedCount, maxTimestampMs }.
 */
async function aggregateNewMetrics(jsonlPath = JSONL_PATH) {
  const db = getDb();

  if (!fs.existsSync(jsonlPath)) {
    return { processedCount: 0, maxTimestampMs: null };
  }

  const lastProcessedTs =
    Number(getMeta(META_KEY_LAST_TS, 0)) || 0;

  const fileStream = fs.createReadStream(jsonlPath, { encoding: "utf8" });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const perDay = new Map();
  let processed = 0;
  let maxTs = lastProcessedTs;

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let event;
    try {
      event = JSON.parse(trimmed);
    } catch (_err) {
      // Malformed line; skip.
      continue;
    }

    const ts = Number(event.timestamp || event.exportedAt);
    if (!Number.isFinite(ts)) continue;

    if (ts <= lastProcessedTs) {
      continue; // already processed
    }

    const latencyMs = Number(event.latencyMs);
    if (!Number.isFinite(latencyMs) || latencyMs < 0) continue;

    const dateKey = toDateKey(ts);
    const resultType = classifyResultType(event);
    const bucketLabel = bucketLabelForLatency(latencyMs);

    if (!perDay.has(dateKey)) {
      perDay.set(dateKey, {
        total: 0,
        hits: 0,
        misses: 0,
        errors: 0,
        latencies: [],
        bucketCounts: new Map(),
      });
    }

    const stats = perDay.get(dateKey);
    stats.total += 1;
    stats.latencies.push(latencyMs);

    if (resultType === "hit") stats.hits += 1;
    else if (resultType === "miss") stats.misses += 1;
    else if (resultType === "error") stats.errors += 1;

    const currentBucketCount = stats.bucketCounts.get(bucketLabel) || 0;
    stats.bucketCounts.set(bucketLabel, currentBucketCount + 1);

    processed += 1;
    if (ts > maxTs) maxTs = ts;
  }

  if (processed === 0) {
    return { processedCount: 0, maxTimestampMs: lastProcessedTs };
  }

  const insertDaily = db.prepare(`
    INSERT INTO lookup_daily_rollup (
      date, total, hits, misses, errors,
      latency_p50, latency_p90, latency_avg
    )
    VALUES (@date, @total, @hits, @misses, @errors, @latency_p50, @latency_p90, @latency_avg)
    ON CONFLICT(date) DO UPDATE SET
      total = excluded.total + lookup_daily_rollup.total,
      hits = excluded.hits + lookup_daily_rollup.hits,
      misses = excluded.misses + lookup_daily_rollup.misses,
      errors = excluded.errors + lookup_daily_rollup.errors,
      latency_p50 = excluded.latency_p50,
      latency_p90 = excluded.latency_p90,
      latency_avg = excluded.latency_avg
  `);

  const insertBucket = db.prepare(`
    INSERT INTO lookup_latency_buckets (date, bucket, count)
    VALUES (@date, @bucket, @count)
    ON CONFLICT(date, bucket) DO UPDATE SET
      count = lookup_latency_buckets.count + excluded.count
  `);

  const computePercentile = (values, percentile) => {
    if (!values.length) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const idx = Math.floor((percentile / 100) * (sorted.length - 1));
    return sorted[idx];
  };

  const tx = db.transaction(() => {
    for (const [date, stats] of perDay.entries()) {
      const avg =
        stats.latencies.reduce((sum, v) => sum + v, 0) /
        Math.max(stats.latencies.length, 1);

      const p50 = computePercentile(stats.latencies, 50);
      const p90 = computePercentile(stats.latencies, 90);

      insertDaily.run({
        date,
        total: stats.total,
        hits: stats.hits,
        misses: stats.misses,
        errors: stats.errors,
        latency_p50: p50,
        latency_p90: p90,
        latency_avg: avg,
      });

      for (const [bucketLabel, count] of stats.bucketCounts.entries()) {
        insertBucket.run({
          date,
          bucket: bucketLabel,
          count,
        });
      }
    }

    setMeta(META_KEY_LAST_TS, maxTs);
  });

  tx();

  return {
    processedCount: processed,
    maxTimestampMs: maxTs,
  };
}

module.exports = {
  aggregateNewMetrics,
  JSONL_PATH,
  META_KEY_LAST_TS,
};
