// backend/src/utils/metricsOffset.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const OFFSET_PATH = path.join(__dirname, '..', '..', 'data', 'metrics-offset.json');

export function loadOffset() {
  try {
    if (!fs.existsSync(OFFSET_PATH)) {
      return { lastOffset: 0 };
    }
    const raw = fs.readFileSync(OFFSET_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    // If file is corrupted, reset to 0
    return { lastOffset: 0 };
  }
}

export function saveOffset(offset) {
  const payload = { lastOffset: Number(offset) || 0 };
  fs.writeFileSync(OFFSET_PATH, JSON.stringify(payload, null, 2));
}
