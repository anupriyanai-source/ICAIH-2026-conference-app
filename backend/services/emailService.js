const nodemailer = require('nodemailer');

const EVENT_INFO = {
  title: 'International Conference on Artificial Intelligence in Healthcare',
  date: '4 July 2026',
  time: '9:30 AM – 5:30 PM',
  venue: 'VISTAS College, Pallavaram, Chennai',
  email: 'info@mrtech.co.in'
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
    connectionTimeout: 60000,
    greetingTimeout: 60000,
    socketTimeout: 60000,
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
      await transporter.verify();

      const results = [];
      for (const item of mailOptions) {
        const info = await transporter.sendMail(item.message);
        results.push({ type: item.type, messageId: info.messageId });
      }

      console.log(`SMTP email sent using ${config.label}`);
      console.log('Email results:', results);
      return { ok: true, used: config.label, results };
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

async function sendRegistrationEmails(data) {
  if (!mailConfigured()) {
    const missing = getMissingMailFields();
    const message = `Registration saved. Email not sent because these backend .env values are missing: ${missing.join(', ')}.`;
    console.warn(message);
    return { sent: false, message };
  }

  try {
    const mailOptions = createMailOptions(data);
    const result = await sendWithFallback(mailOptions);

    if (!result.ok) {
      throw new Error(result.error);
    }

    return {
      sent: true,
      message: `Registration saved. Confirmation emails sent to user and admin using ${result.used}.`
    };
  } catch (error) {
    console.error('Registration email error:', error);
    return {
      sent: false,
      message: `Registration saved, but email failed. ${simplifySmtpError(error)} Actual error: ${error.message}`
    };
  }
}

async function sendSmtpTestEmail(toEmail) {
  if (!mailConfigured()) {
    const missing = getMissingMailFields();
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
        subject: 'ICAIH 2026 SMTP Test Email',
        html: buildUserHtml(testData)
      }
    }
  ];

  const result = await sendWithFallback(mailOptions);
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result;
}

module.exports = { sendRegistrationEmails, sendSmtpTestEmail, EVENT_INFO };
