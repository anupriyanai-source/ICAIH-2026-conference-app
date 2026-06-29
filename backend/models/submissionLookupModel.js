const pool = require('../config/db');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

async function findOne(query, params) {
  const [rows] = await pool.query(query, params);
  return rows[0] || null;
}

const SubmissionLookupModel = {
  async findRegistrationByEmail(email) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) return null;

    return findOne(
      `SELECT 'registration' AS submission_type, ref_id, created_at
       FROM registrations
       WHERE LOWER(TRIM(email)) = ?
       ORDER BY created_at ASC
       LIMIT 1`,
      [normalizedEmail]
    );
  },

  async findApplicationByEmailAndType(email, applicationType) {
    const normalizedEmail = normalizeEmail(email);
    const normalizedType = String(applicationType || '').trim();
    if (!normalizedEmail || !normalizedType) return null;

    return findOne(
      `SELECT application_type AS submission_type, ref_id, created_at
       FROM conference_applications
       WHERE LOWER(TRIM(email)) = ?
         AND application_type = ?
       ORDER BY created_at ASC
       LIMIT 1`,
      [normalizedEmail, normalizedType]
    );
  },

  async findSponsorByEmailAndType(email, inquiryType) {
    const normalizedEmail = normalizeEmail(email);
    const normalizedType = String(inquiryType || '').trim();
    if (!normalizedEmail || !normalizedType) return null;

    return findOne(
      `SELECT inquiry_type AS submission_type, ref_id, created_at
       FROM sponsor_inquiries
       WHERE LOWER(TRIM(email)) = ?
         AND inquiry_type = ?
       ORDER BY created_at ASC
       LIMIT 1`,
      [normalizedEmail, normalizedType]
    );
  }
};

module.exports = SubmissionLookupModel;
