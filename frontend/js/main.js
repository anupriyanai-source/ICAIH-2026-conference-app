/* ═══════════════════════════════════════════════════════════════
   ICAIH 2026 – Main JS
   Manual UPI Payment Flow
   ═══════════════════════════════════════════════════════════════ */

/* ── Countdown ── */
function updateCountdown() {
  const target = new Date('2026-07-04T09:30:00+05:30');
  const diff = Math.max(target - new Date(), 0);

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const ids = {
    'cd-d': String(d).padStart(3, '0'),
    'cd-h': String(h).padStart(2, '0'),
    'cd-m': String(m).padStart(2, '0'),
    'cd-s': String(s).padStart(2, '0')
  };

  Object.entries(ids).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });
}

setInterval(updateCountdown, 1000);
updateCountdown();

/* ── Scroll reveal ── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ── Mobile nav ── */
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle?.addEventListener('click', () => {
  navLinks?.classList.toggle('open');
});

navLinks?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

/*
  API base URL

  Laptop frontend:
  http://localhost:64943
  API goes to:
  http://localhost:3000

  Mobile frontend:
  http://192.168.1.101:64943
  API goes to:
  http://192.168.1.101:3000
*/
const API_BASE = (() => {
  const hostname = window.location.hostname;

  if (
    window.location.protocol === 'file:' ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.')
  ) {
    return `http://${hostname === '127.0.0.1' ? 'localhost' : hostname}:3000`;
  }

  return '';
})();

/* ── Inline form messages ── */
function showMessage(elementId, text, type) {
  const el = document.getElementById(elementId);
  if (!el) return;

  el.className = 'form-message ' + (type || '');
  el.textContent = text;
}

/* ── Phone inputs: allow only digits and maximum 10 numbers ── */
document.querySelectorAll('input[data-phone-only]').forEach(input => {
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '').slice(0, 10);
  });

  input.addEventListener('keypress', event => {
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  });
});

/* ── Validate phone fields before form submit ── */
function validatePhoneFields(form, messageId) {
  const phoneInputs = form.querySelectorAll('input[data-phone-only]');

  for (const input of phoneInputs) {
    const value = input.value.trim();

    if ((input.required || value.length > 0) && !/^\d{10}$/.test(value)) {
      showMessage(messageId, 'Please enter a valid 10 digit phone number.', 'error');
      input.focus();
      return false;
    }
  }

  return true;
}

/* ── Registration fee, QR amount, and manual UPI payment ── */
const UTR_PATTERN = /^[A-Za-z0-9]{10,30}$/;
const PAYMENT_WHATSAPP_NUMBER = '917358327761';
let paymentWhatsappShared = false;
const EVENT_INFO = {
  date: '4 July 2026',
  time: '9:30 AM – 5:30 PM',
  venue: 'VISTAS College, Pallavaram, Chennai',
  email: 'info@mrtech.co.in'
};

const REGISTRATION_FEES = {
  'Student': 499,
  'Research Scholar': 999,
  'Healthcare Professional': 1499,
  'Delegate': 1499,
  'Startup Founder': 1999,
  'Industry Expert': 2499,
  'Online Attendee': 1,
  'Speaker': 0
};

const BULK_OFFERS = {
  '5-25': { min: 5, max: 25, discount: 10, label: 'Student Group: 5 to 25 Students - 10% Discount' },
  '25-50': { min: 25, max: 50, discount: 20, label: 'Student Group: 25 to 50 Students - 20% Discount' },
  '50-plus': { min: 50, max: Infinity, discount: 25, label: 'Student Group: 50+ Students - 25% Discount' }
};

const MANUAL_UPI = {
  // id: '7004245277@indianbk',
  // payeeName: 'gcare health care services',
  // notePrefix: 'ICAIH 2026 Registration'

  id: 'anupriyanarasimman2004@okhdfcbank',
  payeeName: 'Anupriya Narasimman',
  notePrefix: 'ICAIH 2026 Registration'
};

function formatINR(amount) {
  return '₹' + Number(amount || 0).toLocaleString('en-IN');
}

