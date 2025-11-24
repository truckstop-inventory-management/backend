// Phase 8 — SQLite bootstrap
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'metrics.db');

export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('[SQLite] Failed to open database:', err);
  } else {
    console.log('[SQLite] Database initialized at', DB_PATH);
  }
});
