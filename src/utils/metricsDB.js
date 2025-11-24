// backend/src/utils/metricsDb.js
// SQLite wrapper for Phase 8 metrics aggregation.

const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const DB_PATH = path.join(__dirname, "..", "..", "data", "metrics.db");

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

function getDb() {
  if (dbInstance) return dbInstance;

  ensureDirExists(path.dirname(DB_PATH));
  dbInstance = new Database(DB_PATH);
  dbInstance.pragma("journal_mode = WAL");
  initSchema(dbInstance);
  return dbInstance;
}

function getMeta(key, defaultValue = null) {
  const db = getDb();
  const row = db
    .prepare(`SELECT value FROM metrics_meta WHERE key = ?`)
    .get(key);
  if (!row) return defaultValue;
  const num = Number(row.value);
  return Number.isNaN(num) ? row.value : num;
}

function setMeta(key, value) {
  const db = getDb();
  db.prepare(
    `
      INSERT INTO metrics_meta (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `
  ).run(key, String(value));
}

module.exports = {
  getDb,
  getMeta,
  setMeta,
  DB_PATH,
};
