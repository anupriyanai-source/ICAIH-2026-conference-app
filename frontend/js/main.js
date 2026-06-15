/* ═══════════════════════════════════════════════════════════════
   ICAIH 2026 – Main JS
   Crowdshaki / Razorpay Dynamic UPI Payment Flow
   ═══════════════════════════════════════════════════════════════ */

/* ── Countdown ── */
function updateCountdown() {
  const target = new Date('2026-07-18T09:30:00+05:30');
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
const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.04, rootMargin: '0px 0px -5% 0px' });

  revealElements.forEach(el => observer.observe(el));
} else {
  revealElements.forEach(el => el.classList.add('visible'));
}

window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.speaker-grid.reveal, .card-grid.reveal').forEach(el => {
      el.classList.add('visible');
    });
  }, 250);
});

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
const PAYMENT_PAGE_REFERENCE_NUMBER = '917358327761';

const EVENT_INFO = {
  date: '18 July 2026',
  time: '9:30 AM – 5:30 PM',
  venue: 'Anna Centenary Library, Kotturpuram, Chennai',
  email: 'info@mrtech.co.in',
  emailHref: 'mailto:info@mrtech.co.in?subject=ICAIH%202026%20Inquiry&body=Dear%20ICAIH%202026%20Team%2C%0D%0A%0D%0A'
};

const REGISTRATION_FEES = {
  'Student': 499,
  'Research Scholar': 999,
  'Healthcare Professional': 1499,
  'Delegate': 1499,
  'Startup Founder': 1999,
  'Industry Expert': 2499,
  'Online Attendee': 325,
  'Speaker': 0
};

const BULK_OFFERS = {
  '5-25': { min: 5, max: 25, discount: 10, label: 'Student Group: 5 to 25 Students - 10% Discount' },
  '25-50': { min: 25, max: 50, discount: 20, label: 'Student Group: 25 to 50 Students - 20% Discount' },
  '50-plus': { min: 50, max: Infinity, discount: 25, label: 'Student Group: 50+ Students - 25% Discount' }
};

const CROWDSHAKI_PAYMENT = {
  baseUrl: 'https://www.crowdshaki.in/payment',
  fundraiserId: '69c7b186eac7d838c9f98d37',
  imageUrl: 'https://res.cloudinary.com/dooupjyum/image/upload/v1781069610/crowdshaki/campaigns/w5zufyrhjohbyi9tlxct.png',
  reasonForFund: 'Health for all @ Gross root Level',
  paymentForPrefix: 'ICAIH 2026 Registration'
};


const SPONSOR_ICONS = {
  title: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 15.5L4.5 7.5l4.7 3.2L12 5l2.8 5.7 4.7-3.2-1.5 8H6z" />
      <path d="M6.5 19h11" />
    </svg>`,
  partnership: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7.5 12.5l2.2 2.2c.7.7 1.8.7 2.5 0l4.3-4.3" />
      <path d="M8.5 9.5l2-2c1.1-1.1 2.9-1.1 4 0l1 1" />
      <path d="M5 12l-1.3 1.3c-.9.9-.9 2.3 0 3.2l2.8 2.8c.9.9 2.3.9 3.2 0l1.3-1.3" />
      <path d="M19 12l1.3 1.3c.9.9.9 2.3 0 3.2l-2.8 2.8c-.9.9-2.3.9-3.2 0L13 18" />
    </svg>`,
  innovation: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3v3" />
      <path d="M5.6 5.6l2.1 2.1" />
      <path d="M18.4 5.6l-2.1 2.1" />
      <path d="M9 15.5h6" />
      <path d="M10 19h4" />
      <path d="M8.5 12a3.5 3.5 0 117 0c0 1.4-.8 2.2-1.5 3h-4c-.7-.8-1.5-1.6-1.5-3z" />
    </svg>`,
  premium: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3l7 4v6c0 4.2-2.8 6.8-7 8-4.2-1.2-7-3.8-7-8V7l7-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>`,
  ai: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="6" y="6" width="12" height="12" rx="2.5" />
      <path d="M9.5 3v3" />
      <path d="M14.5 3v3" />
      <path d="M9.5 18v3" />
      <path d="M14.5 18v3" />
      <path d="M3 9.5h3" />
      <path d="M18 9.5h3" />
      <path d="M3 14.5h3" />
      <path d="M18 14.5h3" />
      <path d="M10 14l1.2-4h1.6l1.2 4" />
      <path d="M10.6 12.5h2.8" />
    </svg>`,
  award: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="8" r="4" />
      <path d="M9.5 12l-1.8 7 4.3-2.2 4.3 2.2-1.8-7" />
    </svg>`,
  kit: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 8V6.5A2.5 2.5 0 019.5 4h5A2.5 2.5 0 0117 6.5V8" />
      <rect x="5" y="8" width="14" height="11" rx="2" />
      <path d="M9 12h6" />
      <path d="M9 15h4" />
    </svg>`,
  knowledge: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 5.5A2.5 2.5 0 017.5 3H20v16H7.5A2.5 2.5 0 015 16.5v-11z" />
      <path d="M5 16.5A2.5 2.5 0 017.5 14H20" />
      <path d="M9 7h7" />
      <path d="M9 10h5" />
    </svg>`,
  technology: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="4" y="5" width="16" height="11" rx="2" />
      <path d="M8 20h8" />
      <path d="M12 16v4" />
      <path d="M9 10l2 2 4-4" />
    </svg>`,
  healthcare: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z" />
      <path d="M12 8v6" />
      <path d="M9 11h6" />
    </svg>`,
  silver: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3l2.4 5 5.4.8-3.9 3.8.9 5.4-4.8-2.6L7.2 18l.9-5.4-3.9-3.8 5.4-.8L12 3z" />
    </svg>`,
  associate: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
      <circle cx="12" cy="12" r="7" />
    </svg>`
};

