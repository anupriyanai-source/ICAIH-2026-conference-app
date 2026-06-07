const ContactService = require('../services/contactService');

const ContactController = {
  async sendMessage(req, res) {
    try {
      const result = await ContactService.sendMessage(req.body);
      return res.status(201).json({ ok: true, ...result });
    } catch (err) {
      const status = err.status || 500;
      return res.status(status).json({ ok: false, message: err.message || 'Internal server error.' });
    }
  },

  async getAll(req, res) {
    try {
      const data = await ContactService.getAllMessages();
      return res.json({ ok: true, count: data.length, data });
    } catch (err) {
      return res.status(500).json({ ok: false, message: 'Could not fetch messages.' });
    }
  },
};

module.exports = ContactController;
