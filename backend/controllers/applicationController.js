const ApplicationService = require('../services/applicationService');

const ApplicationController = {
  async submit(req, res) {
    try {
      const result = await ApplicationService.submit(req.body, req.files || {});
      return res.status(201).json({ ok: true, ...result });
    } catch (err) {
      console.error('Application submit error:', err);
      const status = err.status || 500;
      return res.status(status).json({
        ok: false,
        message: err.message || 'Application submission failed.',
        hint: status === 500 ? 'Check backend .env, MySQL credentials, and database connection.' : undefined
      });
    }
  },

  async getAll(req, res) {
    try {
      const data = await ApplicationService.getAllApplications();
      return res.json({ ok: true, count: data.length, data });
    } catch (err) {
      return res.status(500).json({ ok: false, message: 'Could not fetch applications.' });
    }
  }
};

module.exports = ApplicationController;
