const path = require('path');
const ApplicationModel = require('../models/applicationModel');
const { queueApplicationEmails } = require('./emailService');

const allowedFileTypes = new Set([
  'application/octet-stream',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/png',
  'image/jpeg'
]);

const allowedFileExtensions = new Set([
  '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.png', '.jpg', '.jpeg'
]);

function clean(value) {
  if (Array.isArray(value)) return value.map(item => String(item || '').trim()).filter(Boolean).join(', ');
  return String(value || '').trim();
}

function cleanWithOther(body, fieldName, otherFieldName) {
  const value = clean(body[fieldName]);
  if (value === 'Other') {
    const otherValue = clean(body[otherFieldName]);
    return otherValue ? `Other: ${otherValue}` : 'Other';
  }
  return value;
}

function normalizeSubmissionTitle(body) {
  return clean(body.submissionTitle)
    || clean(body.topicTheme)
    || clean(body.competitionCategory)
    || clean(body.presentationType)
    || 'ICAIH 2026 Application';
}

function normalizeFile(file) {
  if (!file) return null;

  return {
    originalName: file.originalname,
    path: `/uploads/applications/${path.basename(file.path)}`,
    mimeType: file.mimetype,
    size: file.size
  };
}

function validateRequired(data, fields) {
  for (const field of fields) {
    if (!clean(data[field])) {
      const err = new Error(`${field} is required.`);
      err.status = 400;
      throw err;
    }
  }
}

const ApplicationService = {
  async submit(body, files) {
    const applicationType = clean(body.applicationType) || 'pre-conference-competition';

    if (!['pre-conference-competition', 'research-paper'].includes(applicationType)) {
      const err = new Error('Invalid application type.');
      err.status = 400;
      throw err;
    }

    const normalizedSubmissionTitle = normalizeSubmissionTitle(body);
    const validationData = { ...body, submissionTitle: normalizedSubmissionTitle };
    validateRequired(validationData, ['fullName', 'email', 'mobile', 'submissionTitle']);

    if (!/^\d{10}$/.test(clean(body.mobile))) {
      const err = new Error('Please enter a valid 10 digit mobile number.');
      err.status = 400;
      throw err;
    }

    if (body.whatsapp && !/^\d{10}$/.test(clean(body.whatsapp))) {
      const err = new Error('Please enter a valid 10 digit WhatsApp number.');
      err.status = 400;
      throw err;
    }

    const mainFile = normalizeFile(files.submissionFile?.[0]);
    const idFile = normalizeFile(files.idProofFile?.[0]);

    const data = {
      applicationType,
      fullName: clean(body.fullName),
      email: clean(body.email),
      mobile: clean(body.mobile),
      whatsapp: clean(body.whatsapp),
      cityState: clean(body.cityState),
      institutionName: clean(body.institutionName) || '-',
      department: clean(body.department),
      designation: clean(body.designation),
      participantCategory: cleanWithOther(body, 'participantCategory', applicationType === 'research-paper' ? 'participantCategoryOtherResearch' : 'participantCategoryOther'),
      competitionCategory: clean(body.competitionCategory),
      participationType: clean(body.participationType),
      teamName: clean(body.teamName),
      teamMembersCount: clean(body.teamMembersCount),
      teamMemberNames: clean(body.teamMemberNames || body.individualMemberName),
      submissionTitle: normalizedSubmissionTitle,
      topicTheme: cleanWithOther(body, 'topicTheme', applicationType === 'research-paper' ? 'topicThemeOtherResearch' : 'topicThemeOther'),
      shortDescription: clean(body.shortDescription),
      expectedImpact: clean(body.expectedImpact),
      paperTrack: clean(body.paperTrack),
      presentationType: clean(body.presentationType),
      abstractText: clean(body.abstractText || body.shortDescription),
      keywords: clean(body.keywords),
      correspondingAuthor: clean(body.correspondingAuthor),
      coAuthorNames: clean(body.coAuthorNames),
      guideName: clean(body.guideName),
      preferredPresentationMode: clean(body.preferredPresentationMode),
      attendInPerson: clean(body.attendInPerson),
      fileUploadPath: mainFile?.path || null,
      fileUploadOriginalName: mainFile?.originalName || null,
      idUploadPath: idFile?.path || null,
      idUploadOriginalName: idFile?.originalName || null,
      declarationConfirmed: Boolean(body.declarationConfirmed) || body.declarationConfirmed === 'on' || body.declarationConfirmed === 'true' || body.declarationConfirmed === true,
      applicantConfirmName: clean(body.applicantConfirmName || body.applicantConfirmationName),
      applicantConfirmDate: clean(body.applicantConfirmDate || body.applicantConfirmationDate),
      applicantSignature: clean(body.applicantSignature || body.signatureName)
    };

    if (!data.declarationConfirmed) {
      const err = new Error('Please confirm the declaration before submitting.');
      err.status = 400;
      throw err;
    }

    const { refId } = await ApplicationModel.createApplication(data);
    data.refId = refId;
    data.mainFile = mainFile;
    data.idFile = idFile;
    const emailStatus = queueApplicationEmails(data);

    return {
      message: applicationType === 'research-paper'
        ? 'Form submitted successfully. Your research paper presentation submission has been received. Admin has been notified at info@mrtech.co.in.'
        : 'Form submitted successfully. Your pre-conference competition application has been received. Admin has been notified at info@mrtech.co.in.',
      refId,
      applicationType,
      emailStatus
    };
  },

  async getAllApplications() {
    return ApplicationModel.findAll();
  },

  allowedFileTypes,
  allowedFileExtensions
};

module.exports = ApplicationService;
