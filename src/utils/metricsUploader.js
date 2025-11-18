// src/utils/metricsUploader.js
// -----------------------------------------------------------------------------
// Phase 7 — Metrics Uploader
// -----------------------------------------------------------------------------
// Responsibilities:
// - Accept lookup metric samples from the client (hits/misses/errors + latency).
// - Queue samples in-memory and batch-upload them to the backend.
// - POST batches to /api/metrics/lookup.
// - Expose status for MetricsDashboard (pending count, last upload, last error).
//
// This module is intentionally framework-agnostic: it uses basic JS and fetch.
// React components (e.g., MetricsDashboard) can subscribe via getSnapshot()
// polling or by reading the exported accessors.
// -----------------------------------------------------------------------------

const METRICS_ENDPOINT = '/api/metrics/lookup';

// In-memory queue of metric items waiting to be uploaded.
// Shape per item:
//   { type: string, barcode: string, latencyMs: number, timestamp: number }
const queue = [];

// Uploader state (for dashboard / debugging)
const state = {
  pendingCount: 0,
  lastUploadAt: null,         // number | null (timestamp ms)
  lastUploadOk: null,         // boolean | null
  lastUploadError: null,      // string | null
  lastServerTimestamp: null,  // number | null
  isUploading: false,
  autoUploadEnabled: false,
};

// Auto-upload timer handle
let autoUploadTimerId = null;

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function updateState(partial) {
  Object.assign(state, partial);
}

function getNowISOString() {
  return new Date().toISOString();
}

// Simple exponential backoff helper: given attempt (0,1,2...)
// returns delay ms (bounded).
function getBackoffDelay(attempt) {
  const base = 500; // 0.5s
  const max = 10000; // 10s
  const delay = base * (2 ** attempt);
  return Math.min(max, delay);
}

// -----------------------------------------------------------------------------
// Public API — used by lookupMetrics / app code
// -----------------------------------------------------------------------------

/**
 * Enqueue a single metric sample for upload.
 * @param {Object} sample
 * @param {string} sample.type - e.g., "hit" | "miss" | "error"
 * @param {string} sample.barcode
 * @param {number} sample.latencyMs
 * @param {number} sample.timestamp
 */
export function enqueueMetricSample(sample) {
  if (!sample || typeof sample !== 'object') return;

  const {
    type,
    barcode,
    latencyMs,
    timestamp,
  } = sample;

  // Basic client-side sanity checks; we still validate on the server.
  if (typeof type !== 'string' || !type.trim()) return;
  if (typeof barcode !== 'string' || !barcode.trim()) return;
  if (typeof latencyMs !== 'number' || !Number.isFinite(latencyMs)) return;
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) return;

  queue.push({
    type: type.trim(),
    barcode: barcode.trim(),
    latencyMs,
    timestamp,
  });

  updateState({ pendingCount: queue.length });
}

/**
 * Returns a snapshot of the uploader state for dashboards / debugging.
 */
export function getMetricsUploadState() {
  return { ...state };
}

/**
 * Returns how many samples are currently queued.
 */
export function getPendingMetricsCount() {
  return queue.length;
}

/**
 * Enable or disable auto-upload. When enabled, we flush periodically.
 */
export function setAutoUploadEnabled(enabled) {
  const boolEnabled = Boolean(enabled);
  state.autoUploadEnabled = boolEnabled;

  if (boolEnabled) {
    startAutoUploadTimer();
  } else {
    stopAutoUploadTimer();
  }
}

function startAutoUploadTimer() {
  if (autoUploadTimerId != null) return;

  autoUploadTimerId = window.setInterval(() => {
    // Do not schedule if already uploading.
    if (!state.isUploading && queue.length > 0) {
      flushMetrics({ reason: 'auto' }).catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Auto metrics upload failed:', err);
      });
    }
  }, 15000); // flush every 15s (tune as desired)
}

function stopAutoUploadTimer() {
  if (autoUploadTimerId != null) {
    window.clearInterval(autoUploadTimerId);
    autoUploadTimerId = null;
  }
}

/**
 * Manually flush current queue to the backend.
 * Returns a promise that resolves when upload finishes (success or failure).
 */
export async function flushMetrics(options = {}) {
  const { reason = 'manual' } = options;

  if (queue.length === 0) {
    // Nothing to do.
    updateState({
      lastUploadError: null,
      lastUploadOk: true,
    });
    return;
  }

  if (state.isUploading) {
    // Avoid overlapping uploads.
    return;
  }

  state.isUploading = true;

  // Build batch payload
  const items = queue.splice(0, queue.length);
  const exportedAt = getNowISOString();

  // Snapshot for state before network call
  const batchSize = items.length;

  updateState({
    pendingCount: queue.length,
    lastUploadError: null,
  });

  // Basic retry with exponential backoff
  let attempt = 0;
  const maxAttempts = 3;
  let lastError = null;
  let responseJson = null;

  while (attempt < maxAttempts) {
    try {
      // eslint-disable-next-line no-console
      console.log(
        `[metricsUploader] Upload attempt ${attempt + 1}/${maxAttempts} (reason=${reason}, batchSize=${batchSize})`,
      );

      // eslint-disable-next-line no-await-in-loop
      const res = await fetch(METRICS_ENDPOINT + '/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exportedAt,
          items,
        }),
      });

      // eslint-disable-next-line no-await-in-loop
      const json = await res.json();
      responseJson = json;

      if (!res.ok || !json || json.ok !== true) {
        const message = json && json.error
          ? json.error
          : `HTTP ${res.status} during metrics upload`;
        throw new Error(message);
      }

      // Success path
      const now = Date.now();
      updateState({
        lastUploadAt: now,
        lastUploadOk: true,
        lastUploadError: null,
        lastServerTimestamp: json.serverTimestamp || null,
      });

      // eslint-disable-next-line no-console
      console.log(
        '[metricsUploader] Upload success:',
        {
          saved: json.saved,
          serverTimestamp: json.serverTimestamp,
        },
      );

      state.isUploading = false;
      return;
    } catch (err) {
      lastError = err;
      attempt += 1;

      if (attempt >= maxAttempts) {
        break;
      }

      const delay = getBackoffDelay(attempt - 1);

      // eslint-disable-next-line no-console
      console.warn(
        `[metricsUploader] Upload failed (attempt ${attempt}/${maxAttempts}). Retrying in ${delay}ms`,
        err,
      );

      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        setTimeout(resolve, delay);
      });
    }
  }

  // If we reach here, upload failed after retries.
  // Put the items back at the front of the queue to retry later.
  queue.unshift(...items);

  const now = Date.now();
  const errorMessage = lastError
    ? lastError.message || String(lastError)
    : 'Unknown upload error';

  // eslint-disable-next-line no-console
  console.error('[metricsUploader] Upload failed after retries:', lastError, {
    responseJson,
  });

  updateState({
    pendingCount: queue.length,
    lastUploadAt: now,
    lastUploadOk: false,
    lastUploadError: errorMessage,
  });

  state.isUploading = false;
}

/**
 * DEV helpers to be wired to buttons in MetricsDashboard or window for testing.
 */
export function debugMetricsUploaderExposeToWindow() {
  if (typeof window === 'undefined') return;

  // eslint-disable-next-line no-console
  console.log('[metricsUploader] Exposing debug helpers on window.debugMetricsUploader');
  window.debugMetricsUploader = {
    enqueueMetricSample,
    flushMetrics,
    getMetricsUploadState,
    getPendingMetricsCount,
    setAutoUploadEnabled,
  };
}

// Optional: call this once during app startup to expose helpers in DEV.
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  debugMetricsUploaderExposeToWindow();
}