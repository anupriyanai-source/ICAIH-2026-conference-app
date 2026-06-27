const pool = require('../config/db');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

const SubmissionLookupModel = {
  async findByEmail(email) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) return null;

    const [rows] = await pool.query(
      `SELECT submission_type, ref_id, created_at
       FROM (
         SELECT 'registration' AS submission_type, ref_id, created_at
         FROM registrations
         WHERE LOWER(TRIM(email)) = ?

         UNION ALL

         SELECT CASE
                  WHEN application_type = 'research-paper' THEN 'research paper submission'
                  WHEN application_type = 'award-nomination' THEN 'international awards nomination'
                  ELSE 'pre-conference competition application'
                END AS submission_type,
                ref_id,
                created_at
         FROM conference_applications
         WHERE LOWER(TRIM(email)) = ?

         UNION ALL

         SELECT CASE
                  WHEN inquiry_type = 'stall' THEN 'stall booking'
                  ELSE 'sponsorship application'
                END AS submission_type,
                ref_id,
                created_at
         FROM sponsor_inquiries
         WHERE LOWER(TRIM(email)) = ?
       ) AS existing_submissions
       ORDER BY created_at ASC
       LIMIT 1`,
      [normalizedEmail, normalizedEmail, normalizedEmail]
    );

    return rows[0] || null;
  }
};

module.exports = SubmissionLookupModel;
