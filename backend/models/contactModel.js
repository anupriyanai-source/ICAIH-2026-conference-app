const pool = require('../config/db');
const generateRef = require('../utils/refId');

const ContactModel = {
  async create({ name, email, phone, subject, message }) {
    const refId = generateRef('CON');
    await pool.query(
      `INSERT INTO contacts (ref_id, name, email, phone, subject, message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [refId, name, email, phone || null, subject || 'General Enquiry', message]
    );
    return { refId };
  },

  async findAll() {
    const [rows] = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
    return rows;
  }
};

module.exports = ContactModel;
