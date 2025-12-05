import { getDb } from '../src/utils/metricsDb.js';

const db = getDb();

console.log("=== lookup_daily_rollup ===");
console.log(db.prepare("SELECT * FROM lookup_daily_rollup ORDER BY date").all());

console.log("=== lookup_latency_buckets ===");
console.log(db.prepare("SELECT * FROM lookup_latency_buckets ORDER BY date, bucket").all());
