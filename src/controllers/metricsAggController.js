// backend/src/controllers/metricsAggController.js
// Express handlers for Phase 8 metrics aggregation APIs.

const { getDb } = require("../utils/metricsDb");

function parseRangeParam(rangeParam) {
  switch (rangeParam) {
    case "1d":
      return 1;
    case "30d":
      return 30;
    case "7d":
    default:
      return 7;
  }
}

function getDateNDaysAgo(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n + 1); // include today in the window
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// GET /api/metrics/summary?range=1d|7d|30d
async function getSummary(req, res, next) {
  try {
    const db = getDb();
    const days = parseRangeParam(req.query.range);
    const fromDate = getDateNDaysAgo(days);

    const rows = db
      .prepare(
        `
          SELECT date, total, hits, misses, errors,
                 latency_p50, latency_p90, latency_avg
          FROM lookup_daily_rollup
          WHERE date >= ?
          ORDER BY date ASC
        `
      )
      .all(fromDate);

    if (!rows.length) {
      return res.json({
        range: req.query.range || "7d",
        totalLookups: 0,
        hits: 0,
        misses: 0,
        errors: 0,
        hitRate: 0,
        errorRate: 0,
        latencyP50: null,
        latencyP90: null,
        latencyAvg: null,
        days: [],
      });
    }

    let total = 0;
    let hits = 0;
    let misses = 0;
    let errors = 0;

    const latencySamples = [];

    for (const row of rows) {
      total += row.total;
      hits += row.hits;
      misses += row.misses;
      errors += row.errors;
      if (row.latency_avg != null) latencySamples.push(row.latency_avg);
    }

    const hitRate = total > 0 ? hits / total : 0;
    const errorRate = total > 0 ? errors / total : 0;

    const avgLatency =
      latencySamples.length > 0
        ? latencySamples.reduce((s, v) => s + v, 0) / latencySamples.length
        : null;

    res.json({
      range: req.query.range || "7d",
      totalLookups: total,
      hits,
      misses,
      errors,
      hitRate,
      errorRate,
      latencyP50: rows[rows.length - 1].latency_p50 ?? null,
      latencyP90: rows[rows.length - 1].latency_p90 ?? null,
      latencyAvg: avgLatency,
      days: rows,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/metrics/latency-histogram?range=1d|7d|30d
async function getLatencyHistogram(req, res, next) {
  try {
    const db = getDb();
    const days = parseRangeParam(req.query.range);
    const fromDate = getDateNDaysAgo(days);

    const rows = db
      .prepare(
        `
          SELECT date, bucket, count
          FROM lookup_latency_buckets
          WHERE date >= ?
          ORDER BY date ASC
        `
      )
      .all(fromDate);

    const bucketsMap = new Map();

    for (const row of rows) {
      const prev = bucketsMap.get(row.bucket) || 0;
      bucketsMap.set(row.bucket, prev + row.count);
    }

    const buckets = Array.from(bucketsMap.entries()).map(
      ([label, count]) => ({ label, count })
    );

    res.json({
      range: req.query.range || "7d",
      buckets,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/metrics/daily-rollup?from=YYYY-MM-DD&to=YYYY-MM-DD
async function getDailyRollup(req, res, next) {
  try {
    const db = getDb();
    const from = req.query.from || getDateNDaysAgo(7);
    const to = req.query.to || null;

    let rows;
    if (to) {
      rows = db
        .prepare(
          `
            SELECT date, total, hits, misses, errors,
                   latency_p50, latency_p90, latency_avg
            FROM lookup_daily_rollup
            WHERE date >= ? AND date <= ?
            ORDER BY date ASC
          `
        )
        .all(from, to);
    } else {
      rows = db
        .prepare(
          `
            SELECT date, total, hits, misses, errors,
                   latency_p50, latency_p90, latency_avg
            FROM lookup_daily_rollup
            WHERE date >= ?
            ORDER BY date ASC
          `
        )
        .all(from);
    }

    res.json({ from, to, days: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSummary,
  getLatencyHistogram,
  getDailyRollup,
};
