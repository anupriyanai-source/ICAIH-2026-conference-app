const pool = require('../config/db');

async function initDB() {
  const conn = await pool.getConnection();
  try {
    // ── registrations ────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id                  INT AUTO_INCREMENT PRIMARY KEY,
        ref_id              VARCHAR(40) UNIQUE NOT NULL,
        name                VARCHAR(150) NOT NULL,
        email               VARCHAR(150) NOT NULL,
        phone               VARCHAR(30)  NOT NULL,
        organization        VARCHAR(200) NOT NULL,
        role                VARCHAR(80)  DEFAULT 'Attendee',
        category            VARCHAR(80)  DEFAULT 'General',
        fee_amount          DECIMAL(10,2) DEFAULT 0,
        discount_percent    INT DEFAULT 0,
        bulk_offer          VARCHAR(120),
        student_count       INT,
        payment_confirmed   TINYINT(1) DEFAULT 0,
        payment_status      VARCHAR(30) DEFAULT 'pending-verification',
        payment_reference   VARCHAR(120),
        created_at          DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS registration_sequence (
        id INT PRIMARY KEY,
        last_number INT NOT NULL DEFAULT 0
      )
    `);

    // ── contacts ─────────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        ref_id      VARCHAR(40) UNIQUE NOT NULL,
        name        VARCHAR(150) NOT NULL,
        email       VARCHAR(150) NOT NULL,
        phone       VARCHAR(30),
        subject     VARCHAR(200) DEFAULT 'General Enquiry',
        message     TEXT         NOT NULL,
        created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ── sponsor_inquiries ─────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS sponsor_inquiries (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        ref_id          VARCHAR(40) UNIQUE NOT NULL,
        company_name    VARCHAR(200) NOT NULL,
        contact_person  VARCHAR(150) NOT NULL,
        email           VARCHAR(150) NOT NULL,
        phone           VARCHAR(30),
        sponsor_tier    VARCHAR(80)  NOT NULL,
        message         TEXT,
        created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const registrationColumns = [
      ['fee_amount', 'DECIMAL(10,2) DEFAULT 0'],
      ['discount_percent', 'INT DEFAULT 0'],
      ['bulk_offer', 'VARCHAR(120)'],
      ['student_count', 'INT'],
      ['payment_confirmed', 'TINYINT(1) DEFAULT 0'],
      ['payment_status', "VARCHAR(30) DEFAULT 'pending-verification'"],
      ['payment_reference', 'VARCHAR(120)']
    ];

    for (const [column, definition] of registrationColumns) {
      const [existing] = await conn.query(`SHOW COLUMNS FROM registrations LIKE ?`, [column]);

      if (existing.length === 0) {
        await conn.query(`ALTER TABLE registrations ADD COLUMN ${column} ${definition}`);
      }
    }



    // Remove old payment gateway / screenshot columns that are no longer used.
    const obsoleteRegistrationColumns = [
      'payment_screenshot',
      'payment_submitted_at',
      'payment_verified_at',
      'razorpay_order_id',
      'razorpay_payment_id',
      'razorpay_signature',
      'payment_confirmed_at'
    ];

    for (const column of obsoleteRegistrationColumns) {
      const [existing] = await conn.query(`SHOW COLUMNS FROM registrations LIKE ?`, [column]);

      if (existing.length > 0) {
        await conn.query(`ALTER TABLE registrations DROP COLUMN ${column}`);
      }
    }

    console.log('✅  Database tables ready.');
  } finally {
    conn.release();
  }
}

module.exports = initDB;