const SPONSOR_PACKAGES = [
  {
    title: 'Title Sponsor',
    amount: 2999999,
    accent: '#f7d96b',
    icon: SPONSOR_ICONS.title,
    benefits: [
      'Main conference branding and naming association',
      'Chief Guest speaking opportunity',
      'Logo on all branding materials, stage backdrop, and certificates',
      'Exclusive exhibition pavilion',
      'Premium media visibility and VIP networking access',
      'Delegate registrations and premium passes'
    ]
  },
  {
    title: 'Co-Title Sponsor',
    amount: 1999999,
    accent: '#b0c4f7',
    icon: SPONSOR_ICONS.partnership,
    benefits: [
      'Co-branding across conference materials',
      'Speaking opportunity in a key session',
      'Exhibition stall',
      'Social media and website promotions',
      'Delegate passes'
    ]
  },
  {
    title: 'Healthcare Innovation Sponsor',
    amount: 999999,
    accent: '#7ecba1',
    icon: SPONSOR_ICONS.innovation,
    benefits: [
      'Recognition as Official Healthcare Innovation Sponsor',
      'Keynote speaking opportunity',
      'Dedicated exhibition pavilion',
      'Healthcare innovation showcase session',
      'Product or service demonstration',
      'Panel discussion participation and VIP networking'
    ]
  },
  {
    title: 'Platinum Sponsor',
    amount: 499999,
    accent: '#c0c7d8',
    icon: SPONSOR_ICONS.premium,
    benefits: [
      'Prominent logo placement',
      'Technical session sponsorship',
      'Product demonstration slot',
      'Exhibition booth',
      'Networking session access',
      'Stage recognition'
    ]
  },
  {
    title: 'AI Transformation Sponsor',
    amount: 499999,
    accent: '#9bb7ff',
    icon: SPONSOR_ICONS.ai,
    benefits: [
      'Recognition as Official AI Transformation Sponsor',
      'Lead technical session on AI applications',
      'Demonstration area for AI solutions',
      'Branding across digital and print collateral',
      'Panel participation with government and industry leaders',
      'Dedicated promotional campaign'
    ]
  },
  {
    title: 'Gold Sponsor',
    amount: 299999,
    accent: '#f7d96b',
    icon: SPONSOR_ICONS.award,
    benefits: [
      'Logo placement',
      'Stall space',
      'Website listing',
      'Branding in event materials',
      'Delegate participation',
      'Promotional materials distribution'
    ]
  },
  {
    title: 'Delegate Kit Sponsor',
    amount: 299999,
    accent: '#f59e0b',
    icon: SPONSOR_ICONS.kit,
    benefits: [
      'Logo on conference bags',
      'Logo on delegate kits',
      'Promotional inserts',
      'Brand visibility among all delegates'
    ]
  },
  {
    title: 'Knowledge Partner',
    amount: 199999,
    accent: '#60a5fa',
    icon: SPONSOR_ICONS.knowledge,
    benefits: [
      'Academic branding',
      'Research visibility',
      'Technical paper presentation',
      'Session moderation rights',
      'Suitable for universities, research institutions, and think tanks'
    ]
  },
  {
    title: 'Technology Partner',
    amount: 199999,
    accent: '#22c55e',
    icon: SPONSOR_ICONS.technology,
    benefits: [
      'Technology showcase',
      'Demo zone',
      'Innovation awards sponsorship',
      'Digital health and cloud solution visibility',
      'Suitable for AI, software, digital health, and cloud providers'
    ]
  },
  {
    title: 'Healthcare Partner',
    amount: 199999,
    accent: '#38bdf8',
    icon: SPONSOR_ICONS.healthcare,
    benefits: [
      'Healthcare sector visibility and branding',
      'Clinical innovation showcase',
      'Healthcare exhibition',
      'Suitable for hospitals, medical device companies, and HealthTech organizations'
    ]
  },
  {
    title: 'Silver Sponsor',
    amount: 99999,
    accent: '#c0c0c0',
    icon: SPONSOR_ICONS.silver,
    benefits: [
      'Logo visibility',
      'Event recognition',
      'Delegate entry',
      'Small exhibition area',
      'Conference kit inclusion'
    ]
  },
  {
    title: 'Associate Sponsor',
    amount: 99999,
    accent: '#a78bfa',
    icon: SPONSOR_ICONS.associate,
    benefits: [
      'Basic sponsor branding and promotion',
      'Event support recognition',
      'Website and brochure visibility',
      'Limited branding'
    ]
  },
  {
    title: 'Premium Exhibitor',
    amount: 39999,
    accent: '#8a6a00',
    icon: SPONSOR_ICONS.premium,
    benefits: [
      'Exhibition Booth (3m × 3m)',
      'Spacious stall for product and service showcase',
      'Display banners, brochures, standees, and live demos',
      'Direct interaction with healthcare professionals and delegates',
      'Brand visibility on ICAIH 2026 website',
      'Company profile included in the official exhibitor directory',
      'Two complimentary delegate passes'
    ]
  },
  {
    title: 'Standard Exhibitor',
    amount: 34999,
    accent: '#12315f',
    icon: SPONSOR_ICONS.associate,
    benefits: [
      'Exhibition Booth (2m × 2m)',
      'Dedicated stall space for showcasing products and services',
      'Opportunity to engage directly with participants',
      'Company information included in the exhibitor booklet',
      'One free delegate pass for company representative',
      'Brand exposure among healthcare professionals, students, and researchers'
    ]
  },
  {
    title: 'Standard Pavilion',
    amount: 29999,
    accent: '#087447',
    icon: SPONSOR_ICONS.innovation,
    benefits: [
      'Startup showcase space',
      'Dedicated table space in the Startup Pavilion',
      'Present innovative healthcare and AI solutions',
      'Startup profile included in the official conference directory',
      'Meet potential investors and funding partners',
      'Interact with AI experts, researchers, and industry leaders',
      'Opportunity to demonstrate ideas and gain valuable feedback',
      'Build collaborations for future growth'
    ]
  }
];

const SPONSOR_FEES = SPONSOR_PACKAGES.reduce((fees, pkg) => {
  fees[pkg.title] = pkg.amount;
  return fees;
}, {});

