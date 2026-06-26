const path = require('path');
const ApplicationModel = require('../models/applicationModel');
const { sendApplicationEmails } = require('./emailService');

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

function cleanDigits(value) {
  return clean(value).replace(/\D/g, '');
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
    || clean(body.awardCategory)
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



function validateApplicationRequiredDetails(body, applicationType) {
  const commonFields = [
    ['fullName', 'Full name'],
    ['email', 'Email ID'],
    ['mobile', 'Mobile number'],
    ['institutionName', 'Institution / organization name'],
    ['department', 'Department'],
    ['designation', 'Designation / position / year of study'],
    ['applicantConfirmationName', 'Applicant confirmation name'],
    ['applicantConfirmationDate', 'Applicant confirmation date'],
    ['signatureName', 'Signature / typed name']
  ];

  const typeFields = {
    'pre-conference-competition': [
      ['whatsapp', 'WhatsApp number'],
      ['cityState', 'City / state'],
      ['participantCategory', 'Participant category'],
      ['competitionCategory', 'Competition category'],
      ['participationType', 'Participation type'],
      ['topicTheme', 'Topic / theme area'],
      ['shortDescription', 'Short description'],
      ['expectedImpact', 'Expected impact'],
      ['competitionDeclarationRules', 'Competition rules declaration'],
      ['competitionDeclarationPrereq.filesent', 'Presentation declaration'],
      ['competitionDeclarationTrue', 'Information declaration']
    ],
    'research-paper': [
      ['whatsapp', 'WhatsApp number'],
      ['cityState', 'City / state'],
      ['participantCategory', 'Applicant category'],
      ['presentationType', 'Presentation type'],
      ['topicTheme', 'Conference theme / topic area'],
      ['shortDescription', 'Abstract / short summary'],
      ['keywords', 'Keywords'],
      ['correspondingAuthor', 'Primary author name'],
      ['coAuthorNames', 'Co-author name(s)'],
      ['guideName', 'Guide / mentor name'],
      ['preferredPresentationMode', 'Preferred presentation mode'],
      ['attendInPerson', 'Conference attendance option'],
      ['researchDeclarationPresent', 'Research presentation declaration'],
      ['researchDeclarationRules', 'Research rules declaration'],
      ['researchDeclarationTrue', 'Research information declaration']
    ],
    'award-nomination': [
      ['country', 'Country'],
      ['linkedinProfile', 'LinkedIn profile / website'],
      ['awardCategory', 'Award category'],
      ['shortDescription', 'Short biography'],
      ['keyAchievements', 'Key achievements and contributions'],
      ['researchPublications', 'Research publications'],
      ['patents', 'Patents / intellectual property'],
      ['previousAwards', 'Previous awards and recognitions'],
      ['expectedImpact', 'Award justification'],
      ['supportingDocuments', 'Supporting documents included']
    ]
  };

  const requiredFields = [...commonFields, ...(typeFields[applicationType] || [])];

  for (const [field, label] of requiredFields) {
    if (!clean(body[field])) {
      const err = new Error(`${label} is required. Please fill all required fields marked in red.`);
      err.status = 400;
      throw err;
    }
  }

  if (clean(body.participantCategory) === 'Other' && !clean(body.participantCategoryOther || body.participantCategoryOtherResearch)) {
    const err = new Error('Please specify the participant/applicant category.');
    err.status = 400;
    throw err;
  }

  if (clean(body.topicTheme) === 'Other' && !clean(body.topicThemeOther || body.topicThemeOtherResearch)) {
    const err = new Error('Please specify the topic/theme area.');
    err.status = 400;
    throw err;
  }

  if (applicationType === 'pre-conference-competition') {
    const participationType = clean(body.participationType);
    if (participationType === 'Team') {
      validateRequired(body, ['teamName', 'teamMembersCount', 'teamMemberNames']);
    } else {
      validateRequired(body, ['teamName', 'individualMemberName']);
    }
  }
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
    body.mobile = cleanDigits(body.mobile || body.phone || body.phoneNumber || body.mobileNumber);
    body.whatsapp = cleanDigits(body.whatsapp || body.whatsappNumber);

    if (!['pre-conference-competition', 'research-paper', 'award-nomination'].includes(applicationType)) {
      const err = new Error('Invalid application type.');
      err.status = 400;
      throw err;
    }

    const normalizedSubmissionTitle = normalizeSubmissionTitle(body);
    const validationData = { ...body, submissionTitle: normalizedSubmissionTitle };
    validateRequired(validationData, ['fullName', 'email', 'mobile', 'submissionTitle']);

    if (!/^\d{10}$/.test(body.mobile)) {
      const err = new Error('Please enter a valid 10 digit mobile number.');
      err.status = 400;
      throw err;
    }

    if (body.whatsapp && !/^\d{10}$/.test(body.whatsapp)) {
      const err = new Error('Please enter a valid 10 digit WhatsApp number.');
      err.status = 400;
      throw err;
    }

    validateApplicationRequiredDetails(body, applicationType);

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
      participantCategory: applicationType === 'award-nomination' ? 'Awards Nominee' : cleanWithOther(body, 'participantCategory', applicationType === 'research-paper' ? 'participantCategoryOtherResearch' : 'participantCategoryOther'),
      competitionCategory: clean(body.awardCategory || body.competitionCategory),
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
      country: clean(body.country),
      linkedinProfile: clean(body.linkedinProfile),
      awardCategory: clean(body.awardCategory || body.competitionCategory),
      keyAchievements: clean(body.keyAchievements),
      researchPublications: clean(body.researchPublications),
      patents: clean(body.patents),
      previousAwards: clean(body.previousAwards),
      supportingDocuments: clean(body.supportingDocuments),
      emailFileName: clean(body.emailFileNameAward || body.emailFileNameResearch || body.emailFileNamePre),
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
    const emailStatus = await sendApplicationEmails(data);

    return {
      message: applicationType === 'research-paper'
        ? 'Form submitted successfully. Your research paper submission has been received. Coordinator has been notified at divyav16.ai@gmail.com.'
        : applicationType === 'award-nomination'
          ? 'Form submitted successfully. Your ICAIH 2026 international awards nomination has been received. Coordinator has been notified at divyav16.ai@gmail.com.'
          : 'Form submitted successfully. Your pre-conference competition application has been received. Coordinator has been notified at divyav16.ai@gmail.com.',
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
