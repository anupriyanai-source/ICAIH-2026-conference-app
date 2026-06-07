const RegistrationService = require('../services/registrationService');

const RegistrationController = {
  async register(req, res) {
    try {
      const result = await RegistrationService.register(req.body);
      return res.status(201).json({ ok: true, ...result });
    } catch (err) {
      const status = err.status || 500;
      return res.status(status).json({ ok: false, message: err.message || 'Internal server error.' });
    }
  },

  async getAll(req, res) {
    try {
      const data = await RegistrationService.getAllRegistrations();
      return res.json({ ok: true, count: data.length, data });
    } catch (err) {
      return res.status(500).json({ ok: false, message: 'Could not fetch registrations.' });
    }
  },
};

module.exports = RegistrationController;
