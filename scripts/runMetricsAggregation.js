// backend/scripts/runMetricsAggregation.js
// -----------------------------------------------------------------------------
// ESM version – compatible with `"type": "module"` in package.json
// -----------------------------------------------------------------------------

import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Switch working directory to backend root
process.chdir(path.join(__dirname, '..'));

// Dynamically import the aggregator (also ESM-safe)
const aggregatorModule = await import('../src/utils/metricsAggregator.js');
const {
  runIncremental,
  runFullBackfill,
  JSONL_PATH,
} = aggregatorModule;

/**
 * Parse mode from CLI args.
 */
function getModeFromArgs() {
  const arg = (process.argv[2] || '').toLowerCase();
  if (arg === 'full' || arg === '--full' || arg === '-f') return 'full';
  return 'incremental';
}

async function main() {
  const mode = getModeFromArgs();
  const runner = mode === 'full' ? runFullBackfill : runIncremental;

  try {
    console.log(
      `[metrics-agg] Starting ${mode} aggregation from JSONL: ${JSONL_PATH}`
    );

    const result = await runner();
    const { processedCount, maxTimestampMs } = result;

    const ts = maxTimestampMs
      ? new Date(maxTimestampMs).toISOString()
      : 'n/a';

    console.log(
      `[metrics-agg] DONE: processed=${processedCount}, lastTs=${ts}`
    );

    process.exit(0);
  } catch (err) {
    console.error('[metrics-agg] FAILED:', err);
    process.exit(1);
  }
}

main();
