//src/routes/metricsV2Routes.js

import express from 'express';
import { metricsV2Controller } from '../controllers/metricsV2Controller.js';

const router = express.Router();

router.get('/summary', metricsV2Controller.getSummary);
router.get('/latency-histogram', metricsV2Controller.getLatencyHistogram);
router.get('/daily-rollup', metricsV2Controller.getDailyRollup);
router.get('/raw-sample', metricsV2Controller.getRawSample);

export default router;
