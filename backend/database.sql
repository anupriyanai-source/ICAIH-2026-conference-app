CREATE DATABASE IF NOT EXISTS conference_db;
USE conference_db;

CREATE TABLE IF NOT EXISTS registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ref_id VARCHAR(40) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  organization VARCHAR(200) NOT NULL,
  role VARCHAR(80) DEFAULT 'Delegate',
  category VARCHAR(80) DEFAULT 'General',
  fee_amount DECIMAL(10,2) DEFAULT 0,
  discount_percent INT DEFAULT 0,
  bulk_offer VARCHAR(120),
  student_count INT,
  payment_confirmed TINYINT(1) DEFAULT 0,
  payment_status VARCHAR(30) DEFAULT 'pending',
  razorpay_order_id VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  razorpay_signature VARCHAR(255),
  payment_verified_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registration_sequence (
  id INT PRIMARY KEY,
  last_number INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ref_id VARCHAR(40) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30),
  subject VARCHAR(200) DEFAULT 'General Enquiry',
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sponsor_inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ref_id VARCHAR(40) UNIQUE NOT NULL,
  company_name VARCHAR(200) NOT NULL,
  contact_person VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30),
  sponsor_tier VARCHAR(80) NOT NULL,
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- For an already existing database, the backend initDB.js automatically adds these columns if missing.
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30) DEFAULT 'pending';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(100);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS razorpay_signature VARCHAR(255);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_verified_at DATETIME;

-- Remove old payment reference column from existing databases because UTR is no longer collected.
ALTER TABLE registrations DROP COLUMN IF EXISTS payment_reference;
