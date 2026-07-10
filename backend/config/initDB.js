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
        tsi_membership_number VARCHAR(100),
        fee_amount          DECIMAL(10,2) DEFAULT 0,
        discount_percent    INT DEFAULT 0,
        bulk_offer          VARCHAR(120),
        student_count       INT,
        payment_confirmed   TINYINT(1) DEFAULT 0,
        payment_status      VARCHAR(30) DEFAULT 'pending-verification',
        payment_method      VARCHAR(80),
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
        inquiry_type    VARCHAR(20) DEFAULT 'sponsor',
        company_name    VARCHAR(200) NOT NULL,
        contact_person  VARCHAR(150) NOT NULL,
        email           VARCHAR(150) NOT NULL,
        phone           VARCHAR(30),
        sponsor_tier    VARCHAR(80)  NOT NULL,
        fee_amount      DECIMAL(10,2) DEFAULT 0,
        payment_status  VARCHAR(30) DEFAULT 'pending-verification',
        payment_method   VARCHAR(80),
        message         TEXT,
        created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS sponsor_inquiry_sequence (
        sequence_key VARCHAR(20) PRIMARY KEY,
        last_number INT NOT NULL DEFAULT 0
      )
    `);

    try {
      await conn.query(`
        ALTER TABLE sponsor_inquiries
        ADD COLUMN inquiry_type VARCHAR(20) DEFAULT 'sponsor'
        AFTER ref_id
      `);
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') throw error;
    }



    // ── conference_applications ──────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS conference_applications (
        id                          INT AUTO_INCREMENT PRIMARY KEY,
        ref_id                      VARCHAR(40) UNIQUE NOT NULL,
        application_type            VARCHAR(60) NOT NULL,
        full_name                   VARCHAR(150) NOT NULL,
        email                       VARCHAR(150) NOT NULL,
        mobile                      VARCHAR(30) NOT NULL,
        whatsapp                    VARCHAR(30),
        city_state                  VARCHAR(120),
        institution_name            VARCHAR(220) NOT NULL,
        department                  VARCHAR(120),
        designation                 VARCHAR(120),
        participant_category        VARCHAR(120),
        competition_category        VARCHAR(150),
        participation_type          VARCHAR(40),
        team_name                   VARCHAR(150),
        team_members_count          INT,
        team_member_names           TEXT,
        submission_title            VARCHAR(250) NOT NULL,
        topic_theme                 VARCHAR(150),
        short_description           TEXT,
        expected_impact             TEXT,
        paper_track                 VARCHAR(150),
        presentation_type           VARCHAR(150),
        abstract_text               TEXT,
        keywords                    VARCHAR(250),
        corresponding_author        VARCHAR(150),
        co_author_names             TEXT,
        guide_name                  VARCHAR(150),
        preferred_presentation_mode TEXT,
        attend_in_person            VARCHAR(20),
        file_upload_path            VARCHAR(500),
        file_upload_original_name   VARCHAR(255),
        id_upload_path              VARCHAR(500),
        id_upload_original_name     VARCHAR(255),
        declaration_confirmed       TINYINT(1) DEFAULT 0,
        status                      VARCHAR(40) DEFAULT 'Pending',
        reviewer_comments           TEXT,
        applicant_confirm_name     VARCHAR(150),
        applicant_confirm_date     VARCHAR(40),
        applicant_signature        VARCHAR(150),
        created_at                  DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS application_sequence (
        type VARCHAR(40) PRIMARY KEY,
        last_number INT NOT NULL DEFAULT 0
      )
    `);


    const applicationColumns = [
      ['ref_id', 'VARCHAR(40) UNIQUE'],
      ['application_type', 'VARCHAR(60) NOT NULL'],
      ['full_name', 'VARCHAR(150) NOT NULL'],
      ['email', 'VARCHAR(150) NOT NULL'],
      ['mobile', 'VARCHAR(30) NOT NULL'],
      ['whatsapp', 'VARCHAR(30)'],
      ['city_state', 'VARCHAR(120)'],
      ['institution_name', 'VARCHAR(220) NOT NULL'],
      ['department', 'VARCHAR(120)'],
      ['designation', 'VARCHAR(120)'],
      ['participant_category', 'TEXT'],
      ['competition_category', 'TEXT'],
      ['participation_type', 'VARCHAR(40)'],
      ['team_name', 'VARCHAR(150)'],
      ['team_members_count', 'INT'],
      ['team_member_names', 'TEXT'],
      ['submission_title', 'VARCHAR(250) NOT NULL'],
      ['topic_theme', 'TEXT'],
      ['short_description', 'TEXT'],
      ['expected_impact', 'TEXT'],
      ['paper_track', 'VARCHAR(150)'],
      ['presentation_type', 'TEXT'],
      ['abstract_text', 'TEXT'],
      ['keywords', 'VARCHAR(250)'],
      ['corresponding_author', 'VARCHAR(150)'],
      ['co_author_names', 'TEXT'],
      ['guide_name', 'VARCHAR(150)'],
      ['preferred_presentation_mode', 'TEXT'],
      ['attend_in_person', 'VARCHAR(20)'],
      ['file_upload_path', 'VARCHAR(500)'],
      ['file_upload_original_name', 'VARCHAR(255)'],
      ['id_upload_path', 'VARCHAR(500)'],
      ['id_upload_original_name', 'VARCHAR(255)'],
      ['declaration_confirmed', 'TINYINT(1) DEFAULT 0'],
      ['status', "VARCHAR(40) DEFAULT 'Pending'"],
      ['reviewer_comments', 'TEXT'],
      ['applicant_confirm_name', 'VARCHAR(150)'],
      ['applicant_confirm_date', 'VARCHAR(40)'],
      ['applicant_signature', 'VARCHAR(150)']
    ];

    for (const [column, definition] of applicationColumns) {
      const [existing] = await conn.query(`SHOW COLUMNS FROM conference_applications LIKE ?`, [column]);

      if (existing.length === 0) {
        await conn.query(`ALTER TABLE conference_applications ADD COLUMN ${column} ${definition}`);
      }
    }

    const registrationColumns = [
      ['tsi_membership_number', 'VARCHAR(100)'],
      ['fee_amount', 'DECIMAL(10,2) DEFAULT 0'],
      ['discount_percent', 'INT DEFAULT 0'],
      ['bulk_offer', 'VARCHAR(120)'],
      ['student_count', 'INT'],
      ['payment_confirmed', 'TINYINT(1) DEFAULT 0'],
      ['payment_status', "VARCHAR(30) DEFAULT 'pending-verification'"],
      ['payment_method', 'VARCHAR(80)'],
    ];

    for (const [column, definition] of registrationColumns) {
      const [existing] = await conn.query(`SHOW COLUMNS FROM registrations LIKE ?`, [column]);

      if (existing.length === 0) {
        await conn.query(`ALTER TABLE registrations ADD COLUMN ${column} ${definition}`);
      }
    }



    const sponsorColumns = [
      ['fee_amount', 'DECIMAL(10,2) DEFAULT 0'],
      ['payment_status', "VARCHAR(30) DEFAULT 'pending-verification'"],
      ['payment_method', 'VARCHAR(80)'],
    ];

    for (const [column, definition] of sponsorColumns) {
      const [existing] = await conn.query(`SHOW COLUMNS FROM sponsor_inquiries LIKE ?`, [column]);

      if (existing.length === 0) {
        await conn.query(`ALTER TABLE sponsor_inquiries ADD COLUMN ${column} ${definition}`);
      }
    }


    // Remove old payment gateway / screenshot columns that are no longer used.
    const obsoleteRegistrationColumns = [
      'payment_reference',
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

    const obsoleteSponsorColumns = [
      'payment_reference',
      'payment_screenshot'
    ];

    for (const column of obsoleteSponsorColumns) {
      const [existing] = await conn.query(`SHOW COLUMNS FROM sponsor_inquiries LIKE ?`, [column]);

      if (existing.length > 0) {
        await conn.query(`ALTER TABLE sponsor_inquiries DROP COLUMN ${column}`);
      }
    }

    console.log('✅  Database tables ready.');
  } finally {
    conn.release();
  }
}

module.exports = initDB;
