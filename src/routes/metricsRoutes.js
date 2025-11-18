// backend/src/controllers/metricsController.js
// -----------------------------------------------------------------------------
// Metrics Controller — Phase 7: Server-Side Metrics Persistence
// -----------------------------------------------------------------------------

import fs from 'fs';
import path from 'path';

// Where to persist metrics (append-only JSONL file)
const DATA_DIR = path.join(process.cwd(), 'data');
const LOG_FILE_PATH = path.join(DATA_DIR, 'metrics-log.jsonl');

// Ensure data directory exists -------------------------------------------------
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Basic type guards -----------------------------------------------------------
function isFiniteNumber(n) {
  return typeof n === 'number' && Number.isFinite(n);
}

function isNonEmptyString(s) {
  return typeof s === 'string' && s.trim().length > 0;
}

// Validation & normalization --------------------------------------------------
function validateAndNormalizePayload(payload) {
  const errors = [];
  const normalized = {
    exportedAt: null,
    items: [],
  };

  if (!payload || typeof payload !== 'object') {
    errors.push('Payload must be an object.');
    return { ok: false, errors, normalized };
  }

  const { exportedAt, items } = payload;

  // exportedAt can be ISO string or numeric timestamp
  if (!isNonEmptyString(exportedAt) && !isFiniteNumber(exportedAt)) {
    errors.push('exportedAt is required and must be a string or number.');
  } else {
    normalized.exportedAt = exportedAt;
  }

  if (!Array.isArray(items)) {
    errors.push('items must be an array.');
  } else if (items.length === 0) {
    errors.push('items array is empty.');
  } else {
    const normalizedItems = [];

    items.forEach((rawItem, idx) => {
      const item = rawItem || {};
      const itemErrors = [];

      const {
        type,
        barcode,
        latencyMs,
        timestamp,
      } = item;

      if (!isNonEmptyString(type)) {
        itemErrors.push('type must be a non-empty string.');
      }
      if (!isNonEmptyString(barcode)) {
        itemErrors.push('barcode must be a non-empty string.');
      }
      if (!isFiniteNumber(latencyMs) || latencyMs < 0) {
        itemErrors.push('latencyMs must be a non-negative number.');
      }
      if (!isFiniteNumber(timestamp) || timestamp <= 0) {
        itemErrors.push('timestamp must be a positive number.');
      }

      if (itemErrors.length > 0) {
        errors.push(
          `Item at index ${idx} is invalid: ${itemErrors.join(' ')}`,
        );
        return; // skip this item
      }

      normalizedItems.push({
        type,
        barcode,
        latencyMs,
        timestamp,
      });
    });

    if (normalizedItems.length === 0) {
      errors.push('No valid items in payload after validation.');
    } else {
      normalized.items = normalizedItems;
    }
  }

  const ok = errors.length === 0 && normalized.items.length > 0;
  return { ok, errors, normalized };
}

// Persistence helper ----------------------------------------------------------
async function appendMetricsToFile(batch, serverTimestamp) {
  ensureDataDir();

  const record = {
    exportedAt: batch.exportedAt,
    items: batch.items,
    serverTimestamp,
  };

  const line = `${JSON.stringify(record)}\n`;
  await fs.promises.appendFile(LOG_FILE_PATH, line, 'utf8');
}

// Controllers -----------------------------------------------------------------

// GET /api/metrics/lookup
export function getMetricsHealth(req, res) {
  res.status(200).json({
    ok: true,
    message: 'Metrics ingestion endpoint ready.',
  });
}

// POST /api/metrics/lookup
export async function ingestMetrics(req, res) {
  const serverTimestamp = Date.now();
  const payload = req.body || {};

  const { ok, errors, normalized } = validateAndNormalizePayload(payload);

  if (!ok) {
    res.status(400).json({
      ok: false,
      error: 'Validation failed.',
      errors,
      serverTimestamp,
    });
    return;
  }

  try {
    await appendMetricsToFile(normalized, serverTimestamp);

    res.status(200).json({
      ok: true,
      saved: normalized.items.length,
      serverTimestamp,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to append metrics to file:', err);

    res.status(500).json({
      ok: false,
      error: 'Failed to persist metrics.',
      serverTimestamp,
    });
  }
}

// Optional internal exports for tests
export const _internal = {
  validateAndNormalizePayload,
  appendMetricsToFile,
  LOG_FILE_PATH,
};

import express from 'express';
import {
  ingestMetrics,
  getMetricsHealth,
} from '../controllers/metricsController.js';

const router = express.Router();

router.get('/lookup', getMetricsHealth);
router.post('/lookup', ingestMetrics);

export default router;