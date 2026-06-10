const pool = require('../config/db');
const generateRef = require('../utils/refId');

const SponsorModel = {
  async create({
    companyName,
    contactPerson,
    email,
    phone,
    sponsorTier,
    feeAmount,
    paymentStatus,
    paymentReference,
    message
  }) {
    const refId = generateRef('SPO');
    await pool.query(
      `INSERT INTO sponsor_inquiries
       (ref_id, company_name, contact_person, email, phone, sponsor_tier, fee_amount, payment_status, payment_reference, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        refId,
        companyName,
        contactPerson,
        email,
        phone || null,
        sponsorTier,
        feeAmount || 0,
        paymentStatus || 'pending-verification',
        paymentReference || null,
        message || null
      ]
    );
    return { refId };
  },

  async findAll() {
    const [rows] = await pool.query('SELECT * FROM sponsor_inquiries ORDER BY created_at DESC');
    return rows;
  }
};

module.exports = SponsorModel;