function renderSponsorPackages() {
  const grid = document.getElementById('sponsorPackagesGrid');
  if (!grid) return;

  grid.innerHTML = SPONSOR_PACKAGES.map((pkg, index) => `
    <article class="feature-panel reveal sponsor-package-card" style="border-top:4px solid ${pkg.accent};">
      <div class="sponsor-card-head">
        <span class="sponsor-card-icon" style="color:${pkg.accent}; border-color:${pkg.accent}; background:${pkg.accent}1A;" aria-hidden="true">${pkg.icon}</span>
        <h3 style="color:${pkg.accent};">${pkg.title}</h3>
      </div>
      <p class="sponsor-card-amount">${formatINR(pkg.amount)}</p>
      <ul class="check-list">
        ${pkg.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
      </ul>
    </article>
  `).join('');

  grid.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
}

function populateSponsorTierOptions() {
  const select = document.getElementById('sponsorTier');
  if (!select) return;

  select.innerHTML = '<option value="">Select Tier</option>' + SPONSOR_PACKAGES
    .map(pkg => `<option value="${pkg.title}">${pkg.title} – ${formatINR(pkg.amount)}</option>`)
    .join('');
}

renderSponsorPackages();
populateSponsorTierOptions();

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

  setPaymentStatus(
    'pending-verification',
    'Payment will be verified from the secure payment page after submission.'
  );

  return true;
}

function buildCrowdshakiPaymentUrl(details) {
  const form = document.getElementById('registrationForm');
  const formData = form ? new FormData(form) : new FormData();
  const normalizedFields = getNormalizedRegistrationFields(formData);

  const params = new URLSearchParams({
    fundraiserId: CROWDSHAKI_PAYMENT.fundraiserId,
    imageUrl: CROWDSHAKI_PAYMENT.imageUrl,
    reasonForFund: CROWDSHAKI_PAYMENT.reasonForFund,
    amount: String(details.feeAmount),
    registrationRole: details.role,
    paymentFor: `${CROWDSHAKI_PAYMENT.paymentForPrefix} - ${details.role}`,
    name: normalizedFields.name,
    email: normalizedFields.email,
    phone: normalizedFields.phone
  });

  return `${CROWDSHAKI_PAYMENT.baseUrl}?${params.toString()}`;
}

function buildDynamicQrImageUrl(details) {
  const paymentPageUrl = buildCrowdshakiPaymentUrl(details);

  const qrParams = new URLSearchParams({
    size: '260x260',
    margin: '10',
    data: paymentPageUrl
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

  const formData = form ? new FormData(form) : new FormData();
  const normalizedFields = getNormalizedRegistrationFields(formData);

  if (!normalizedFields.name || !normalizedFields.email || !normalizedFields.phone || !normalizedFields.organization) {
    showMessage(
      'registrationMessage',
      'Please fill Name, Email, Phone, and Organization before opening the payment page.',
      'error'
    );
    return;
  }

  showMessage(
    'registrationMessage',
    'Opening the secure Crowdshaki / Razorpay payment page. Complete the payment there, then return here and submit the sponsor inquiry.',
    ''
  );

  const paymentPageUrl = buildCrowdshakiPaymentUrl(details);
  const opened = window.open(paymentPageUrl, '_blank', 'noopener');

  if (!opened) {
    window.location.href = paymentPageUrl;
  }
}

function setUtrEntryEnabled(enabled) {
  const paymentReference = document.getElementById('paymentReference');
  const utrField = document.getElementById('utrField');
  const utrHelpText = document.getElementById('utrHelpText');
  const paymentPageSharedInput = document.getElementById('paymentPageShared');

  

  if (paymentPageSharedInput) paymentPageSharedInput.value = enabled ? '1' : '0';

  if (utrField) utrField.hidden = !enabled;
  if (utrHelpText) utrHelpText.hidden = !enabled;

  if (paymentReference) {
    paymentReference.disabled = !enabled;
    paymentReference.required = enabled;
    if (!enabled) paymentReference.value = '';
  }
}

function buildPaymentPaymentPageUrl(details) {
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
    'Please attach your payment screenshot in this payment page chat for verification.',
    'Complete the payment and return to submit the registration form.'
  ].join('\n');

  return `https://example.com/${PAYMENT_PAGE_REFERENCE_NUMBER}?text=${encodeURIComponent(message)}`;
}

function showPaymentPageSentConfirmation() {
  const confirmPaymentPageSentBtn = document.getElementById('confirmPaymentPageSentBtn');

  if (confirmPaymentPageSentBtn) {
    confirmPaymentPageSentBtn.hidden = false;
    confirmPaymentPageSentBtn.disabled = false;
  }
}

function confirmPaymentPageScreenshotSent() {
  setUtrEntryEnabled(true);
  setPaymentStatus(
    'pending-verification',
    'Payment page opened. You can now submit the form.'
  );
  document.getElementById('paymentReference')?.focus();
}

function sharePaymentScreenshotOnPaymentPage() {
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
      'Please fill Name, Email, Phone, and Organization before opening payment page.',
      'error'
    );
    return;
  }

  showPaymentPageSentConfirmation();
  setPaymentStatus(
    'pending-verification',
    'Payment page opened. Complete the payment there, then return here and submit the form.'
  );

  window.open(buildPaymentPaymentPageUrl(details), '_blank');
}

function resetPaymentProof() {
  const confirmPaymentPageSentBtn = document.getElementById('confirmPaymentPageSentBtn');

  setUtrEntryEnabled(false);

  if (confirmPaymentPageSentBtn) {
    confirmPaymentPageSentBtn.hidden = true;
    confirmPaymentPageSentBtn.disabled = true;
  }

  setPaymentStatus(
    'pending-verification',
    'Click Pay Now to open the secure payment page for this fee.'
  );
}

function updateRegistrationPaymentUI({ keepPayment = false } = {}) {
  const role = document.getElementById('registrationRole')?.value || 'Delegate';
  const bulkBox = document.getElementById('bulkBookingBox');
  const studentCount = document.getElementById('studentCount');
  const openUpiBtn = document.getElementById('openUpiBtn');
  const sharePaymentPaymentPageBtn = document.getElementById('sharePaymentPaymentPageBtn');
  const confirmPaymentPageSentBtn = document.getElementById('confirmPaymentPageSentBtn');

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
  if (sharePaymentPaymentPageBtn) sharePaymentPaymentPageBtn.disabled = !details.requiresPayment;

  if (confirmPaymentPageSentBtn && !details.requiresPayment) {
    confirmPaymentPageSentBtn.hidden = true;
    confirmPaymentPageSentBtn.disabled = true;
  }

  if (paymentReference) paymentReference.required = false;

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
    paymentQrText.textContent = `Pay ${formatINR(details.feeAmount)} through the secure Crowdshaki / Razorpay page using Google Pay, PhonePe, Paytm, BHIM, or any UPI app.`;
  }

  if (paymentQrImage && details.requiresPayment) {
    paymentQrImage.src = buildDynamicQrImageUrl(details);
    paymentQrImage.alt = `ICAIH 2026 secure payment page QR code for ${formatINR(details.feeAmount)}`;
    paymentQrImage.title = `Scan to open secure payment page for ${formatINR(details.feeAmount)}`;
  }
}

