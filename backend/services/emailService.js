const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const EVENT_INFO = {
  title: 'International Conference on Artificial Intelligence in Healthcare',
  date: '18 July 2026',
  time: '9:30 AM – 5:30 PM',
  venue: 'Anna Centenary Library, Kotturpuram, Chennai',
  email: 'info@mrtech.co.in',
  competitionEmail: 'divyav16.ai@gmail.com'
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function clean(value) {
  return String(value || '').trim();
}

function mailConfigured() {
  return Boolean(
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.ADMIN_EMAIL
  );
}

function getMissingMailFields() {
  return ['SMTP_USER', 'SMTP_PASS', 'ADMIN_EMAIL']
    .filter((key) => !clean(process.env[key]));
}


function brevoConfigured() {
  return Boolean(
    clean(process.env.BREVO_API_KEY) &&
    clean(process.env.ADMIN_EMAIL) &&
    clean(process.env.MAIL_FROM_EMAIL)
  );
}

function getMissingBrevoFields() {
  return ['BREVO_API_KEY', 'ADMIN_EMAIL', 'MAIL_FROM_EMAIL']
    .filter((key) => !clean(process.env[key]));
}

function emailConfigured() {
  return brevoConfigured() || mailConfigured();
}

function getMissingEmailFields() {
  if (brevoConfigured()) return [];
  const brevoMissing = getMissingBrevoFields();
  const smtpMissing = getMissingMailFields();
  return [`Brevo API missing: ${brevoMissing.join(', ') || 'none'}`, `SMTP missing: ${smtpMissing.join(', ') || 'none'}`];
}

function getBrevoSender() {
  return {
    name: clean(process.env.MAIL_FROM_NAME) || 'ICAIH 2026',
    email: clean(process.env.MAIL_FROM_EMAIL) || 'info@mrtech.co.in'
  };
}

async function sendWithBrevoApi(mailOptions) {
  const apiKey = clean(process.env.BREVO_API_KEY);
  const sender = getBrevoSender();
  const results = [];

  for (const item of mailOptions) {
    try {
      const payload = {
        sender,
        to: [{ email: clean(item.message.to) }],
        replyTo: clean(item.message.replyTo) ? { email: clean(item.message.replyTo) } : { email: sender.email },
        subject: item.message.subject,
        htmlContent: item.message.html
      };

      if (Array.isArray(item.message.attachments) && item.message.attachments.length > 0) {
        payload.attachment = item.message.attachments
          .filter((attachment) => attachment?.path && fs.existsSync(attachment.path))
          .map((attachment) => ({
            name: attachment.filename || path.basename(attachment.path),
            content: fs.readFileSync(attachment.path).toString('base64')
          }));
      }

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const responseText = await response.text();
      results.push({ type: item.type, ok: response.ok, response: responseText, status: response.status });
    } catch (error) {
      results.push({ type: item.type, ok: false, error: error.message || String(error) });
    }
  }

  const successful = results.filter((item) => item.ok);
  const failed = results.filter((item) => !item.ok);
  console.log('Brevo API email results:', results);
  return {
    ok: successful.length > 0,
    complete: failed.length === 0,
    used: 'Brevo Email API',
    results,
    error: failed.map((item) => `${item.type}: ${item.error || item.response || item.status}`).join(' | ')
  };
}

async function sendEmailMessages(mailOptions) {
  if (brevoConfigured()) {
    return sendWithBrevoApi(mailOptions);
  }

  return sendWithFallback(mailOptions);
}

function getBooleanEnv(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
}

function getSmtpAttempts() {
  const smtpUser = clean(process.env.SMTP_USER);
  const smtpPass = clean(process.env.SMTP_PASS);
  const envHost = clean(process.env.SMTP_HOST);
  const envPort = Number(process.env.SMTP_PORT || 0);
  const envSecure = getBooleanEnv(process.env.SMTP_SECURE, envPort === 465);

  const attempts = [];

  if (envHost && envPort) {
    attempts.push({
      label: `backend .env SMTP ${envHost}:${envPort}`,
      host: envHost,
      port: envPort,
      secure: envSecure
    });
  }

  // GoDaddy Professional Mail / Workspace Email outgoing SMTP fallbacks.
  attempts.push(
    { label: 'GoDaddy SSL SMTP smtpout.secureserver.net:465', host: 'smtpout.secureserver.net', port: 465, secure: true },
    { label: 'GoDaddy STARTTLS SMTP smtpout.secureserver.net:587', host: 'smtpout.secureserver.net', port: 587, secure: false }
  );

  // Remove duplicate host-port-secure combinations while keeping order.
  const seen = new Set();
  return attempts
    .filter((item) => {
      const key = `${item.host}:${item.port}:${item.secure}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((item) => ({
      ...item,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    }));
}

function createTransporter(config) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
    connectionTimeout: Number(process.env.SMTP_TIMEOUT_MS || 5000),
    greetingTimeout: Number(process.env.SMTP_TIMEOUT_MS || 5000),
    socketTimeout: Number(process.env.SMTP_TIMEOUT_MS || 5000),
    requireTLS: config.port === 587,
    tls: {
      minVersion: 'TLSv1.2',
      ciphers: 'TLSv1.2',
      rejectUnauthorized: false
    }
  });
}

function formatINR(amount) {
  return '₹' + Number(amount || 0).toLocaleString('en-IN');
}

function registrationRows(data) {
  const rows = [
    ['Registration ID', data.refId],
    ['Name', data.name],
    ['Email', data.email],
    ['Phone', data.phone],
    ['Organization', data.organization],
    ['Role', data.role],
    ['Category', data.category],
    ['Paid Amount', formatINR(data.feeAmount)],
    ['Payment Status', data.paymentStatus || 'pending-verification'],
    ['UTR / Transaction ID', data.paymentReference || '-'],
    ['Bulk Offer', data.bulkOffer || '-'],
    ['Student Count', data.studentCount || '-']
  ];

  return `
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      ${rows.map(([label, value]) => `
        <tr>
          <td style="padding:10px;border:1px solid #dbe5f5;background:#f6f9ff;font-weight:700;width:38%;">${escapeHtml(label)}</td>
          <td style="padding:10px;border:1px solid #dbe5f5;">${escapeHtml(value || '-')}</td>
        </tr>`).join('')}
    </table>`;
}

function getEventBlock() {
  return `
    <div style="margin-top:18px;padding:14px;background:#0b2d6b;color:#ffffff;border-radius:10px;">
      <p style="margin:4px 0;"><strong>Date:</strong> ${escapeHtml(EVENT_INFO.date)}</p>
      <p style="margin:4px 0;"><strong>Time:</strong> ${escapeHtml(EVENT_INFO.time)}</p>
      <p style="margin:4px 0;"><strong>Venue:</strong> ${escapeHtml(EVENT_INFO.venue)}</p>
      <p style="margin:4px 0;"><strong>Contact:</strong> ${escapeHtml(EVENT_INFO.email)}</p>
    </div>`;
}

function buildUserHtml(data) {
  return `
    <div style="font-family:Arial,sans-serif;color:#12213f;line-height:1.6;max-width:680px;margin:auto;">
      <h2>Welcome to ICAIH 2026!</h2>
      <p>Dear ${escapeHtml(data.name)},</p>
      <p>You have registered successfully for <strong>${escapeHtml(EVENT_INFO.title)}</strong>.</p>
      <p>Your Registration ID is <strong>${escapeHtml(data.refId)}</strong>.</p>
      ${registrationRows(data)}
      ${getEventBlock()}
      <p style="margin-top:18px;">Please keep this Registration ID for conference entry and future communication.</p>
      <p>Regards,<br><strong>ICAIH 2026 Team</strong></p>
    </div>`;
}

function buildAdminHtml(data) {
  return `
    <div style="font-family:Arial,sans-serif;color:#12213f;line-height:1.6;max-width:760px;margin:auto;">
      <h2>New ICAIH 2026 Registration Received</h2>
      <p><strong>${escapeHtml(data.name)}</strong> has registered successfully for ICAIH 2026.</p>
      <p>Registration ID: <strong>${escapeHtml(data.refId)}</strong></p>
      ${registrationRows(data)}
      ${getEventBlock()}
    </div>`;
}

function createMailOptions(data) {
  const from = clean(process.env.MAIL_FROM) || `ICAIH 2026 <${clean(process.env.SMTP_USER)}>`;
  const adminEmail = clean(process.env.ADMIN_EMAIL) || 'info@mrtech.co.in';

  return [
    {
      type: 'user',
      message: {
        from,
        to: data.email,
        replyTo: EVENT_INFO.email,
        subject: `ICAIH 2026 Registration Successful - ${data.refId}`,
        html: buildUserHtml(data)
      }
    },
    {
      type: 'admin',
      message: {
        from,
        to: adminEmail,
        replyTo: data.email,
        subject: `New ICAIH 2026 Registration - ${data.refId}`,
        html: buildAdminHtml(data)
      }
    }
  ];
}


function sponsorRows(data) {
  const isStall = data.inquiryType === 'stall' || /Exhibitor|Pavilion/i.test(String(data.sponsorTier || ''));
  const rows = [
    [isStall ? 'Stall Booking ID' : 'Sponsor Inquiry ID', data.refId],
    ['Company Name', data.companyName],
    ['Contact Person', data.contactPerson],
    ['Email', data.email],
    ['Phone', data.phone],
    [(data.inquiryType === 'stall' || /Exhibitor|Pavilion/i.test(String(data.sponsorTier || ''))) ? 'Stall / Exhibitor Tier' : 'Sponsorship Tier', data.sponsorTier],
    ['Paid Amount', formatINR(data.feeAmount)],
    ['Payment Status', data.paymentStatus || 'pending-verification'],
    ['UTR / Transaction ID', data.paymentReference || '-'],
    ['Message', data.message || '-']
  ];

  return `
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      ${rows.map(([label, value]) => `
        <tr>
          <td style="padding:10px;border:1px solid #dbe5f5;background:#f6f9ff;font-weight:700;width:38%;">${escapeHtml(label)}</td>
          <td style="padding:10px;border:1px solid #dbe5f5;">${escapeHtml(value || '-')}</td>
        </tr>`).join('')}
    </table>`;
}

function buildSponsorUserHtml(data) {
  return `
    <div style="font-family:Arial,sans-serif;color:#12213f;line-height:1.6;max-width:680px;margin:auto;">
      <h2>Thank you for your ICAIH 2026 ${data.inquiryType === 'stall' ? 'stall / exhibitor booking' : 'sponsorship inquiry'}</h2>
      <p>Dear ${escapeHtml(data.contactPerson)},</p>
      <p>Your ${data.inquiryType === 'stall' ? 'stall / exhibitor booking' : 'sponsorship inquiry'} for <strong>${escapeHtml(EVENT_INFO.title)}</strong> has been received successfully.</p>
      <p>Your ${data.inquiryType === 'stall' ? 'Stall Booking ID' : 'Sponsor Inquiry ID'} is <strong>${escapeHtml(data.refId)}</strong>.</p>
      ${sponsorRows(data)}
      ${getEventBlock()}
      <p style="margin-top:18px;">Our team will verify your payment and contact you for the next steps.</p>
      <p>Regards,<br><strong>ICAIH 2026 Team</strong></p>
    </div>`;
}

function buildSponsorAdminHtml(data) {
  return `
    <div style="font-family:Arial,sans-serif;color:#12213f;line-height:1.6;max-width:760px;margin:auto;">
      <h2>New ICAIH 2026 ${data.inquiryType === 'stall' ? 'Stall / Exhibitor Booking' : 'Sponsor Inquiry'} Received</h2>
      <p><strong>${escapeHtml(data.companyName)}</strong> has submitted a ${data.inquiryType === 'stall' ? 'stall / exhibitor booking' : 'sponsorship inquiry'}.</p>
      <p>${data.inquiryType === 'stall' ? 'Stall Booking ID' : 'Sponsor Inquiry ID'}: <strong>${escapeHtml(data.refId)}</strong></p>
      ${sponsorRows(data)}
      ${getEventBlock()}
    </div>`;
}

function createSponsorMailOptions(data) {
  const from = clean(process.env.MAIL_FROM) || `ICAIH 2026 <${clean(process.env.SMTP_USER)}>`;
  const adminEmail = clean(process.env.ADMIN_EMAIL) || 'info@mrtech.co.in';

  return [
    {
      type: 'sponsor-user',
      message: {
        from,
        to: data.email,
        replyTo: EVENT_INFO.email,
        subject: `ICAIH 2026 Sponsor Inquiry Received - ${data.refId}`,
        html: buildSponsorUserHtml(data)
      }
    },
    {
      type: 'sponsor-admin',
      message: {
        from,
        to: adminEmail,
        replyTo: data.email,
        subject: `New ICAIH 2026 Sponsor Inquiry - ${data.refId}`,
        html: buildSponsorAdminHtml(data)
      }
    }
  ];
}


function getApplicationLabel(applicationType) {
  if (applicationType === 'research-paper') return 'Research Paper Submission';
  if (applicationType === 'award-nomination') return 'ICAIH 2026 International Awards Nomination';
  return 'Pre-Conference Competitions Application';
}

function applicationRows(data) {
  const isResearch = data.applicationType === 'research-paper';
  const isAward = data.applicationType === 'award-nomination';
  const rows = [
    ['Application ID', data.refId],
    ['Application Type', getApplicationLabel(data.applicationType)],
    ['Full Name', data.fullName],
    ['Email', data.email],
    ['Mobile', data.mobile],
    ['WhatsApp', data.whatsapp || '-'],
    ['Country', data.country || '-'],
    ['LinkedIn / Website', data.linkedinProfile || '-'],
    ['City / State', data.cityState || '-'],
    ['Institution / Organization', data.institutionName],
    ['Department', data.department || '-'],
    ['Designation / Year of Study', data.designation || '-'],
    ['Category', data.participantCategory || '-'],
    [isAward ? 'Award Category' : isResearch ? 'Presentation Type' : 'Competition Category', isAward ? (data.awardCategory || data.competitionCategory || '-') : isResearch ? (data.presentationType || '-') : (data.competitionCategory || '-')],
    ['Title', data.submissionTitle],
    ['Topic / Theme Area', data.topicTheme || '-'],
    ['Keywords', data.keywords || '-'],
    ['Primary / Corresponding Author', data.correspondingAuthor || '-'],
    ['Co-author Name(s)', data.coAuthorNames || '-'],
    ['Guide / Mentor', data.guideName || '-'],
    ['Preferred Presentation Mode', data.preferredPresentationMode || '-'],
    ['Attend In Person', data.attendInPerson || '-'],
    ['Supporting Documents', 'To be sent directly by email to divyav16.ai@gmail.com if required.'],
    ['Applicant Confirmation Name', data.applicantConfirmName || '-'],
    ['Applicant Confirmation Date', data.applicantConfirmDate || '-'],
    ['Signature', data.applicantSignature || '-']
  ];

  if (!isResearch && !isAward) {
    rows.splice(14, 0,
      ['Participation Type', data.participationType || '-'],
      ['Team Name', data.teamName || '-'],
      ['Team Members Count', data.teamMembersCount || '-'],
      ['Team Member Names', data.teamMemberNames || '-']
    );
  }

  if (isAward) {
    rows.splice(16, 0,
      ['Key Achievements and Contributions', data.keyAchievements || '-'],
      ['Research Publications', data.researchPublications || '-'],
      ['Patents / Intellectual Property', data.patents || '-'],
      ['Previous Awards and Recognitions', data.previousAwards || '-'],
      ['Supporting Documents Included', data.supportingDocuments || '-']
    );
  }

  return `
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      ${rows.map(([label, value]) => `
        <tr>
          <td style="padding:10px;border:1px solid #dbe5f5;background:#f6f9ff;font-weight:700;width:38%;">${escapeHtml(label)}</td>
          <td style="padding:10px;border:1px solid #dbe5f5;white-space:pre-line;">${escapeHtml(value || '-')}</td>
        </tr>`).join('')}
    </table>`;
}

function buildApplicationUserHtml(data) {
  const label = getApplicationLabel(data.applicationType);
  return `
    <div style="font-family:Arial,sans-serif;color:#12213f;line-height:1.6;max-width:680px;margin:auto;">
      <h2>${escapeHtml(label)} Received</h2>
      <p>Dear ${escapeHtml(data.fullName)},</p>
      <p>Your <strong>${escapeHtml(label)}</strong> for <strong>${escapeHtml(EVENT_INFO.title)}</strong> has been received successfully.</p>
      <p>Your Application ID is <strong>${escapeHtml(data.refId)}</strong>.</p>
      ${applicationRows(data)}
      ${getEventBlock()}
      <p style="margin-top:18px;">Our team will review your submission and contact you for the next steps.</p>
      <p>Regards,<br><strong>ICAIH 2026 Team</strong></p>
    </div>`;
}

function buildApplicationAdminHtml(data) {
  const label = getApplicationLabel(data.applicationType);
  return `
    <div style="font-family:Arial,sans-serif;color:#12213f;line-height:1.6;max-width:760px;margin:auto;">
      <h2>New ICAIH 2026 ${escapeHtml(label)} Received</h2>
      <p><strong>${escapeHtml(data.fullName)}</strong> has submitted an application.</p>
      <p>Application ID: <strong>${escapeHtml(data.refId)}</strong></p>
      ${applicationRows(data)}
      <h3 style="margin-top:18px;">Description / Abstract</h3>
      <p style="white-space:pre-line;">${escapeHtml(data.shortDescription || data.abstractText || '-')}</p>
      ${data.expectedImpact ? `<h3 style="margin-top:18px;">${data.applicationType === 'award-nomination' ? 'Award Justification' : 'Expected Impact'}</h3><p style="white-space:pre-line;">${escapeHtml(data.expectedImpact)}</p>` : ''}
      ${getEventBlock()}
    </div>`;
}

function getApplicationAttachments(data) {
  const attachments = [];
  const backendRoot = path.join(__dirname, '..');

  if (data.mainFile?.path) {
    attachments.push({
      filename: data.mainFile.originalName || path.basename(data.mainFile.path),
      path: path.join(backendRoot, data.mainFile.path.replace(/^\/+/, ''))
    });
  }

  if (data.idFile?.path) {
    attachments.push({
      filename: data.idFile.originalName || path.basename(data.idFile.path),
      path: path.join(backendRoot, data.idFile.path.replace(/^\/+/, ''))
    });
  }

  return attachments;
}

function createApplicationMailOptions(data) {
  const from = clean(process.env.MAIL_FROM) || `ICAIH 2026 <${clean(process.env.SMTP_USER)}>`;
  const adminEmail = clean(process.env.APPLICATION_ADMIN_EMAIL) || EVENT_INFO.competitionEmail || clean(process.env.ADMIN_EMAIL) || 'info@mrtech.co.in';
  const label = getApplicationLabel(data.applicationType);
  const attachments = getApplicationAttachments(data);

  return [
    {
      type: 'application-user',
      message: {
        from,
        to: data.email,
        replyTo: EVENT_INFO.email,
        subject: `ICAIH 2026 ${label} Received - ${data.refId}`,
        html: buildApplicationUserHtml(data)
      }
    },
    {
      type: 'application-admin',
      message: {
        from,
        to: adminEmail,
        replyTo: data.email,
        subject: `New ICAIH 2026 ${label} - ${data.refId}`,
        html: buildApplicationAdminHtml(data),
        attachments
      }
    }
  ];
}

function simplifySmtpError(error) {
  const code = error.code || error.command || '';
  const message = error.message || 'Unknown SMTP error';

  if (String(code).includes('EAUTH') || /auth|login|username|password/i.test(message)) {
    return 'SMTP login failed. Please check SMTP_USER and SMTP_PASS. Use the mailbox password for info@mrtech.co.in, not the GoDaddy account password.';
  }

  if (String(code).includes('ECONNRESET') || /ECONNRESET|socket|connection/i.test(message)) {
    return 'SMTP connection was reset. Use GoDaddy SMTP_HOST=smtpout.secureserver.net with SMTP_PORT=465 and SMTP_SECURE=true. If 465 fails, use SMTP_PORT=587 and SMTP_SECURE=false. Then restart the backend.';
  }

  if (String(code).includes('ETIMEDOUT') || /timeout/i.test(message)) {
    return 'SMTP connection timed out. Check internet connection, firewall, antivirus, and SMTP port 465/587 access.';
  }

  return message;
}

async function sendWithFallback(mailOptions) {
  const attempts = getSmtpAttempts();
  const errors = [];

  for (const config of attempts) {
    try {
      const transporter = createTransporter(config);

      const results = [];
      for (const item of mailOptions) {
        try {
          const info = await transporter.sendMail(item.message);
          results.push({ type: item.type, ok: true, messageId: info.messageId });
        } catch (error) {
          results.push({ type: item.type, ok: false, error: error.message || String(error) });
        }
      }

      const successful = results.filter((item) => item.ok);
      const failed = results.filter((item) => !item.ok);
      if (successful.length > 0) {
        console.log(`SMTP email sent using ${config.label}`);
        console.log('Email results:', results);
        return {
          ok: true,
          complete: failed.length === 0,
          used: config.label,
          results,
          error: failed.map((item) => `${item.type}: ${item.error}`).join(' | ')
        };
      }
      throw new Error(failed.map((item) => `${item.type}: ${item.error}`).join(' | '));
    } catch (error) {
      const reason = `${config.label}: ${error.code || ''} ${error.message || error}`.trim();
      console.error('SMTP attempt failed:', reason);
      errors.push(reason);
    }
  }

  return {
    ok: false,
    error: errors.join(' | ')
  };
}

function runEmailJob(label, task) {
  setImmediate(async () => {
    try {
      const result = await task();
      if (result?.sent || result?.ok) {
        console.log(`${label} completed successfully.`);
      } else {
        console.warn(`${label} completed with warning:`, result?.message || result?.error || result);
      }
    } catch (error) {
      console.error(`${label} failed:`, error.message || error);
    }
  });
}

function queueRegistrationEmails(data) {
  if (!emailConfigured()) {
    const missing = getMissingEmailFields();
    const message = `Registration saved. Email service is not configured. Missing values: ${missing.join(', ')}.`;
    console.warn(message);
    return { sent: false, queued: false, message };
  }

  runEmailJob(`Registration email job ${data.refId}`, () => sendRegistrationEmails(data));

  return {
    sent: false,
    queued: true,
    message: 'Registration saved. Confirmation email is being sent to the user and admin.'
  };
}

function queueSponsorEmails(data) {
  if (!emailConfigured()) {
    const missing = getMissingEmailFields();
    const message = `Sponsor inquiry saved. Email service is not configured. Missing values: ${missing.join(', ')}.`;
    console.warn(message);
    return { sent: false, queued: false, message };
  }

  runEmailJob(`Sponsor email job ${data.refId}`, () => sendSponsorEmails(data));

  return {
    sent: false,
    queued: true,
    message: 'Sponsor inquiry saved. Confirmation email is being sent to the sponsor and admin.'
  };
}

async function sendRegistrationEmails(data) {
  if (!emailConfigured()) {
    const missing = getMissingEmailFields();
    const message = `Registration saved. Email not sent because these backend .env values are missing: ${missing.join(', ')}.`;
    console.warn(message);
    return { sent: false, message };
  }

  try {
    const mailOptions = createMailOptions(data);
    const result = await sendEmailMessages(mailOptions);

    if (!result.ok) {
      throw new Error(result.error);
    }

    const adminSent = result.results?.some((item) => item.type === 'admin' && item.ok !== false);
    const userSent = result.results?.some((item) => item.type === 'user' && item.ok !== false);
    return {
      sent: Boolean(adminSent || userSent),
      adminSent,
      userSent,
      message: adminSent && userSent
        ? `Registration saved. Confirmation emails sent to user and admin using ${result.used}.`
        : `Registration saved. Admin notification: ${adminSent ? 'sent' : 'failed'}. User confirmation: ${userSent ? 'sent' : 'failed'}.`
    };
  } catch (error) {
    console.error('Registration email error:', error);
    return {
      sent: false,
      message: `Registration saved, but email failed. ${simplifySmtpError(error)} Actual error: ${error.message}`
    };
  }
}


async function sendSponsorEmails(data) {
  if (!emailConfigured()) {
    const missing = getMissingEmailFields();
    const message = `Sponsor inquiry saved. Email not sent because these backend .env values are missing: ${missing.join(', ')}.`;
    console.warn(message);
    return { sent: false, message };
  }

  try {
    const mailOptions = createSponsorMailOptions(data);
    const result = await sendEmailMessages(mailOptions);

    if (!result.ok) {
      throw new Error(result.error);
    }

    return {
      sent: true,
      message: `Sponsor inquiry saved. Confirmation emails sent to sponsor and admin using ${result.used}.`
    };
  } catch (error) {
    console.error('Sponsor inquiry email error:', error);
    return {
      sent: false,
      message: `Sponsor inquiry saved, but email failed. ${simplifySmtpError(error)} Actual error: ${error.message}`
    };
  }
}


function queueApplicationEmails(data) {
  if (!emailConfigured()) {
    const missing = getMissingEmailFields();
    const message = `Application saved. Email service is not configured. Missing values: ${missing.join(', ')}.`;
    console.warn(message);
    return { sent: false, queued: false, message };
  }

  runEmailJob(`Application email job ${data.refId}`, () => sendApplicationEmails(data));

  return {
    sent: false,
    queued: true,
    message: 'Application saved. Confirmation email is being sent to the applicant and admin.'
  };
}

async function sendApplicationEmails(data) {
  if (!emailConfigured()) {
    const missing = getMissingEmailFields();
    const message = `Application saved. Email not sent because these backend .env values are missing: ${missing.join(', ')}.`;
    console.warn(message);
    return { sent: false, message };
  }

  try {
    const mailOptions = createApplicationMailOptions(data);
    const result = await sendEmailMessages(mailOptions);

    if (!result.ok) {
      throw new Error(result.error);
    }

    return {
      sent: true,
      message: `Application saved. Confirmation emails sent to applicant and admin using ${result.used}.`
    };
  } catch (error) {
    console.error('Application email error:', error);
    return {
      sent: false,
      message: `Application saved, but email failed. ${simplifySmtpError(error)} Actual error: ${error.message}`
    };
  }
}

async function sendSmtpTestEmail(toEmail) {
  if (!emailConfigured()) {
    const missing = getMissingEmailFields();
    throw new Error(`Missing backend .env values: ${missing.join(', ')}`);
  }

  const testData = {
    refId: 'ICAIH-2026TEST',
    name: 'SMTP Test',
    email: clean(toEmail) || clean(process.env.ADMIN_EMAIL),
    phone: '-',
    organization: 'ICAIH 2026',
    role: 'SMTP Test',
    category: 'SMTP Test',
    feeAmount: 0,
    bulkOffer: '',
    studentCount: ''
  };

  const mailOptions = [
    {
      type: 'test',
      message: {
        from: clean(process.env.MAIL_FROM) || `ICAIH 2026 <${clean(process.env.SMTP_USER)}>`,
        to: testData.email,
        subject: 'ICAIH 2026 Email Test',
        html: buildUserHtml(testData)
      }
    }
  ];

  const result = await sendEmailMessages(mailOptions);
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result;
}

module.exports = {
  sendRegistrationEmails,
  sendSponsorEmails,
  sendApplicationEmails,
  queueRegistrationEmails,
  queueSponsorEmails,
  queueApplicationEmails,
  sendSmtpTestEmail,
  EVENT_INFO
};
