// backend/src/routes/metricsAggRoutes.js

const express = require("express");
const {
  getSummary,
  getLatencyHistogram,
  getDailyRollup,
} = require("../controllers/metricsAggController");

const router = express.Router();

// KPIs summary
router.get("/summary", getSummary);

// Latency histogram
router.get("/latency-histogram", getLatencyHistogram);

// Daily rollup time-series
router.get("/daily-rollup", getDailyRollup);

module.exports = router;