['registrationRole', 'bulkOffer', 'studentCount'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', () => updateRegistrationPaymentUI());
  document.getElementById(id)?.addEventListener('change', () => updateRegistrationPaymentUI());
});

['name', 'fullName', 'participantName', 'email', 'emailAddress', 'phone', 'organization'].forEach(fieldName => {
  document.querySelector(`[name="${fieldName}"]`)?.addEventListener('input', () => {
    updateRegistrationPaymentUI({ keepPayment: true });
  });
});

document.getElementById('paymentReference')?.addEventListener('input', () => {
  validateManualPaymentFields(getRegistrationPaymentDetails(), false);
});

document.getElementById('openUpiBtn')?.addEventListener('click', openManualUpiPayment);
document.getElementById('sharePaymentPaymentPageBtn')?.addEventListener('click', sharePaymentScreenshotOnPaymentPage);
document.getElementById('confirmPaymentPageSentBtn')?.addEventListener('click', confirmPaymentPageScreenshotSent);

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
      <div><span>Email</span><strong><a href="${EVENT_INFO.emailHref}" target="_blank" rel="noopener">${EVENT_INFO.email}</a></strong></div>
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
   SPONSOR PAYMENT FLOW
   ════════════════════════════════════════════════════════════════ */

let sponsorPaymentPageShared = false;

function getSponsorPaymentDetails() {
  const sponsorTier = document.getElementById('sponsorTier')?.value || '';
  const feeAmount = Number(SPONSOR_FEES[sponsorTier] || 0);

  return {
    sponsorTier,
    feeAmount,
    requiresPayment: feeAmount > 0,
    note: sponsorTier
      ? `${sponsorTier} sponsorship fee`
      : 'Select a sponsorship tier to view the fee.'
  };
}

function setSponsorPaymentStatus(status, message) {
  const paymentStatus = document.getElementById('sponsorPaymentStatus');
  const paymentStatusText = document.getElementById('sponsorPaymentStatusText');

  if (paymentStatus) paymentStatus.value = status;

  if (paymentStatusText) {
    paymentStatusText.textContent = message || '';
    paymentStatusText.classList.toggle('verified', status === 'not-required');
    paymentStatusText.classList.toggle('manual-pending', status === 'pending-verification');
  }
}

function setSponsorUtrEntryEnabled(enabled) {
  const paymentReference = document.getElementById('sponsorPaymentReference');
  const utrField = document.getElementById('sponsorUtrField');
  const paymentPageSharedInput = document.getElementById('sponsorPaymentPaymentPageShared');

  sponsorPaymentPageShared = Boolean(enabled);

  if (paymentPageSharedInput) paymentPageSharedInput.value = enabled ? '1' : '0';

  if (utrField) utrField.hidden = !enabled;

  if (paymentReference) {
    paymentReference.disabled = !enabled;
    paymentReference.required = enabled;
    if (!enabled) paymentReference.value = '';
  }
}

function resetSponsorPaymentProof() {
  const confirmBtn = document.getElementById('confirmSponsorPaymentPageSentBtn');

  setSponsorUtrEntryEnabled(false);

  if (confirmBtn) {
    confirmBtn.hidden = true;
    confirmBtn.disabled = true;
  }

  setSponsorPaymentStatus(
    'pending-verification',
    'Click Pay Now to open the secure payment page for this fee.'
  );
}

function getNormalizedSponsorFields(formData) {
  return {
    companyName: String(formData.get('companyName') || '').trim(),
    contactPerson: String(formData.get('contactPerson') || '').trim(),
    email: String(formData.get('email') || '').trim(),
    phone: String(formData.get('phone') || '').trim()
  };
}

function buildSponsorPaymentUrl(details) {
  const form = document.getElementById('sponsorForm');
  const formData = form ? new FormData(form) : new FormData();
  const fields = getNormalizedSponsorFields(formData);

  const params = new URLSearchParams({
    fundraiserId: CROWDSHAKI_PAYMENT.fundraiserId,
    imageUrl: CROWDSHAKI_PAYMENT.imageUrl,
    reasonForFund: CROWDSHAKI_PAYMENT.reasonForFund,
    amount: String(details.feeAmount),
    registrationRole: details.sponsorTier || 'Sponsor',
    paymentFor: `ICAIH 2026 Sponsorship - ${details.sponsorTier || 'Sponsor'}`,
    name: fields.contactPerson || fields.companyName,
    email: fields.email,
    phone: fields.phone
  });

  return `${CROWDSHAKI_PAYMENT.baseUrl}?${params.toString()}`;
}

function buildSponsorDynamicQrImageUrl(details) {
  const paymentPageUrl = buildSponsorPaymentUrl(details);

  const qrParams = new URLSearchParams({
    size: '260x260',
    margin: '10',
    data: paymentPageUrl
  });

  return `https://api.qrserver.com/v1/create-qr-code/?${qrParams.toString()}`;
}

function validateSponsorPaymentFields(details, showError = false) {
  if (!details.sponsorTier) {
    if (showError) {
      showMessage('sponsorMessage', 'Please select a sponsorship tier.', 'error');
      document.getElementById('sponsorTier')?.focus();
    }
    return false;
  }

  setSponsorPaymentStatus(
    'pending-verification',
    'Payment will be verified from the secure payment page after submission.'
  );

  return true;
}

