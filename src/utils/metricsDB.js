// backend/src/utils/metricsDb.js

import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'metrics.db');

let dbInstance = null;

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function initSchema(db) {
  // Meta table to track progress (e.g., last processed timestamp)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS metrics_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `).run();

  // Daily summary metrics
  db.prepare(`
    CREATE TABLE IF NOT EXISTS lookup_daily_rollup (
      date TEXT PRIMARY KEY,
      total INTEGER NOT NULL DEFAULT 0,
      hits INTEGER NOT NULL DEFAULT 0,
      misses INTEGER NOT NULL DEFAULT 0,
      errors INTEGER NOT NULL DEFAULT 0,
      latency_p50 REAL,
      latency_p90 REAL,
      latency_avg REAL
    )
  `).run();

  // Latency bucket counts per day
  db.prepare(`
    CREATE TABLE IF NOT EXISTS lookup_latency_buckets (
      date TEXT NOT NULL,
      bucket TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (date, bucket)
    )
  `).run();
}

export function getDb() {
  if (dbInstance) return dbInstance;

  ensureDirExists(path.dirname(DB_PATH));
  dbInstance = new Database(DB_PATH);
  dbInstance.pragma('journal_mode = WAL');
  initSchema(dbInstance);
  return dbInstance;
}

export function getMeta(key, defaultValue = null) {
  const db = getDb();
  const row = db
    .prepare(`SELECT value FROM metrics_meta WHERE key = ?`)
    .get(key);
  if (!row) return defaultValue;
  const num = Number(row.value);
  return Number.isNaN(num) ? row.value : num;
}

export function setMeta(key, value) {
  const db = getDb();
  db.prepare(
    `
      INSERT INTO metrics_meta (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `
  ).run(key, String(value));
}

export { DB_PATH };
