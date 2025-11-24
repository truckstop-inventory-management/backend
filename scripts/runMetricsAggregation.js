// backend/scripts/runMetricsAggregation.js
// CLI script to aggregate new JSONL metrics into SQLite.
// Usage (from backend folder):
//   node scripts/runMetricsAggregation.js

const path = require("path");
const { aggregateNewMetrics } = require("../src/utils/metricsAggregator");

async function main() {
  try {
    const { processedCount, maxTimestampMs } = await aggregateNewMetrics();
    const ts =
      maxTimestampMs != null
        ? new Date(maxTimestampMs).toISOString()
        : "n/a";

    console.log(
      `[metrics-agg] Processed ${processedCount} new events. Last timestamp: ${ts}`
    );
    process.exit(0);
  } catch (err) {
    console.error("[metrics-agg] Aggregation failed:", err);
    process.exit(1);
  }
}

main();
