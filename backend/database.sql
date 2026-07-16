CREATE DATABASE IF NOT EXISTS conference_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE conference_db;

-- Registrations table for conference attendees
CREATE TABLE IF NOT EXISTS registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ref_id VARCHAR(40) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  organization VARCHAR(200) NOT NULL,
  role VARCHAR(80) DEFAULT 'Attendee',
  category VARCHAR(80) DEFAULT 'General',
  fee_amount DECIMAL(10,2) DEFAULT 0,
  discount_percent INT DEFAULT 0,
  bulk_offer VARCHAR(120),
  student_count INT,
  payment_confirmed TINYINT(1) DEFAULT 0,
  payment_status VARCHAR(30) DEFAULT 'pending-verification',
  payment_method VARCHAR(80),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registration_sequence (
  id INT PRIMARY KEY,
  last_number INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS conference_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ref_id VARCHAR(40) UNIQUE NOT NULL,
  application_type VARCHAR(60) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  mobile VARCHAR(30) NOT NULL,
  whatsapp VARCHAR(30),
  city_state VARCHAR(120),
  institution_name VARCHAR(220) NOT NULL,
  department VARCHAR(120),
  designation VARCHAR(120),
  participant_category TEXT,
  competition_category TEXT,
  participation_type VARCHAR(40),
  team_name VARCHAR(150),
  team_members_count INT,
  team_member_names TEXT,
  submission_title VARCHAR(250) NOT NULL,
  topic_theme TEXT,
  short_description TEXT,
  expected_impact TEXT,
  paper_track VARCHAR(150),
  presentation_type TEXT,
  abstract_text TEXT,
  keywords VARCHAR(250),
  corresponding_author VARCHAR(150),
  co_author_names TEXT,
  guide_name VARCHAR(150),
  preferred_presentation_mode TEXT,
  attend_in_person VARCHAR(20),
  file_upload_path VARCHAR(500),
  file_upload_original_name VARCHAR(255),
  id_upload_path VARCHAR(500),
  id_upload_original_name VARCHAR(255),
  declaration_confirmed TINYINT(1) DEFAULT 0,
  applicant_confirmation_name VARCHAR(150),
  applicant_confirmation_date VARCHAR(40),
  signature_name VARCHAR(150),
  status VARCHAR(40) DEFAULT 'Pending',
  reviewer_comments TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS application_sequence (
  type VARCHAR(40) PRIMARY KEY,
  last_number INT NOT NULL DEFAULT 0
);
