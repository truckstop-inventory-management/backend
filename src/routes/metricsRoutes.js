import express from 'express';
import {
  ingestMetrics,
  getMetricsHealth,
} from '../controllers/metricsController.js';

const router = express.Router();

router.get('/lookup', getMetricsHealth);
router.post('/lookup', ingestMetrics);

export default router;