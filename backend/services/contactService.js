const ContactModel = require('../models/contactModel');

function sanitize(val) {
  return String(val || '').trim();
}
function isEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val || '').trim());
}

const ContactService = {
  async sendMessage(body) {
    const name = sanitize(body.name);
    const email = sanitize(body.email).toLowerCase();
    const phone = sanitize(body.phone);
    const subject = sanitize(body.subject) || 'General Enquiry';
    const message = sanitize(body.message);

    if (!name || !email || !message) {
      throw { status: 400, message: 'Name, email, and message are required.' };
    }
    if (!isEmail(email)) {
      throw { status: 400, message: 'Please enter a valid email address.' };
    }

    const { refId } = await ContactModel.create({ name, email, phone, subject, message });
    return { message: 'Message sent successfully.', id: refId };
  },

  async getAllMessages() {
    return ContactModel.findAll();
  }
};

module.exports = ContactService;