function getRegistrationPaymentDetails() {
  const role = document.getElementById('registrationRole')?.value || 'Delegate';
  const bulkOfferKey = document.getElementById('bulkOffer')?.value || '5-25';
  const studentCountInput = document.getElementById('studentCount');
  const studentCount = Number(studentCountInput?.value || 0);

  if (role === 'Bulk Booking') {
    const offer = BULK_OFFERS[bulkOfferKey];
    const count = studentCount > 0 ? studentCount : offer.min;
    const baseTotal = count * REGISTRATION_FEES.Student;
    const discountAmount = Math.round(baseTotal * offer.discount / 100);
    const payableAmount = baseTotal - discountAmount;

    return {
      role,
      feeAmount: payableAmount,
      discountPercent: offer.discount,
      bulkOffer: offer.label,
      studentCount: count,
      requiresPayment: payableAmount > 0,
      note: `${offer.label}. ${count} students × ₹499. Payable amount after discount: ${formatINR(payableAmount)}.`
    };
  }

  const fee = Number(REGISTRATION_FEES[role] ?? 1499);

  return {
    role,
    feeAmount: fee,
    discountPercent: 0,
    bulkOffer: '',
    studentCount: '',
    requiresPayment: fee > 0,
    note: fee > 0 ? `${role} registration fee` : `${role} registration - no fee required`
  };
}

function setPaymentStatus(status, message) {
  const paymentStatus = document.getElementById('paymentStatus');
  const paymentStatusText = document.getElementById('paymentStatusText');

  if (paymentStatus) paymentStatus.value = status;

  if (paymentStatusText) {
    paymentStatusText.textContent = message || '';
    paymentStatusText.classList.toggle('verified', status === 'not-required');
    paymentStatusText.classList.toggle('manual-pending', status === 'pending-verification');
  }
}

function validateManualPaymentFields(details, showError = false) {
  if (!details.requiresPayment) return true;

  const paymentReference = document.getElementById('paymentReference');
  const utrValue = paymentReference?.value.trim() || '';

  if (!paymentWhatsappShared) {
    setPaymentStatus(
      'pending-verification',
      'Please open WhatsApp, send the payment screenshot, click the confirmation button, and then enter the UTR / transaction ID.'
    );

    if (showError) {
      showMessage(
        'registrationMessage',
        'Please open WhatsApp, send the payment screenshot, then click "I Sent the Screenshot on WhatsApp" before entering the UTR / transaction ID.',
        'error'
      );
      document.getElementById('confirmWhatsappSentBtn')?.focus();
    }

    return false;
  }

  if (!UTR_PATTERN.test(utrValue)) {
    setPaymentStatus(
      'pending-verification',
      'Enter a valid UTR / transaction ID before submitting. Use 10 to 30 letters or numbers only.'
    );

    if (showError) {
      showMessage(
        'registrationMessage',
        'Please enter a valid UTR / transaction ID. It must contain 10 to 30 letters or numbers only.',
        'error'
      );
      paymentReference?.focus();
    }

    return false;
  }

  setPaymentStatus(
    'pending-verification',
    'UTR / transaction ID received. Admin will manually verify your payment after registration submission.'
  );

  return true;
}

function buildUpiPaymentLink(details) {
  const transactionNote = `${MANUAL_UPI.notePrefix} - ${details.role}`;

  const params = new URLSearchParams({
    pa: MANUAL_UPI.id,
    pn: MANUAL_UPI.payeeName,
    tn: transactionNote,
    am: String(details.feeAmount),
    cu: 'INR'
  });

  return `upi://pay?${params.toString()}`;
}

function buildDynamicQrImageUrl(details) {
  const upiLink = buildUpiPaymentLink(details);

  /*
    Dynamic QR rule:
    The QR code is generated from the same UPI link used by the button.
    So when the selected fee is ₹499, ₹1,499, ₹1,999, etc.,
    the scanned QR will also carry that exact amount.
  */
  const qrParams = new URLSearchParams({
    size: '260x260',
    margin: '10',
    data: upiLink
  });

  return `https://api.qrserver.com/v1/create-qr-code/?${qrParams.toString()}`;
}


function openManualUpiPayment() {
  const form = document.getElementById('registrationForm');
  const details = getRegistrationPaymentDetails();

  if (!details.requiresPayment) {
    setPaymentStatus(
      'not-required',
      'No payment is required for this category. You can submit the registration directly.'
    );
    return;
  }

  if (form && !validatePhoneFields(form, 'registrationMessage')) return;

  showMessage(
    'registrationMessage',
    'Opening UPI app. After payment, return here and click the WhatsApp button to share your screenshot. Then enter the UTR / transaction ID.',
    ''
  );

  window.location.href = buildUpiPaymentLink(details);
}

