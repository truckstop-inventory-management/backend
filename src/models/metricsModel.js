//src/models/metricsModel.js

export const MetricsModel = {
  initSchema() {
    // tables created by aggregator; placeholder
  },

  getSummary(range) {
    return Promise.resolve(null);
  },

  getLatencyHistogram(range) {
    return Promise.resolve([]);
  },

  getDailyRollup(from, to) {
    return Promise.resolve([]);
  }
};