function updateSponsorPaymentUI({ keepPayment = false } = {}) {
  const details = getSponsorPaymentDetails();

  const feeAmount = document.getElementById('sponsorFeeAmount');
  const selectedFeeText = document.getElementById('sponsorSelectedFeeText');
  const selectedFeeNote = document.getElementById('sponsorSelectedFeeNote');
  const paymentQrText = document.getElementById('sponsorPaymentQrText');
  const paymentQrImage = document.getElementById('sponsorPaymentQrImage');
  const openPaymentBtn = document.getElementById('openSponsorPaymentBtn');
  const sharePaymentPageBtn = document.getElementById('shareSponsorPaymentPageBtn');

  if (feeAmount) feeAmount.value = details.feeAmount;

  if (selectedFeeText) {
    selectedFeeText.textContent = details.requiresPayment ? formatINR(details.feeAmount) : 'Select Tier';
  }

  if (selectedFeeNote) {
    selectedFeeNote.textContent = details.note;
  }

  if (openPaymentBtn) openPaymentBtn.disabled = !details.requiresPayment;
  if (sharePaymentPageBtn) sharePaymentPageBtn.disabled = !details.requiresPayment;

  if (!keepPayment) resetSponsorPaymentProof();

  if (paymentQrText) {
    paymentQrText.textContent = details.requiresPayment
      ? `Pay ${formatINR(details.feeAmount)} through the secure Crowdshaki / Razorpay page using Google Pay, PhonePe, Paytm, BHIM, or any UPI app.`
      : 'Select a sponsorship tier to generate the secure payment page and QR code.';
  }

  if (paymentQrImage && details.requiresPayment) {
    paymentQrImage.src = buildSponsorDynamicQrImageUrl(details);
    paymentQrImage.alt = `ICAIH 2026 sponsor payment page QR code for ${formatINR(details.feeAmount)}`;
    paymentQrImage.title = `Scan to open sponsor payment page for ${formatINR(details.feeAmount)}`;
  }

  validateSponsorPaymentFields(details, false);
}

function openSponsorPaymentPage() {
  const form = document.getElementById('sponsorForm');
  const details = getSponsorPaymentDetails();

  if (!details.sponsorTier) {
    showMessage('sponsorMessage', 'Please select a sponsorship tier before opening the payment page.', 'error');
    document.getElementById('sponsorTier')?.focus();
    return;
  }

  if (form && !validatePhoneFields(form, 'sponsorMessage')) return;

  const fields = getNormalizedSponsorFields(new FormData(form));

  if (!fields.companyName || !fields.contactPerson || !fields.email || !fields.phone) {
    showMessage(
      'sponsorMessage',
      'Please fill Company Name, Contact Person, Email, and Phone before opening the payment page.',
      'error'
    );
    return;
  }

  showMessage(
    'sponsorMessage',
    'Opening the secure Crowdshaki / Razorpay payment page. Complete the payment there, then return here and submit the sponsor inquiry.',
    ''
  );

  const paymentPageUrl = buildSponsorPaymentUrl(details);
  const opened = window.open(paymentPageUrl, '_blank', 'noopener');

  if (!opened) {
    window.location.href = paymentPageUrl;
  }
}

function buildSponsorPaymentPaymentPageUrl(details) {
  const form = document.getElementById('sponsorForm');
  const formData = new FormData(form);
  const fields = getNormalizedSponsorFields(formData);

  const message = [
    'Hi, I have completed my ICAIH 2026 sponsorship payment.',
    '',
    `Company: ${fields.companyName || '-'}`,
    `Contact Person: ${fields.contactPerson || '-'}`,
    `Phone: ${fields.phone || '-'}`,
    `Email: ${fields.email || '-'}`,
    `Sponsorship Tier: ${details.sponsorTier || '-'}`,
    `Amount: ${formatINR(details.feeAmount)}`,
    '',
    'Please attach your payment screenshot here.'
  ].join('\n');

  return `https://example.com/${PAYMENT_PAGE_REFERENCE_NUMBER}?text=${encodeURIComponent(message)}`;
}

function showSponsorPaymentPageSentConfirmation() {
  const confirmBtn = document.getElementById('confirmSponsorPaymentPageSentBtn');

  if (confirmBtn) {
    confirmBtn.hidden = false;
    confirmBtn.disabled = false;
  }
}

function openSponsorPaymentPaymentPage() {
  const form = document.getElementById('sponsorForm');
  const details = getSponsorPaymentDetails();

  if (!details.sponsorTier) {
    showMessage('sponsorMessage', 'Please select a sponsorship tier before opening payment page.', 'error');
    document.getElementById('sponsorTier')?.focus();
    return;
  }

  if (form && !validatePhoneFields(form, 'sponsorMessage')) return;

  const fields = getNormalizedSponsorFields(new FormData(form));

  if (!fields.companyName || !fields.contactPerson || !fields.email || !fields.phone) {
    showMessage(
      'sponsorMessage',
      'Please fill Company Name, Contact Person, Email, and Phone before opening payment page.',
      'error'
    );
    return;
  }

  showSponsorPaymentPageSentConfirmation();
  setSponsorPaymentStatus(
    'pending-verification',
    'Payment page opened. Complete the payment there, then return here and submit the form.'
  );

  window.open(buildSponsorPaymentPaymentPageUrl(details), '_blank');
}

document.getElementById('sponsorTier')?.addEventListener('input', () => updateSponsorPaymentUI());
document.getElementById('sponsorTier')?.addEventListener('change', () => updateSponsorPaymentUI());

['companyName', 'contactPerson', 'email', 'phone'].forEach(fieldName => {
  document.querySelector(`#sponsorForm [name="${fieldName}"]`)?.addEventListener('input', () => {
    updateSponsorPaymentUI({ keepPayment: true });
  });
});

document.getElementById('sponsorPaymentReference')?.addEventListener('input', () => {
  validateSponsorPaymentFields(getSponsorPaymentDetails(), false);
});

document.getElementById('openSponsorPaymentBtn')?.addEventListener('click', openSponsorPaymentPage);
document.getElementById('shareSponsorPaymentPageBtn')?.addEventListener('click', openSponsorPaymentPaymentPage);

document.getElementById('confirmSponsorPaymentPageSentBtn')?.addEventListener('click', () => {
  setSponsorUtrEntryEnabled(true);
  setSponsorPaymentStatus(
    'pending-verification',
    'Payment page opened. Submit the sponsor inquiry after completing the payment.'
  );
  document.getElementById('sponsorPaymentReference')?.focus();
});

