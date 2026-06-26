const pool = require('../config/db');

function buildSequentialRef(inquiryType, number) {
  const prefix = inquiryType === 'stall' ? 'STL' : 'SPO';
  return `${prefix}-${String(number).padStart(3, '0')}`;
}

async function getNextSponsorNumber(conn, inquiryType) {
  const sequenceKey = inquiryType === 'stall' ? 'stall' : 'sponsor';

  await conn.query(
    `INSERT IGNORE INTO sponsor_inquiry_sequence (sequence_key, last_number)
     VALUES (?, 0)`,
    [sequenceKey]
  );

  const [rows] = await conn.query(
    `SELECT last_number
     FROM sponsor_inquiry_sequence
     WHERE sequence_key = ?
     FOR UPDATE`,
    [sequenceKey]
  );

  const nextNumber = Number(rows?.[0]?.last_number || 0) + 1;

  await conn.query(
    `UPDATE sponsor_inquiry_sequence
     SET last_number = ?
     WHERE sequence_key = ?`,
    [nextNumber, sequenceKey]
  );

  return nextNumber;
}

const SponsorModel = {
  async create({
    companyName,
    contactPerson,
    email,
    phone,
    sponsorTier,
    feeAmount,
    paymentStatus,
    paymentMethod,
    paymentReference,
    message,
    inquiryType = 'sponsor'
  }) {
    const normalizedInquiryType = inquiryType === 'stall' ? 'stall' : 'sponsor';
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const nextNumber = await getNextSponsorNumber(conn, normalizedInquiryType);
      const refId = buildSequentialRef(normalizedInquiryType, nextNumber);

      await conn.query(
        `INSERT INTO sponsor_inquiries
         (ref_id, inquiry_type, company_name, contact_person, email, phone, sponsor_tier, fee_amount, payment_status, payment_method, payment_reference, message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          refId,
          normalizedInquiryType,
          companyName,
          contactPerson,
          email,
          phone || null,
          sponsorTier,
          feeAmount || 0,
          paymentStatus || 'pending-verification',
          paymentMethod || null,
          paymentReference || null,
          message || null
        ]
      );

      await conn.commit();
      return { refId };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  async findAll() {
    const [rows] = await pool.query('SELECT * FROM sponsor_inquiries ORDER BY created_at DESC');
    return rows;
  }
};

module.exports = SponsorModel;
