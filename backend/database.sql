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
  payment_status VARCHAR(30) DEFAULT 'pending-verification',
  payment_reference VARCHAR(120),
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
  fee_amount DECIMAL(10,2) DEFAULT 0,
  payment_status VARCHAR(30) DEFAULT 'pending-verification',
  payment_reference VARCHAR(120),
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- For existing databases, backend/config/initDB.js automatically adds required columns and removes old columns.
-- Manual Workbench-safe migration for existing registrations table:
SET @db_name := DATABASE();

-- Sponsor inquiry payment columns for existing databases.
SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'sponsor_inquiries' AND COLUMN_NAME = 'fee_amount') = 0,
  'ALTER TABLE sponsor_inquiries ADD COLUMN fee_amount DECIMAL(10,2) DEFAULT 0',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'sponsor_inquiries' AND COLUMN_NAME = 'payment_status') = 0,
  'ALTER TABLE sponsor_inquiries ADD COLUMN payment_status VARCHAR(30) DEFAULT ''pending-verification''',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'sponsor_inquiries' AND COLUMN_NAME = 'payment_reference') = 0,
  'ALTER TABLE sponsor_inquiries ADD COLUMN payment_reference VARCHAR(120)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'registrations' AND COLUMN_NAME = 'payment_status') = 0,
  'ALTER TABLE registrations ADD COLUMN payment_status VARCHAR(30) DEFAULT 'pending-verification'',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'registrations' AND COLUMN_NAME = 'payment_reference') = 0,
  'ALTER TABLE registrations ADD COLUMN payment_reference VARCHAR(120)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Clean up old screenshot / payment-gateway columns if they exist.
SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'registrations' AND COLUMN_NAME = 'payment_screenshot') > 0, 'ALTER TABLE registrations DROP COLUMN payment_screenshot', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'registrations' AND COLUMN_NAME = 'payment_submitted_at') > 0, 'ALTER TABLE registrations DROP COLUMN payment_submitted_at', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'registrations' AND COLUMN_NAME = 'payment_verified_at') > 0, 'ALTER TABLE registrations DROP COLUMN payment_verified_at', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'registrations' AND COLUMN_NAME = 'razorpay_order_id') > 0, 'ALTER TABLE registrations DROP COLUMN razorpay_order_id', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'registrations' AND COLUMN_NAME = 'razorpay_payment_id') > 0, 'ALTER TABLE registrations DROP COLUMN razorpay_payment_id', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'registrations' AND COLUMN_NAME = 'razorpay_signature') > 0, 'ALTER TABLE registrations DROP COLUMN razorpay_signature', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'registrations' AND COLUMN_NAME = 'payment_confirmed_at') > 0, 'ALTER TABLE registrations DROP COLUMN payment_confirmed_at', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