updateSponsorPaymentUI();

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
      ['Payment Status', formData.paymentStatus || '—']
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
      'Registration saved. Payment will be verified by the admin team.';
  }

  const eventInfoEl = modal.querySelector('.success-event-info');

  if (eventInfoEl) {
    eventInfoEl.innerHTML = `
      <div><span>Date</span><strong>${EVENT_INFO.date}</strong></div>
      <div><span>Time</span><strong>${EVENT_INFO.time}</strong></div>
      <div><span>Venue</span><strong>${EVENT_INFO.venue}</strong></div>
      <div><span>Email</span><strong><a href="${EVENT_INFO.emailHref}" target="_blank" rel="noopener">${EVENT_INFO.email}</a></strong></div>
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
  formData.set('paymentConfirmed', details.requiresPayment ? 'payment-page-opened' : 'not-required');
  formData.set('paymentStatus', details.requiresPayment ? 'pending-verification' : 'not-required');
  formData.delete('paymentPageShared');

  const submitButton = form.querySelector('button[type="submit"]');
  const originalSubmitText = submitButton ? submitButton.textContent : '';

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
  }

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
      result.message || 'Registration submitted successfully. Payment is pending verification.',
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
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalSubmitText || 'Submit Registration';
    }
  }
});

/* ── Sponsor form submit ── */
document.getElementById('sponsorForm')?.addEventListener('submit', async e => {
  e.preventDefault();

  const form = e.currentTarget;
  const details = getSponsorPaymentDetails();

  if (!validatePhoneFields(form, 'sponsorMessage')) return;

  if (!validateSponsorPaymentFields(details, true)) return;

  const formData = new FormData(form);
  formData.set('feeAmount', String(details.feeAmount));
  formData.set('paymentStatus', 'pending-verification');
  formData.delete('paymentPageShared');

  const submitButton = form.querySelector('button[type="submit"]');
  const originalSubmitText = submitButton ? submitButton.textContent : '';

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
  }

  showMessage('sponsorMessage', 'Submitting sponsor inquiry…', '');

  try {
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch(`${API_BASE}/api/sponsor-inquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || 'Sponsor inquiry failed.');
    }

    showMessage(
      'sponsorMessage',
      result.message || 'Sponsor inquiry submitted successfully. Payment is pending verification.',
      'ok'
    );

    form.reset();
    resetSponsorPaymentProof();
    updateSponsorPaymentUI();

    setTimeout(closeSponsorModal, 2200);
  } catch (error) {
    showMessage(
      'sponsorMessage',
      error.message || 'Unable to submit. Please try again.',
      'error'
    );
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalSubmitText || 'Submit Sponsor Inquiry';
    }
  }
});

/* ── Global ESC key ── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeSponsorModal();
    closeSuccessModal();
  }
});
/* ════════════════════════════════════════════════════════════════
   APPLY NOW: COMPETITION APPLICATION + RESEARCH PAPER SUBMISSION
   ════════════════════════════════════════════════════════════════ */

const APPLICATION_CATEGORY_OPTIONS = {
  'pre-conference-competition': [
    'School Student', 'UG Student', 'PG Student', 'Medical Student', 'Engineering Student',
    'Nursing Student', 'Pharmacy Student', 'Research Scholar', 'PhD Scholar',
    'Faculty / Researcher', 'Startup / Innovator', 'Other'
  ],
  'research-paper': [
    'UG Student', 'PG Student', 'Research Scholar', 'Faculty Member',
    'Doctor / Healthcare Professional', 'Industry Professional', 'Startup Founder', 'Other'
  ]
};

const APPLICATION_TOPIC_OPTIONS = {
  'pre-conference-competition': [
    'AI in Healthcare', 'Medical Imaging', 'Digital Health', 'Healthcare Analytics',
    'Healthcare Innovation', 'Rural Healthcare', 'Telemedicine', 'Healthcare 2035', 'Other'
  ],
  'research-paper': [
    'AI in Diagnostics', 'AI in Medical Imaging', 'AI for Public Health', 'AI in Rural Healthcare',
    'AI in Telemedicine', 'Clinical Decision Support Systems', 'Digital Health and Smart Hospitals',
    'AI Ethics and Patient Safety', 'Healthcare Data Privacy and Security', 'Healthcare AI Startups',
    'Biomedical AI Devices', 'Other'
  ]
};

function populateSelectOptions(selectId, options, selectedValue = '') {
  const select = document.getElementById(selectId);
  if (!select) return;

  select.innerHTML = options
    .map(value => `<option value="${value}">${value}</option>`)
    .join('');

  if (selectedValue && options.includes(selectedValue)) {
    select.value = selectedValue;
  }
}

function openApplicationModal() {
  const modal = document.getElementById('applicationModal');
  if (!modal) return;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setApplicationType(document.getElementById('applicationType')?.value || 'pre-conference-competition');
}

function closeApplicationModal() {
  const modal = document.getElementById('applicationModal');
  if (!modal) return;

  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function setInactiveApplicationFields() {
  const applicationType = document.getElementById('applicationType')?.value || 'pre-conference-competition';
  const inactiveSelector = applicationType === 'research-paper' ? '.pre-competition-fields' : '.research-paper-fields';
  const activeSelector = applicationType === 'research-paper' ? '.research-paper-fields' : '.pre-competition-fields';

  document.querySelectorAll(`${inactiveSelector} input, ${inactiveSelector} select, ${inactiveSelector} textarea`).forEach(field => {
    field.disabled = true;
  });

  document.querySelectorAll(`${activeSelector} input, ${activeSelector} select, ${activeSelector} textarea`).forEach(field => {
    field.disabled = false;
  });

  document.querySelectorAll('.office-use-section input, .office-use-section textarea').forEach(field => {
    field.disabled = true;
  });
}

function setApplicationType(type) {
  const safeType = type === 'research-paper' ? 'research-paper' : 'pre-conference-competition';
  const applicationTypeInput = document.getElementById('applicationType');
  const submitButton = document.getElementById('applicationSubmitBtn');

  if (applicationTypeInput) applicationTypeInput.value = safeType;

  document.body.classList.toggle('application-research-mode', safeType === 'research-paper');
  document.body.classList.toggle('application-competition-mode', safeType !== 'research-paper');

  document.querySelectorAll('.application-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.applicationType === safeType);
  });

  if (submitButton) {
    submitButton.textContent = safeType === 'research-paper' ? 'Submit Research Paper' : 'Submit Application';
  }

  const panel = document.querySelector('.application-form-scroll');
  if (panel) panel.scrollTop = 0;

  setInactiveApplicationFields();
  updateApplicationFileMailLinks();
  if (safeType !== 'research-paper') setParticipationType(document.querySelector('input[name="participationType"]:checked')?.value || 'Individual');
}

