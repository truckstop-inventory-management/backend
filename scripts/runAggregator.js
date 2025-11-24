// Phase 8 — Node script to run incremental aggregation
import { metricsAggregator } from '../src/controllers/metricsAggregator.js';

(async () => {
  await metricsAggregator.runIncremental();
})();
