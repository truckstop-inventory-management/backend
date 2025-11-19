// backend/src/routes/metricsRoutes.js
import express from 'express';
import {
  ingestMetrics,
  getMetricsHealth,
  getRecentMetricsPreview
} from '../controllers/metricsController.js';

const router = express.Router();

router.get('/lookup', getMetricsHealth);
router.post('/lookup', ingestMetrics);
router.post('/recent', getRecentMetricsPreview);

export default router;