function validateApplicationFiles(form) {
  const maxBytes = 15 * 1024 * 1024;
  const applicationType = document.getElementById('applicationType')?.value || 'pre-conference-competition';
  const allowedExt = applicationType === 'research-paper'
    ? /\.(pdf|doc|docx)$/i
    : /\.(pdf|doc|docx|ppt|pptx|png|jpg|jpeg)$/i;
  const errorText = applicationType === 'research-paper'
    ? 'Invalid file type. Accepted formats for research paper: PDF, DOC, DOCX.'
    : 'Invalid file type. Accepted formats: PDF, DOC, DOCX, PPT, PPTX, PNG, JPG.';
  const submissionFileInput = form.querySelector('input[name="submissionFile"]:not(:disabled)');
  const idProofFileInput = form.querySelector('input[name="idProofFile"]:not(:disabled)');
  const files = [submissionFileInput?.files?.[0], idProofFileInput?.files?.[0]].filter(Boolean);

  for (const file of files) {
    if (file.size > maxBytes) {
      showMessage('applicationMessage', `${file.name} is larger than 15 MB.`, 'error');
      return false;
    }

    if (!allowedExt.test(file.name)) {
      showMessage('applicationMessage', errorText, 'error');
      return false;
    }
  }

  return true;
}

document.getElementById('openApplicationModal')?.addEventListener('click', openApplicationModal);
document.getElementById('openApplicationModalNav')?.addEventListener('click', openApplicationModal);
function openCompetitionFromButton() {
  navLinks?.classList.remove('open');
  openApplicationModal();
}

document.getElementById('openCompetitionModalNav')?.addEventListener('click', openCompetitionFromButton);
document.getElementById('openCompetitionModalHero')?.addEventListener('click', openCompetitionFromButton);
document.getElementById('openCompetitionModalFooter')?.addEventListener('click', openApplicationModal);
document.getElementById('closeApplicationModal')?.addEventListener('click', closeApplicationModal);

document.getElementById('applicationModal')?.addEventListener('click', e => {
  if (e.target.id === 'applicationModal') closeApplicationModal();
});

document.querySelectorAll('.application-tab').forEach(tab => {
  tab.addEventListener('click', () => setApplicationType(tab.dataset.applicationType));
});

function clearApplicationForm() {
  const form = document.getElementById('applicationForm');
  const currentType = document.getElementById('applicationType')?.value || 'pre-conference-competition';
  if (!form) return;

  form.reset();
  setApplicationType(currentType);
  showMessage('applicationMessage', '', '');

  const formScroll = document.querySelector('.application-form-scroll');
  if (formScroll) formScroll.scrollTop = 0;
}

document.getElementById('applicationClearBtn')?.addEventListener('click', clearApplicationForm);

function setParticipationType(type) {
  const safeType = type === 'Team' ? 'Team' : 'Individual';
  document.body.classList.toggle('participation-team', safeType === 'Team');
  document.body.classList.toggle('participation-individual', safeType !== 'Team');

  const selected = document.querySelector(`input[name="participationType"][value="${safeType}"]`);
  if (selected) selected.checked = true;

  const teamCount = document.querySelector('input[name="teamMembersCount"]');
  const teamMembers = document.querySelector('textarea[name="teamMemberNames"]');
  const individualMember = document.querySelector('input[name="individualMemberName"]');

  if (safeType === 'Team') {
    if (teamCount) teamCount.disabled = false;
    if (teamMembers) teamMembers.disabled = false;
    if (individualMember) individualMember.disabled = true;
  } else {
    if (teamCount) {
      teamCount.value = '';
      teamCount.disabled = true;
    }
    if (teamMembers) {
      teamMembers.value = '';
      teamMembers.disabled = true;
    }
    if (individualMember) individualMember.disabled = false;
  }
}

document.querySelectorAll('input[name="participationType"]').forEach(input => {
  input.addEventListener('change', () => setParticipationType(input.value));
});

function syncPreConferenceSubmissionTitle() {
  const applicationType = document.getElementById('applicationType')?.value || 'pre-conference-competition';
  const hiddenTitle = document.getElementById('applicationSubmissionTitle');
  if (!hiddenTitle) return;

  if (applicationType === 'research-paper') {
    const presentationType = document.querySelector('input[name="presentationType"]:checked:not(:disabled)')?.value || '';
    const topic = document.querySelector('input[name="topicTheme"]:checked:not(:disabled)')?.value || '';
    hiddenTitle.value = presentationType || topic || 'Research Paper Presentation Submission';
    return;
  }

  const selectedCompetition = document.querySelector('input[name="competitionCategory"]:checked:not(:disabled)')?.value || '';
  const selectedTopic = document.querySelector('input[name="topicTheme"]:checked:not(:disabled)')?.value || '';
  hiddenTitle.value = selectedCompetition || selectedTopic || 'Pre-Conference Competition Submission';
}


function buildSafeFileName(value, fallback = 'Topic') {
  return String(value || '')
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || fallback;
}

function getActiveApplicationTopic() {
  const applicationType = document.getElementById('applicationType')?.value || 'pre-conference-competition';
  if (applicationType === 'research-paper') {
    return document.querySelector('.research-paper-fields input[name="topicTheme"]:checked:not(:disabled)')?.value
      || document.querySelector('input[name="presentationType"]:checked:not(:disabled)')?.value
      || 'Research_Topic';
  }
  return document.querySelector('.pre-competition-fields input[name="topicTheme"]:checked:not(:disabled)')?.value
    || document.querySelector('input[name="competitionCategory"]:checked:not(:disabled)')?.value
    || 'Competition_Topic';
}

