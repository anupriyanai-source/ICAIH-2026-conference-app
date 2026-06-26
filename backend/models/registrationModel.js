const pool = require('../config/db');

async function getNextRegistrationRef(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS registration_sequence (
      id INT PRIMARY KEY,
      last_number INT NOT NULL DEFAULT 0
    )
  `);

  await conn.query(`
    INSERT IGNORE INTO registration_sequence (id, last_number)
    SELECT 1, COALESCE(MAX(CAST(SUBSTRING(ref_id, 11) AS UNSIGNED)), 0)
    FROM registrations
    WHERE ref_id LIKE 'ICAIH-2026%'
  `);

  const [rows] = await conn.query('SELECT last_number FROM registration_sequence WHERE id = 1 FOR UPDATE');
  const nextNumber = Number(rows[0]?.last_number || 0) + 1;
  await conn.query('UPDATE registration_sequence SET last_number = ? WHERE id = 1', [nextNumber]);

  return `ICAIH-2026${String(nextNumber).padStart(3, '0')}`;
}

const RegistrationModel = {
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM registrations WHERE email = ? LIMIT 1', [email]);
    return rows[0] || null;
  },

  async create({
    name,
    email,
    phone,
    organization,
    role,
    category,
    feeAmount,
    discountPercent,
    bulkOffer,
    studentCount,
    paymentConfirmed,
    paymentStatus,
    paymentMethod,
    paymentReference,
    paymentScreenshot
  }) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();
      const refId = await getNextRegistrationRef(conn);

      await conn.query(
        `INSERT INTO registrations
         (ref_id, name, email, phone, organization, role, category, fee_amount, discount_percent, bulk_offer, student_count, payment_confirmed, payment_status, payment_method, payment_reference, payment_screenshot, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 330 MINUTE))`,
        [
          refId,
          name,
          email,
          phone,
          organization,
          role,
          category,
          feeAmount,
          discountPercent,
          bulkOffer || null,
          studentCount || null,
          paymentConfirmed ? 1 : 0,
          paymentStatus || 'pending-verification',
          paymentMethod || null,
          paymentReference || null,
          paymentScreenshot || null
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
    const [rows] = await pool.query('SELECT * FROM registrations ORDER BY created_at DESC');
    return rows;
  }
};

module.exports = RegistrationModel;
