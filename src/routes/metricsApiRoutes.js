// backend/src/routes/metricsApiRoutes.js

import express from 'express';
import {
  getMetricsSummary,
  getLatencyHistogram,
  getDailyRollup,
} from '../controllers/metricsApiController.js';

const router = express.Router();

router.get('/summary', getMetricsSummary);
router.get('/latency-histogram', getLatencyHistogram);
router.get('/daily-rollup', getDailyRollup);

export default router;