function getTypedApplicationFileName(defaultName) {
  const applicationType = document.getElementById('applicationType')?.value || 'pre-conference-competition';
  const selector = applicationType === 'research-paper'
    ? 'input[name="emailFileNameResearch"]'
    : 'input[name="emailFileNamePre"]';
  const typedName = document.querySelector(selector)?.value?.trim();
  return typedName || defaultName;
}

function updateApplicationFileMailLinks() {
  const applicationType = document.getElementById('applicationType')?.value || 'pre-conference-competition';
  const enteredName = document.querySelector('input[name="fullName"]:not(:disabled)')?.value || '';
  const fullName = String(enteredName).trim() || 'YourName';
  const topic = getActiveApplicationTopic();
  const suggestedBase = `${buildSafeFileName(fullName, 'YourName')}_${buildSafeFileName(topic, 'Topic')}`;
  const suggestedName = `${suggestedBase}.pdf`;
  const finalFileName = getTypedApplicationFileName(suggestedName);
  const formName = applicationType === 'research-paper'
    ? 'Research Paper Presentation Submission Form'
    : 'Pre-Conference Competitions Application Form';
  const subject = `ICAIH 2026 File Submission - ${finalFileName}`;
  const body = [
    `Dear ICAIH 2026 Team,`,
    ``,
    `I am sending my file for the ${formName}.`,
    ``,
    `Applicant Name: ${fullName}`,
    `Topic / Category: ${topic}`,
    `File Name: ${finalFileName}`,
    ``,
    `I will attach the file(s) in this email and send it.`,
    ``,
    `Regards,`,
    `${fullName}`
  ].join('\n');

  document.querySelectorAll('[data-file-mail-link]').forEach(link => {
    const mailToUrl = `mailto:divyav16.ai@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    link.href = mailToUrl;
    link.removeAttribute('target');
    link.removeAttribute('rel');
    link.dataset.mailToUrl = mailToUrl;
    link.setAttribute('aria-label', `Open mail app and send files to divyav16.ai@gmail.com for ${formName}`);
  });

  document.querySelectorAll('[data-file-name-format]').forEach(item => {
    item.textContent = suggestedBase;
  });
  document.querySelectorAll('[data-file-name-example]').forEach(item => {
    item.textContent = suggestedName;
  });
}

function isMobileOrTabletDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints && navigator.maxTouchPoints > 1 && window.innerWidth <= 1024);
}

function parseMailtoUrl(mailToUrl) {
  const value = String(mailToUrl || '');
  const withoutScheme = value.replace(/^mailto:/i, '');
  const [toPart, queryPart = ''] = withoutScheme.split('?');
  const params = new URLSearchParams(queryPart);
  return {
    to: decodeURIComponent(toPart || ''),
    subject: params.get('subject') || '',
    body: params.get('body') || ''
  };
}

function buildGmailComposeUrl(mailToUrl) {
  const mail = parseMailtoUrl(mailToUrl);
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: mail.to,
    su: mail.subject,
    body: mail.body
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

function openEmailCompose(mailToUrl) {
  if (!mailToUrl) return;

  // Mobile/tablet: open the installed mail app directly.
  // Laptop/desktop: open Gmail compose directly because many laptops do not have a default mail app configured.
  if (isMobileOrTabletDevice()) {
    window.location.href = mailToUrl;
    return;
  }

  window.open(buildGmailComposeUrl(mailToUrl), '_blank', 'noopener,noreferrer');
}

document.querySelectorAll('a[href^="mailto:"], [data-file-mail-link]').forEach(link => {
  link.addEventListener('click', event => {
    if (link.matches('[data-file-mail-link]')) {
      updateApplicationFileMailLinks();
    }
    const mailToUrl = link.dataset.mailToUrl || link.getAttribute('href');
    if (!mailToUrl) return;
    event.preventDefault();
    openEmailCompose(mailToUrl);
  });
});


document.querySelectorAll('input[name="competitionCategory"]').forEach(input => {
  input.addEventListener('change', syncPreConferenceSubmissionTitle);
});

document.querySelectorAll('#applicationForm input, #applicationForm select, #applicationForm textarea').forEach(field => {
  field.addEventListener('input', () => {
    syncPreConferenceSubmissionTitle();
    updateApplicationFileMailLinks();
  });
  field.addEventListener('change', () => {
    syncPreConferenceSubmissionTitle();
    updateApplicationFileMailLinks();
  });
});

setApplicationType('pre-conference-competition');
setParticipationType('Individual');
syncPreConferenceSubmissionTitle();
updateApplicationFileMailLinks();

document.getElementById('applicationForm')?.addEventListener('submit', async e => {
  e.preventDefault();

  const form = e.currentTarget;

  if (!validatePhoneFields(form, 'applicationMessage')) return;
  if (!validateApplicationFiles(form)) return;

  const submitButton = document.getElementById('applicationSubmitBtn');
  const originalSubmitText = submitButton ? submitButton.textContent : '';

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
  }

  updateApplicationFileMailLinks();
  showMessage('applicationMessage', 'Submitting application…', '');

  try {
    const formData = new FormData(form);
    const participationType = formData.get('participationType');
    if (participationType === 'Individual') {
      formData.set('teamMemberNames', formData.get('individualMemberName') || '');
      formData.delete('teamMembersCount');
    }

    const response = await fetch(`${API_BASE}/api/applications`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || 'Application submission failed. Please check the backend terminal error, MySQL connection, and file format.');
    }

    showMessage(
      'applicationMessage',
      `${result.message || 'Form submitted successfully. Admin has been notified at info@mrtech.co.in.'} Reference ID: ${result.refId || '—'}`,
      'ok'
    );

    const submittedType = document.getElementById('applicationType')?.value || 'pre-conference-competition';
    form.reset();
    setApplicationType(submittedType);
  } catch (error) {
    showMessage('applicationMessage', error.message || 'Unable to submit. Please start the backend with npm start and check the terminal error.', 'error');
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalSubmitText || 'Submit Application';
    }
  }
});

/* Add Apply Now modal to ESC close behavior */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeApplicationModal();
});
