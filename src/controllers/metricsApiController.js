// backend/src/controllers/metricsApiController.js
// -----------------------------------------------------------------------------
// Phase 8 — Metrics Read API (summary, histogram, daily rollup) — ESM version
// -----------------------------------------------------------------------------

import { getDb } from '../utils/metricsDb.js';

/**
 * Parse a range string like "1d" | "7d" | "30d" into { from, to } YYYY-MM-DD.
 */
function getDateRangeFromQuery(rangeParam) {
  const today = new Date();
  const to = today.toISOString().slice(0, 10); // YYYY-MM-DD

  let days = 7; // default
  if (rangeParam === '1d') days = 1;
  else if (rangeParam === '7d') days = 7;
  else if (rangeParam === '30d') days = 30;

  const fromDate = new Date(today);
  fromDate.setUTCDate(today.getUTCDate() - (days - 1));
  const from = fromDate.toISOString().slice(0, 10);

  return { from, to };
}

/**
 * Helper to safely send 500 JSON errors.
 */
function sendServerError(res, err, message = 'Internal server error') {
  // eslint-disable-next-line no-console
  console.error('[metrics-api] Error:', message, err);
  res.status(500).json({
    ok: false,
    error: message,
  });
}

/**
 * GET /api/metrics/summary?range=1d|7d|30d
 * Returns totals and approximate latency stats over the requested window.
 */
export async function getMetricsSummary(req, res) {
  try {
    const db = getDb();
    const { range = '7d' } = req.query;
    const { from, to } = getDateRangeFromQuery(range);

    const rows = db
      .prepare(
        `
        SELECT date, total, hits, misses, errors,
               latency_p50, latency_p90, latency_avg
        FROM lookup_daily_rollup
        WHERE date BETWEEN @from AND @to
        ORDER BY date ASC
        `,
      )
      .all({ from, to });

    if (!rows.length) {
      return res.json({
        ok: true,
        range,
        from,
        to,
        totals: {
          total: 0,
          hits: 0,
          misses: 0,
          errors: 0,
        },
        latency: {
          p50: null,
          p90: null,
          avg: null,
        },
        daily: [],
      });
    }

    // Aggregate totals and approximate latency.
    let total = 0;
    let hits = 0;
    let misses = 0;
    let errors = 0;

    let weightedLatencySum = 0;
    let weightedP50Sum = 0;
    let weightedP90Sum = 0;
    let eventsForAverage = 0;

    rows.forEach((row) => {
      const dayTotal = row.total || 0;
      total += dayTotal;
      hits += row.hits || 0;
      misses += row.misses || 0;
      errors += row.errors || 0;

      if (dayTotal > 0) {
        if (row.latency_avg != null) {
          weightedLatencySum += row.latency_avg * dayTotal;
        }
        if (row.latency_p50 != null) {
          weightedP50Sum += row.latency_p50 * dayTotal;
        }
        if (row.latency_p90 != null) {
          weightedP90Sum += row.latency_p90 * dayTotal;
        }
        eventsForAverage += dayTotal;
      }
    });

    const latencyAvg =
      eventsForAverage > 0 ? weightedLatencySum / eventsForAverage : null;
    const latencyP50 =
      eventsForAverage > 0 ? weightedP50Sum / eventsForAverage : null;
    const latencyP90 =
      eventsForAverage > 0 ? weightedP90Sum / eventsForAverage : null;

    return res.json({
      ok: true,
      range,
      from,
      to,
      totals: {
        total,
        hits,
        misses,
        errors,
      },
      latency: {
        p50: latencyP50,
        p90: latencyP90,
        avg: latencyAvg,
      },
      daily: rows,
    });
  } catch (err) {
    return sendServerError(res, err, 'Failed to load metrics summary');
  }
}

/**
 * GET /api/metrics/latency-histogram?from=YYYY-MM-DD&to=YYYY-MM-DD
 * If from/to are missing, falls back to last 7 days (range param).
 */
export async function getLatencyHistogram(req, res) {
  try {
    const db = getDb();

    const rangeParam = req.query.range || '7d';
    const hasExplicitRange = req.query.from && req.query.to;

    let from;
    let to;

    if (hasExplicitRange) {
      from = String(req.query.from).slice(0, 10);
      to = String(req.query.to).slice(0, 10);
    } else {
      const r = getDateRangeFromQuery(rangeParam);
      from = r.from;
      to = r.to;
    }

    const rows = db
      .prepare(
        `
        SELECT bucket, SUM(count) AS count
        FROM lookup_latency_buckets
        WHERE date BETWEEN @from AND @to
        GROUP BY bucket
        ORDER BY bucket ASC
        `,
      )
      .all({ from, to });

    return res.json({
      ok: true,
      from,
      to,
      buckets: rows.map((row) => ({
        bucket: row.bucket,
        count: row.count,
      })),
    });
  } catch (err) {
    return sendServerError(res, err, 'Failed to load latency histogram');
  }
}

/**
 * GET /api/metrics/daily-rollup?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Returns a chronologically sorted array of daily rows.
 */
export async function getDailyRollup(req, res) {
  try {
    const db = getDb();

    const rangeParam = req.query.range || '7d';
    const hasExplicitRange = req.query.from && req.query.to;

    let from;
    let to;

    if (hasExplicitRange) {
      from = String(req.query.from).slice(0, 10);
      to = String(req.query.to).slice(0, 10);
    } else {
      const r = getDateRangeFromQuery(rangeParam);
      from = r.from;
      to = r.to;
    }

    const rows = db
      .prepare(
        `
        SELECT date, total, hits, misses, errors,
               latency_p50, latency_p90, latency_avg
        FROM lookup_daily_rollup
        WHERE date BETWEEN @from AND @to
        ORDER BY date ASC
        `,
      )
      .all({ from, to });

    return res.json({
      ok: true,
      from,
      to,
      days: rows,
    });
  } catch (err) {
    return sendServerError(res, err, 'Failed to load daily rollup');
  }
}