function setUtrEntryEnabled(enabled) {
  const paymentReference = document.getElementById('paymentReference');
  const utrField = document.getElementById('utrField');
  const utrHelpText = document.getElementById('utrHelpText');
  const whatsappSharedInput = document.getElementById('paymentWhatsappShared');

  paymentWhatsappShared = Boolean(enabled);

  if (whatsappSharedInput) whatsappSharedInput.value = enabled ? '1' : '0';

  if (utrField) utrField.hidden = !enabled;
  if (utrHelpText) utrHelpText.hidden = !enabled;

  if (paymentReference) {
    paymentReference.disabled = !enabled;
    paymentReference.required = enabled;
    if (!enabled) paymentReference.value = '';
  }
}

function buildPaymentWhatsappUrl(details) {
  const form = document.getElementById('registrationForm');
  const formData = new FormData(form);
  const normalizedFields = getNormalizedRegistrationFields(formData);
  const message = [
    'Hi, I have completed my ICAIH 2026 registration payment.',
    '',
    `Name: ${normalizedFields.name || '-'}`,
    `Phone: ${normalizedFields.phone || '-'}`,
    `Email: ${normalizedFields.email || '-'}`,
    `Role: ${details.role}`,
    `Amount: ${formatINR(details.feeAmount)}`,
    '',
    'Please attach your payment screenshot in this WhatsApp chat for verification.',
    'After sending the screenshot, you will return to the registration form and enter your UTR / transaction ID.'
  ].join('\n');

  return `https://wa.me/${PAYMENT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function showWhatsappSentConfirmation() {
  const confirmWhatsappSentBtn = document.getElementById('confirmWhatsappSentBtn');

  if (confirmWhatsappSentBtn) {
    confirmWhatsappSentBtn.hidden = false;
    confirmWhatsappSentBtn.disabled = false;
  }
}

function confirmWhatsappScreenshotSent() {
  setUtrEntryEnabled(true);
  setPaymentStatus(
    'pending-verification',
    'Screenshot marked as sent on WhatsApp. Now enter the UTR / transaction ID below.'
  );
  document.getElementById('paymentReference')?.focus();
}

function sharePaymentScreenshotOnWhatsapp() {
  const form = document.getElementById('registrationForm');
  const details = getRegistrationPaymentDetails();

  if (!details.requiresPayment) {
    setPaymentStatus(
      'not-required',
      'No payment is required for this category. You can submit the registration directly.'
    );
    return;
  }

  if (form && !validatePhoneFields(form, 'registrationMessage')) return;

  const formData = new FormData(form);
  const normalizedFields = getNormalizedRegistrationFields(formData);

  if (!normalizedFields.name || !normalizedFields.email || !normalizedFields.phone || !normalizedFields.organization) {
    showMessage(
      'registrationMessage',
      'Please fill Name, Email, Phone, and Organization before opening WhatsApp.',
      'error'
    );
    return;
  }

  showWhatsappSentConfirmation();
  setPaymentStatus(
    'pending-verification',
    'WhatsApp opened. Attach the payment screenshot and send it. Then return here and click "I Sent the Screenshot on WhatsApp" to enter the UTR / transaction ID.'
  );

  window.open(buildPaymentWhatsappUrl(details), '_blank');
}

function resetPaymentProof() {
  const confirmWhatsappSentBtn = document.getElementById('confirmWhatsappSentBtn');

  setUtrEntryEnabled(false);

  if (confirmWhatsappSentBtn) {
    confirmWhatsappSentBtn.hidden = true;
    confirmWhatsappSentBtn.disabled = true;
  }

  setPaymentStatus(
    'pending-verification',
    'Pay first, open WhatsApp, send the payment screenshot, then confirm here to enable UTR entry.'
  );
}

function updateRegistrationPaymentUI({ keepPayment = false } = {}) {
  const role = document.getElementById('registrationRole')?.value || 'Delegate';
  const bulkBox = document.getElementById('bulkBookingBox');
  const studentCount = document.getElementById('studentCount');
  const openUpiBtn = document.getElementById('openUpiBtn');
  const sharePaymentWhatsappBtn = document.getElementById('sharePaymentWhatsappBtn');
  const confirmWhatsappSentBtn = document.getElementById('confirmWhatsappSentBtn');

  if (bulkBox) bulkBox.hidden = role !== 'Bulk Booking';
  if (studentCount) studentCount.required = role === 'Bulk Booking';

  const details = getRegistrationPaymentDetails();

  const feeAmount = document.getElementById('feeAmount');
  const discountPercent = document.getElementById('discountPercent');
  const selectedFeeText = document.getElementById('selectedFeeText');
  const selectedFeeNote = document.getElementById('selectedFeeNote');
  const paymentQrText = document.getElementById('paymentQrText');
  const paymentQrImage = document.getElementById('paymentQrImage');
  const paymentQrBox = document.querySelector('.payment-qr-box');
  const paymentReference = document.getElementById('paymentReference');

  if (feeAmount) feeAmount.value = details.feeAmount;
  if (discountPercent) discountPercent.value = details.discountPercent;

  if (selectedFeeText) {
    selectedFeeText.textContent = details.requiresPayment ? formatINR(details.feeAmount) : 'No Fee';
  }

  if (selectedFeeNote) {
    selectedFeeNote.textContent = details.note;
  }

  if (paymentQrBox) paymentQrBox.hidden = !details.requiresPayment;
  if (openUpiBtn) openUpiBtn.disabled = !details.requiresPayment;
  if (sharePaymentWhatsappBtn) sharePaymentWhatsappBtn.disabled = !details.requiresPayment;
  if (confirmWhatsappSentBtn && !details.requiresPayment) {
    confirmWhatsappSentBtn.hidden = true;
    confirmWhatsappSentBtn.disabled = true;
  }
  if (paymentReference) paymentReference.required = details.requiresPayment && paymentWhatsappShared;

  if (!details.requiresPayment) {
    setUtrEntryEnabled(false);
    setPaymentStatus(
      'not-required',
      'No payment is required for this category. You can submit the registration directly.'
    );
  } else {
    if (!keepPayment) resetPaymentProof();
    validateManualPaymentFields(details, false);
  }

  if (paymentQrText) {
    paymentQrText.textContent = `Pay ${formatINR(details.feeAmount)} using Google Pay, PhonePe, Paytm, BHIM, or any UPI app. After payment, open WhatsApp, send the payment screenshot to 7358327761, return to this form, confirm the screenshot was sent, then enter the UTR / transaction ID.`;
  }

  if (paymentQrImage && details.requiresPayment) {
    paymentQrImage.src = buildDynamicQrImageUrl(details);
    paymentQrImage.alt = `ICAIH 2026 UPI QR code for ${formatINR(details.feeAmount)}`;
    paymentQrImage.title = `Scan to pay ${formatINR(details.feeAmount)}`;
  }
}

['registrationRole', 'bulkOffer', 'studentCount'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', () => updateRegistrationPaymentUI());
  document.getElementById(id)?.addEventListener('change', () => updateRegistrationPaymentUI());
});

document.getElementById('paymentReference')?.addEventListener('input', () => {
  validateManualPaymentFields(getRegistrationPaymentDetails(), false);
});


document.getElementById('openUpiBtn')?.addEventListener('click', openManualUpiPayment);
document.getElementById('sharePaymentWhatsappBtn')?.addEventListener('click', sharePaymentScreenshotOnWhatsapp);
document.getElementById('confirmWhatsappSentBtn')?.addEventListener('click', confirmWhatsappScreenshotSent);

updateRegistrationPaymentUI();

/* =========================================================
   NAME FIELD VALIDATION
   Only letters and spaces allowed
   Works for Registration, Contact, and Sponsor forms
   ========================================================= */

function allowOnlyLetters(input) {
  input.addEventListener('input', function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, '');
  });

  input.addEventListener('keypress', function (event) {
    if (!/[A-Za-z\s]/.test(event.key)) {
      event.preventDefault();
    }
  });

  input.addEventListener('paste', function (event) {
    event.preventDefault();

    const pastedText = (event.clipboardData || window.clipboardData).getData('text');
    const cleanedText = pastedText.replace(/[^A-Za-z\s]/g, '');

    document.execCommand('insertText', false, cleanedText);
  });
}

document.querySelectorAll(
  'input[name="name"], input[name="fullName"], input[name="participantName"], input[name="contactPerson"]'
).forEach(allowOnlyLetters);

/* ── Registration field normalization ── */
function getNormalizedRegistrationFields(formData) {
  const name =
    formData.get('name') ||
    formData.get('fullName') ||
    formData.get('participantName') ||
    '';

  const email =
    formData.get('email') ||
    formData.get('emailAddress') ||
    '';

  const phone =
    formData.get('phone') ||
    formData.get('phoneNumber') ||
    formData.get('mobile') ||
    formData.get('mobileNumber') ||
    '';

  const organization =
    formData.get('organization') ||
    formData.get('institution') ||
    formData.get('company') ||
    formData.get('college') ||
    formData.get('hospital') ||
    '';

  return {
    name: String(name).trim(),
    email: String(email).trim(),
    phone: String(phone).trim(),
    organization: String(organization).trim()
  };
}

function applyNormalizedRegistrationFields(formData, normalizedFields) {
  formData.set('name', normalizedFields.name);
  formData.set('email', normalizedFields.email);
  formData.set('phone', normalizedFields.phone);
  formData.set('organization', normalizedFields.organization);
}

/* ── Generic JSON submit ── */
async function submitJsonForm(form, url, messageId) {
  if (!validatePhoneFields(form, messageId)) {
    return { ok: false };
  }

  const data = Object.fromEntries(new FormData(form).entries());

  showMessage(messageId, 'Submitting…', '');

  try {
    const response = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || 'Submission failed.');
    }

    showMessage(messageId, result.message || 'Submitted successfully.', 'ok');
    form.reset();

    return { ok: true, result, data };
  } catch (error) {
    showMessage(messageId, error.message || 'Unable to submit. Please try again.', 'error');
    return { ok: false };
  }
}

/* ════════════════════════════════════════════════════════════════
   SPONSOR MODAL
   ════════════════════════════════════════════════════════════════ */

function openSponsorModal() {
  const modal = document.getElementById('sponsorModal');
  if (!modal) return;

  const eventInfoEl = modal.querySelector('.success-event-info');

  if (eventInfoEl) {
    eventInfoEl.innerHTML = `
      <div><span>Date</span><strong>${EVENT_INFO.date}</strong></div>
      <div><span>Time</span><strong>${EVENT_INFO.time}</strong></div>
      <div><span>Venue</span><strong>${EVENT_INFO.venue}</strong></div>
      <div><span>Email</span><strong>${EVENT_INFO.email}</strong></div>
    `;
  }

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeSponsorModal() {
  const modal = document.getElementById('sponsorModal');
  if (!modal) return;

  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.getElementById('openSponsorModal')?.addEventListener('click', openSponsorModal);

document.querySelectorAll('.footer-sponsor-open').forEach(btn => {
  btn.addEventListener('click', openSponsorModal);
});

document.getElementById('closeSponsorModal')?.addEventListener('click', closeSponsorModal);

document.getElementById('sponsorModal')?.addEventListener('click', e => {
  if (e.target.id === 'sponsorModal') closeSponsorModal();
});

/* ════════════════════════════════════════════════════════════════
   REGISTRATION SUCCESS MODAL
   ════════════════════════════════════════════════════════════════ */

function openSuccessModal(formData, refId, emailStatus) {
  const modal = document.getElementById('successModal');
  if (!modal) return;

  const detailsEl = document.getElementById('successDetails');

  if (detailsEl) {
    const rows = [
      ['Name', formData.name],
      ['Email', formData.email],
      ['Phone', formData.phone],
      ['Organization', formData.organization],
      ['Role', formData.role || 'Delegate'],
      ['Category', formData.category || 'General'],
      ['Paid Amount', formatINR(formData.feeAmount)],
      ['Registration ID', refId || '—'],
      ['Payment Status', formData.paymentStatus || '—'],
      ['UTR / Transaction ID', formData.paymentReference || '—']
    ];

    detailsEl.innerHTML = rows.map(([label, value]) => `
      <div class="detail-row">
        <span>${label}</span>
        <span>${value || '—'}</span>
      </div>
    `).join('');
  }

  const noteEl = document.getElementById('successEmailStatus');

  if (noteEl) {
    noteEl.textContent =
      emailStatus ||
      'Registration saved. Payment UTR will be manually verified by the admin team.';
  }

  const eventInfoEl = modal.querySelector('.success-event-info');

  if (eventInfoEl) {
    eventInfoEl.innerHTML = `
      <div><span>Date</span><strong>${EVENT_INFO.date}</strong></div>
      <div><span>Time</span><strong>${EVENT_INFO.time}</strong></div>
      <div><span>Venue</span><strong>${EVENT_INFO.venue}</strong></div>
      <div><span>Email</span><strong>${EVENT_INFO.email}</strong></div>
    `;
  }

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeSuccessModal() {
  const modal = document.getElementById('successModal');
  if (!modal) return;

  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.getElementById('closeSuccessModal')?.addEventListener('click', closeSuccessModal);

document.getElementById('successModal')?.addEventListener('click', e => {
  if (e.target.id === 'successModal') closeSuccessModal();
});

/* ── Registration form submit ── */
document.getElementById('registrationForm')?.addEventListener('submit', async e => {
  e.preventDefault();

  const form = e.currentTarget;
  const details = getRegistrationPaymentDetails();

  if (details.role === 'Bulk Booking') {
    const offer = BULK_OFFERS[document.getElementById('bulkOffer')?.value || '5-25'];

    if (!details.studentCount || details.studentCount < offer.min || details.studentCount > offer.max) {
      showMessage(
        'registrationMessage',
        'Please enter a student count matching the selected bulk offer.',
        'error'
      );
      document.getElementById('studentCount')?.focus();
      return;
    }
  }

  if (!validatePhoneFields(form, 'registrationMessage')) return;

  const formData = new FormData(form);
  const normalizedFields = getNormalizedRegistrationFields(formData);

  if (
    !normalizedFields.name ||
    !normalizedFields.email ||
    !normalizedFields.phone ||
    !normalizedFields.organization
  ) {
    showMessage(
      'registrationMessage',
      'Name, email, phone, and organization are required.',
      'error'
    );
    return;
  }

  applyNormalizedRegistrationFields(formData, normalizedFields);

  if (!validateManualPaymentFields(details, true)) return;

  formData.set('feeAmount', String(details.feeAmount));
  formData.set('discountPercent', String(details.discountPercent));
  formData.set('studentCount', String(details.studentCount || ''));
  formData.set('bulkOffer', details.bulkOffer || '');
  formData.set('paymentConfirmed', details.requiresPayment ? 'utr-submitted' : 'not-required');
  formData.set('paymentStatus', details.requiresPayment ? 'pending-verification' : 'not-required');
  formData.set('paymentWhatsappShared', details.requiresPayment ? '1' : '0');

  showMessage('registrationMessage', 'Submitting registration…', '');

  try {
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || 'Registration failed.');
    }

    const modalData = Object.fromEntries(formData.entries());
    modalData.feeAmount = String(details.feeAmount);

    const refId =
      result?.id ||
      result?.ref_id ||
      result?.registrationId ||
      'ICAIH-' + Date.now().toString(36).toUpperCase();

    openSuccessModal(modalData, refId, result.emailStatus);

    showMessage(
      'registrationMessage',
      result.message || 'Registration submitted successfully. Payment UTR is pending manual verification.',
      'ok'
    );

    form.reset();
    resetPaymentProof();
    updateRegistrationPaymentUI();

  } catch (error) {
    showMessage(
      'registrationMessage',
      error.message || 'Unable to submit. Please try again.',
      'error'
    );
  }
});

/* ── Contact form submit ── */
document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();

  submitJsonForm(
    e.currentTarget,
    '/api/contact',
    'contactMessage'
  );
});

/* ── Sponsor form submit ── */
document.getElementById('sponsorForm')?.addEventListener('submit', async e => {
  e.preventDefault();

  const { ok } = await submitJsonForm(
    e.currentTarget,
    '/api/sponsor-inquiry',
    'sponsorMessage'
  );

  if (ok) {
    setTimeout(closeSponsorModal, 1600);
  }
});

/* ── Global ESC key ── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeSponsorModal();
    closeSuccessModal();
  }
});