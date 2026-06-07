/* ═══════════════════════════════════════════════════════════════
   ICAIH 2026 – Main JS
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

/* If website is opened using file path, use localhost backend */
const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';

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


/* ── Registration fee, QR amount, and payment confirmation ── */
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

function updateRegistrationPaymentUI() {
  const role = document.getElementById('registrationRole')?.value || 'Delegate';
  const bulkBox = document.getElementById('bulkBookingBox');
  const studentCount = document.getElementById('studentCount');
  const submitBtn = document.getElementById('registrationSubmitBtn');
  const confirmed = document.getElementById('paymentConfirmed');
  const confirmedLabel = document.querySelector('.payment-confirm-label');

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

  if (feeAmount) feeAmount.value = details.feeAmount;
  if (discountPercent) discountPercent.value = details.discountPercent;
  if (selectedFeeText) selectedFeeText.textContent = details.requiresPayment ? formatINR(details.feeAmount) : 'No Fee';
  if (selectedFeeNote) selectedFeeNote.textContent = details.note;

  if (paymentQrBox) paymentQrBox.hidden = !details.requiresPayment;
  if (confirmedLabel) confirmedLabel.hidden = !details.requiresPayment;
  if (!details.requiresPayment && confirmed) confirmed.checked = true;

  if (paymentQrText) paymentQrText.textContent = `Scan this QR code to pay ${formatINR(details.feeAmount)}.`;

  if (paymentQrImage && details.requiresPayment) {
    const params = new URLSearchParams({
      amount: String(details.feeAmount),
      role: details.role,
      count: String(details.studentCount || ''),
      t: String(Date.now())
    });
    paymentQrImage.src = `${API_BASE}/api/payment-qr?${params.toString()}`;
    paymentQrImage.onerror = () => {
      paymentQrImage.src = 'assets/qr/icaih-payment-qr.jpeg';
    };
  }

  if (submitBtn) {
    submitBtn.disabled = details.requiresPayment ? !confirmed?.checked : false;
  }
}

['registrationRole', 'bulkOffer', 'studentCount', 'paymentConfirmed'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', updateRegistrationPaymentUI);
  document.getElementById(id)?.addEventListener('change', updateRegistrationPaymentUI);
});

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
  'input[name="name"], input[name="contactPerson"]'
).forEach(allowOnlyLetters);

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
      ['Registration ID', refId || '—']
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
    noteEl.textContent = emailStatus || 'Registration saved. Confirmation email will be sent if SMTP is configured correctly.';
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

  if (details.requiresPayment && !document.getElementById('paymentConfirmed')?.checked) {
    showMessage('registrationMessage', 'Please scan the QR code, complete payment, and tick the confirmation checkbox.', 'error');
    return;
  }

  if (details.role === 'Bulk Booking') {
    const offer = BULK_OFFERS[document.getElementById('bulkOffer')?.value || '5-25'];
    if (!details.studentCount || details.studentCount < offer.min || details.studentCount > offer.max) {
      showMessage('registrationMessage', `Please enter a student count matching the selected bulk offer.`, 'error');
      document.getElementById('studentCount')?.focus();
      return;
    }
  }

  const formData = Object.fromEntries(new FormData(form).entries());
  formData.feeAmount = String(details.feeAmount);
  formData.discountPercent = String(details.discountPercent);
  formData.studentCount = String(details.studentCount || '');
  formData.paymentConfirmed = details.requiresPayment ? 'yes' : 'not-required';

  if (!validatePhoneFields(form, 'registrationMessage')) return;

  showMessage('registrationMessage', 'Submitting…', '');

  try {
    const response = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || 'Registration failed.');
    }

    const refId = result?.id || result?.ref_id || 'ICAIH-' + Date.now().toString(36).toUpperCase();
    openSuccessModal(formData, refId, result.emailStatus);
    showMessage('registrationMessage', result.emailStatus || 'Registration submitted successfully.', 'ok');
    form.reset();
    updateRegistrationPaymentUI();
  } catch (error) {
    showMessage('registrationMessage', error.message || 'Unable to submit. Please try again.', 'error');
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