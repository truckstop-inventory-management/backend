//src/controller/metricsV2Controller.js


export const metricsV2Controller = {
  async getSummary(req, res) {
    return res.json({ ok: true, summary: {} });
  },

  async getLatencyHistogram(req, res) {
    return res.json({ ok: true, buckets: [] });
  },

  async getDailyRollup(req, res) {
    return res.json({ ok: true, rows: [] });
  },

  async getRawSample(req, res) {
    return res.json({ ok: true, items: [] });
  }
};
