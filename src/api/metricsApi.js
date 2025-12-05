// src/api/metricsApi.js
// -----------------------------------------------------------------------------
// Phase 8 — Metrics API Client (Frontend Stub)
// -----------------------------------------------------------------------------
// This file defines the client-facing API surface for Phase 8 metrics.
// IMPORTANT: This is an integration stub. Actual fetch logic can be filled in
// once the backend endpoints are live and verified.
//
// Endpoints (implemented on backend):
//   GET /api/metrics/summary?range=1d|7d|30d
//   GET /api/metrics/latency-histogram?from=&to= OR ?range=7d
//   GET /api/metrics/daily-rollup?from=&to= OR ?range=7d
//
// DO NOT import this into UI components until Phase 8 dashboard work begins.
// -----------------------------------------------------------------------------

const BASE_URL = '/api/metrics';

/**
 * Shape of the summary response (for reference):
 *
 * {
 *   ok: true,
 *   range: "7d",
 *   from: "YYYY-MM-DD",
 *   to: "YYYY-MM-DD",
 *   totals: {
 *     total: number,
 *     hits: number,
 *     misses: number,
 *     errors: number
 *   },
 *   latency: {
 *     p50: number | null,
 *     p90: number | null,
 *     avg: number | null
 *   },
 *   daily: Array<{
 *     date: string,
 *     total: number,
 *     hits: number,
 *     misses: number,
 *     errors: number,
 *     latency_p50: number | null,
 *     latency_p90: number | null,
 *     latency_avg: number | null
 *   }>
 * }
 */

/**
 * Fetches summary metrics over a given range.
 *
 * @param {('1d'|'7d'|'30d')} [range='7d']
 * @returns {Promise<any>} Summary metrics payload (see shape above).
 */
export async function getMetricsSummary(range = '7d') {
  // TODO: Implement actual fetch call when ready.
  // Example:
  // const res = await fetch(`${BASE_URL}/summary?range=${encodeURIComponent(range)}`);
  // const json = await res.json();
  // return json;
  throw new Error('getMetricsSummary not implemented yet (Phase 8 stub)');
}

/**
 * Shape of the latency histogram response:
 *
 * {
 *   ok: true,
 *   from: "YYYY-MM-DD",
 *   to: "YYYY-MM-DD",
 *   buckets: Array<{
 *     bucket: string,  // e.g. "0-10", "10-25", "25-100", "100+"
 *     count: number
 *   }>
 * }
 */

/**
 * Fetches latency histogram data for a date range or relative window.
 *
 * @param {Object} [options]
 * @param {string} [options.from] - YYYY-MM-DD
 * @param {string} [options.to]   - YYYY-MM-DD
 * @param {('1d'|'7d'|'30d')} [options.range='7d'] - Used if from/to not provided.
 * @returns {Promise<any>} Histogram payload (see shape above).
 */
export async function getLatencyHistogram(options = {}) {
  const { from, to, range = '7d' } = options;

  // TODO: Implement actual fetch call when ready.
  // Example:
  // const params = new URLSearchParams();
  // if (from && to) {
  //   params.set('from', from);
  //   params.set('to', to);
  // } else {
  //   params.set('range', range);
  // }
  // const res = await fetch(`${BASE_URL}/latency-histogram?${params.toString()}`);
  // return res.json();

  throw new Error('getLatencyHistogram not implemented yet (Phase 8 stub)');
}

/**
 * Shape of the daily rollup response:
 *
 * {
 *   ok: true,
 *   from: "YYYY-MM-DD",
 *   to: "YYYY-MM-DD",
 *   days: Array<{
 *     date: string,
 *     total: number,
 *     hits: number,
 *     misses: number,
 *     errors: number,
 *     latency_p50: number | null,
 *     latency_p90: number | null,
 *     latency_avg: number | null
 *   }>
 * }
 */

/**
 * Fetches daily rollup metrics for a date range or relative window.
 *
 * @param {Object} [options]
 * @param {string} [options.from] - YYYY-MM-DD
 * @param {string} [options.to]   - YYYY-MM-DD
 * @param {('1d'|'7d'|'30d')} [options.range='7d'] - Used if from/to not provided.
 * @returns {Promise<any>} Daily rollup payload (see shape above).
 */
export async function getDailyRollup(options = {}) {
  const { from, to, range = '7d' } = options;

  // TODO: Implement actual fetch call when ready.
  // Example:
  // const params = new URLSearchParams();
  // if (from && to) {
  //   params.set('from', from);
  //   params.set('to', to);
  // } else {
  //   params.set('range', range);
  // }
  // const res = await fetch(`${BASE_URL}/daily-rollup?${params.toString()}`);
  // return res.json();

  throw new Error('getDailyRollup not implemented yet (Phase 8 stub)');
}
