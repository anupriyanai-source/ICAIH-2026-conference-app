const pool = require('../config/db');

async function getNextApplicationRef(conn, prefix) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS application_sequence (
      type VARCHAR(40) PRIMARY KEY,
      last_number INT NOT NULL DEFAULT 0
    )
  `);

  await conn.query(
    `INSERT IGNORE INTO application_sequence (type, last_number)
     SELECT ?, COALESCE(MAX(CAST(SUBSTRING(ref_id, ?) AS UNSIGNED)), 0)
     FROM conference_applications
     WHERE ref_id LIKE ?`,
    [prefix, prefix.length + 1, `${prefix}%`]
  );

  const [rows] = await conn.query('SELECT last_number FROM application_sequence WHERE type = ? FOR UPDATE', [prefix]);
  const nextNumber = Number(rows[0]?.last_number || 0) + 1;

  await conn.query('UPDATE application_sequence SET last_number = ? WHERE type = ?', [nextNumber, prefix]);

  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}

const ApplicationModel = {
  async createApplication(data) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const prefix = data.applicationType === 'research-paper' ? 'ICAIH-RP-' : 'ICAIH-PC-';
      const refId = await getNextApplicationRef(conn, prefix);

      await conn.query(
        `INSERT INTO conference_applications
         (ref_id, application_type, full_name, email, mobile, whatsapp, city_state, institution_name,
          department, designation, participant_category, competition_category, participation_type, team_name,
          team_members_count, team_member_names, submission_title, topic_theme, short_description,
          expected_impact, paper_track, presentation_type, abstract_text, keywords, corresponding_author, co_author_names,
          guide_name, preferred_presentation_mode, attend_in_person, file_upload_path,
          file_upload_original_name, id_upload_path, id_upload_original_name, declaration_confirmed, applicant_confirm_name, applicant_confirm_date, applicant_signature, status,
          created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', DATE_ADD(UTC_TIMESTAMP(), INTERVAL 330 MINUTE))`,
        [
          refId,
          data.applicationType,
          data.fullName,
          data.email,
          data.mobile,
          data.whatsapp || null,
          data.cityState || null,
          data.institutionName,
          data.department || null,
          data.designation || null,
          data.participantCategory || null,
          data.competitionCategory || null,
          data.participationType || null,
          data.teamName || null,
          data.teamMembersCount ? Number(data.teamMembersCount) : null,
          data.teamMemberNames || null,
          data.submissionTitle,
          data.topicTheme || null,
          data.shortDescription || null,
          data.expectedImpact || null,
          data.paperTrack || null,
          data.presentationType || null,
          data.abstractText || null,
          data.keywords || null,
          data.correspondingAuthor || null,
          data.coAuthorNames || null,
          data.guideName || null,
          data.preferredPresentationMode || null,
          data.attendInPerson || null,
          data.fileUploadPath || null,
          data.fileUploadOriginalName || null,
          data.idUploadPath || null,
          data.idUploadOriginalName || null,
          data.declarationConfirmed ? 1 : 0,
          data.applicantConfirmName || null,
          data.applicantConfirmDate || null,
          data.applicantSignature || null
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
    const [rows] = await pool.query('SELECT * FROM conference_applications ORDER BY created_at DESC');
    return rows;
  }
};

module.exports = ApplicationModel;
