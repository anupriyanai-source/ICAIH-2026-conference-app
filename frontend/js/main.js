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


/* ── ICAIH 2026 Dynamic Conference Agenda ──
   The programme is maintained as structured data so agenda changes can be
   made in one place without manually editing table markup in index.html. */
const ICAIH_AGENDA = Object.freeze([
  { time: '09:00 – 09:30 AM', session: 'Registration, Welcome & Networking', speakers: 'Delegate Registration, Speaker Reception, Exhibition Visit & Welcome Tea' },
  { time: '09:30 – 09:35 AM', session: 'Arrival of Chief Guests & Dignitaries', speakers: 'Reception by Organizing Committee' },
  { time: '09:35 – 09:40 AM', session: 'Invocation & Lighting of the Ceremonial Lamp', speakers: 'Chief Guests, Presidential Address Dignitary & Special Invitees' },
  { time: '09:40 – 09:45 AM', session: 'Welcome Address & Conference Overview', speakers: 'Organizing Committee, ICAIH 2026' },
  { time: '09:45 – 09:55 AM', session: 'Presidential Address', speakers: 'Dr. S. Elumalai, Former Registrar, University of Madras' },
  { time: '09:55 – 10:05 AM', session: 'Special Address – Tamil Nadu’s Vision for AI, Digital Transformation & Innovation', speakers: 'Hon’ble Dr. R. Kumar, Minister for Information Technology, Government of Tamil Nadu' },
  { time: '10:05 – 10:15 AM', session: 'Chief Guest Address – Transforming Healthcare through AI and Digital Health', speakers: 'Hon’ble Dr. K.G. Arunraj, Minister for Health and Family Welfare, Government of Tamil Nadu' },
  { time: '10:15 – 10:25 AM', session: 'Special Government Address – AI Adoption in Tamil Nadu’s Public Health System', speakers: 'Dr. Darez Ahamed, IAS, Secretary to Government, Health and Family Welfare Department' },
  { time: '10:25 – 10:35 AM', session: 'Special Government Address – Building Tamil Nadu’s AI & Digital Ecosystem', speakers: 'Mr. Pradeep Yadav, IAS, Additional Chief Secretary, IT & Digital Services Department' },
  { time: '10:35 – 10:50 AM', session: 'Keynote Address: AI for Health, Humanity & Inclusive Growth – Vision 2030', speakers: 'Dr. Soumya Swaminathan, Former Chief Scientist, World Health Organization' },
  { time: '10:50 – 11:00 AM', session: 'Release Ceremony', speakers: 'Conference Souvenir, White Paper, Research Proceedings & Announcement of AI Healthcare Initiatives' },
  { time: '11:00 – 11:15 AM', session: 'Tea Break, Networking & AI Product Expo Visit', speakers: 'Chief Guests, Speakers, Delegates, Exhibitors & Startups' },
  { time: '11:15 AM – 12:00 PM', session: 'SESSION I – Government Policy & AI Healthcare Transformation Forum', speakers: 'Dr. S. Uma, IAS; Dr. S. Pushkala; Dr. Sudha Seshayyan; Dr. Renuka Vidyashankar; Vanitha Venugopal; K. Krishna Chaitanya' },
  { time: '12:00 – 12:45 PM', session: 'SESSION II – Clinical AI, Digital Health, Medical Innovation & Patient Care', speakers: 'Dr. Sunil Shroff; Dr. Kumudha Lingaraj; Dr. E. Theranirajan (Rtd); Dr. Arunkumar Krishnasamy; Dr. Vasanth Ramasamy' },
  { time: '12:45 – 01:00 PM', session: 'Special Legislative Perspectives on AI, Public Health & Inclusive Development', speakers: 'Dr. T. Arunkumar, MLA; Dr. M.S. Ravi, MLA; M. Arul Prakasam, MLA' },
  { time: '01:00 – 02:00 PM', session: 'Networking Lunch, AI Healthcare Expo & B2B/B2G Meetings', speakers: 'Product Demonstrations, Health Technologies, Startup Networking, Government–Industry Meetings' },
  { time: '02:00 – 02:40 PM', session: 'SESSION III – Generative AI, Cybersecurity, Data Governance & Responsible AI in Healthcare', speakers: 'Mr. Vikram Elango; Mr. Praveen Kumar; Technology and Cybersecurity Experts' },
  { time: '02:40 – 03:15 PM', session: 'SESSION IV – AI for Rural Healthcare, Agriculture–Health Convergence & Inclusive Innovation', speakers: 'Dr. Parasuraman Raman and invited experts from State Planning Commission, ELCOT, EDII-TN, ICT Academy and TNRiSE' },
  { time: '03:15 – 03:45 PM', session: 'Global Investors, Venture Capital, CSR & Philanthropic Partnership Forum', speakers: 'Investors, CSR Foundations, Philanthropic Organizations, Funding Agencies, Startups & Healthcare Innovators' },
  { time: '03:45 – 04:05 PM', session: 'Startup Grand Challenge & Innovation Showcase', speakers: 'Selected Healthcare AI Startups, Student Innovators & Researchers' },
  { time: '04:05 – 04:20 PM', session: 'Research & Academic Excellence Forum', speakers: 'Best Research Papers, Young Researchers, Medical Student Innovations & Poster Presentations' },
  { time: '04:20 – 04:35 PM', session: 'AI Healthcare Product Expo – Live Demonstrations', speakers: 'AI Diagnostics, Health ATMs, Medical Devices, Robotics, Telemedicine & Digital Health Platforms' },
  { time: '04:35 – 04:50 PM', session: 'Strategic Partnerships, MoU Exchange & Pilot Project Announcements', speakers: 'Government–Industry–Academia–Hospital–Startup Partnerships' },
  { time: '04:50 – 05:10 PM', session: 'ICAIH 2026 Awards & Recognition Ceremony', speakers: 'AI Healthcare Leadership, Best Startup, Best Research Paper, Young Researcher, Rural Healthcare Innovation, CSR Excellence and Special Recognition Awards' },
  { time: '05:10 – 05:20 PM', session: 'Adoption of the Chennai Declaration on AI in Healthcare 2026', speakers: 'Presentation of Conference Recommendations, Policy Roadmap & Future Initiatives' },
  { time: '05:20 – 05:25 PM', session: 'Vote of Thanks', speakers: 'T. L. Nandagopal, MCA., MSW., Chairman, G Care Council' },
  { time: '05:25 – 05:30 PM', session: 'National Anthem & Group Photograph', speakers: 'Chief Guests, Dignitaries, Speakers, Partners & Organizing Committee' }
]);

function renderConferenceAgenda(agenda = ICAIH_AGENDA) {
  const tableBody = document.getElementById('agendaTableBody');
  if (!tableBody) return;

  const fragment = document.createDocumentFragment();
  agenda.forEach(item => {
    const row = document.createElement('tr');
    const timeCell = document.createElement('td');
    const sessionCell = document.createElement('td');
    const speakerCell = document.createElement('td');
    const sessionTitle = document.createElement('strong');

    timeCell.textContent = item.time;
    sessionTitle.textContent = item.session;
    sessionCell.appendChild(sessionTitle);
    speakerCell.textContent = item.speakers;

    row.append(timeCell, sessionCell, speakerCell);
    fragment.appendChild(row);
  });

  tableBody.replaceChildren(fragment);
}

renderConferenceAgenda();

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
  const phoneInputs = Array.from(form.querySelectorAll('input[data-phone-only]'))
    .filter(input => !input.disabled && input.offsetParent !== null);

  for (const input of phoneInputs) {
    let value = input.value.replace(/\D/g, '');
    if (value.length === 12 && value.startsWith('91')) value = value.slice(2);
    input.value = value.slice(0, 10);

    if ((input.required || value.length > 0) && !/^\d{10}$/.test(value)) {
      showMessage(messageId, 'Please enter a valid 10 digit phone number.', 'error');
      input.focus();
      return false;
    }
  }

  return true;
}

/* ── Registration fee, QR amount, and manual UPI payment ── */

const MYTH_UPI_PAYMENT = {
  upiId: 'MYTHREALITYTECHNOLOGIESPRIV@iob',
  payeeName: 'MYTH REALITY TECHNOLOGIES PRIVATE LIMITED',
  merchantCode: '8011',
  organizationId: '159020',
  mode: '00',
  purposeCode: '00',
  version: '01',
  transactionNote: 'ICAIH 2026 Registration',
  fallbackQrImage: 'assets/qr/myth-reality-payment-qr.png'
};

const EVENT_INFO = {
  date: '18 July 2026',
  time: '9:30 AM – 5:30 PM',
  venue: 'Anna Centenary Library, Kotturpuram, Chennai',
  email: 'info@mrtech.co.in',
  emailHref: 'mailto:info@mrtech.co.in?subject=ICAIH%202026%20Inquiry&body=Dear%20ICAIH%202026%20Team%2C%0D%0A%0D%0A'
};

const SUCCESS_POPUP_DELAY_MS = 3000;
const waitForSuccessPopup = () => new Promise(resolve => setTimeout(resolve, SUCCESS_POPUP_DELAY_MS));

const REGISTRATION_FEES = {
  'Student': 999,
  'Delegate': 1999,
  'Startup Founder': 1999,
  'Industry Expert': 2499,
  'Research Scholar': 2999,
  'Online Attendee': 325,
  'TSI Member': 500
};

const BULK_OFFERS = {
  '1-4': { min: 1, max: 4, discount: 0, label: 'Student Group: 1 to 4 Students - Standard Fee ₹999 Each' },
  '5-24': { min: 5, max: 24, discount: 10, label: 'Student Group: 5 to 24 Students - 10% Discount' },
  '25-49': { min: 25, max: 49, discount: 20, label: 'Student Group: 25 to 49 Students - 20% Discount' },
  '50-plus': { min: 50, max: Infinity, discount: 25, label: 'Student Group: 50+ Students - 25% Discount' }
};

function getBulkOfferKeyForCount(count) {
  const value = Number(count || 0);
  if (!Number.isInteger(value) || value < 1) return '';
  if (value <= 4) return '1-4';
  if (value <= 24) return '5-24';
  if (value <= 49) return '25-49';
  return '50-plus';
}

function normalizeStudentCountInput(input) {
  if (!input) return 0;
  const digitsOnly = String(input.value || '').replace(/\D/g, '').slice(0, 4);
  if (input.value !== digitsOnly) input.value = digitsOnly;
  return digitsOnly ? Number(digitsOnly) : 0;
}

function synchronizeBulkOfferWithStudentCount({ showError = false } = {}) {
  const bulkOffer = document.getElementById('bulkOffer');
  const studentCountInput = document.getElementById('studentCount');
  const bulkCountHelp = document.getElementById('bulkCountHelp');
  const count = normalizeStudentCountInput(studentCountInput);
  const derivedKey = getBulkOfferKeyForCount(count);

  if (derivedKey && bulkOffer) bulkOffer.value = derivedKey;

  if (bulkCountHelp) {
    if (!count) {
      bulkCountHelp.textContent = 'Enter 1–4 for the standard fee of ₹999 per student, 5–24 for 10%, 25–49 for 20%, or 50+ for 25%. The offer changes automatically.';
      bulkCountHelp.classList.remove('error');
    } else if (!derivedKey) {
      bulkCountHelp.textContent = 'Enter at least 1 student.';
      bulkCountHelp.classList.add('error');
    } else {
      bulkCountHelp.textContent = `${BULK_OFFERS[derivedKey].label} selected automatically.`;
      bulkCountHelp.classList.remove('error');
    }
  }

  if (showError && !derivedKey) {
    studentCountInput?.setCustomValidity('Please enter a whole number of at least 1 student.');
    studentCountInput?.reportValidity();
  } else {
    studentCountInput?.setCustomValidity('');
  }

  return { count, offerKey: derivedKey };
}

const EARLY_BIRD_DISCOUNT_PERCENT = 10;

function isEarlyBirdActive() {
  const earlyBirdEndDate = new Date('2026-07-12T23:59:59+05:30');
  return new Date() <= earlyBirdEndDate;
}

function applyEarlyBirdDiscount(amount, role = '') {
  if (role === 'TSI Member') return Number(amount || 0);
  if (!isEarlyBirdActive()) return Number(amount || 0);
  return Math.round(Number(amount || 0) * (100 - EARLY_BIRD_DISCOUNT_PERCENT) / 100);
}

// Crowdshaki integration removed. The application now uses the MYTH UPI
// merchant deep-link (buildMythUpiUrl) and QR generation for manual
// payment flows. Do not reintroduce Crowdshaki URLs elsewhere.


const SPONSOR_ICONS = {
  title: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 8l4.2 3L12 4l3.8 7L20 8l-1.5 9h-13L4 8z" />
      <path d="M7 20h10" />
      <circle cx="12" cy="8" r="1" />
    </svg>`,
  partnership: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8.2 12.2l2.4 2.4a2 2 0 002.8 0l3.9-3.9" />
      <path d="M9.2 9.2l1.7-1.7a3 3 0 014.2 0l1.1 1.1" />
      <path d="M6.8 10.5L4.3 13a2.2 2.2 0 000 3.1l2.1 2.1a2.2 2.2 0 003.1 0l1.6-1.6" />
      <path d="M17.2 10.5l2.5 2.5a2.2 2.2 0 010 3.1l-2.1 2.1a2.2 2.2 0 01-3.1 0l-1.6-1.6" />
    </svg>`,
  innovation: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 20s-6.5-3.7-6.5-9a3.8 3.8 0 016.5-2.6A3.8 3.8 0 0118.5 11c0 5.3-6.5 9-6.5 9z" />
      <path d="M9 12h2l1-2.2 1.4 4.4 1-2.2H17" />
      <path d="M19 4v3M17.5 5.5h3" />
    </svg>`,
  premium: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 4h10l3 5-8 11L4 9l3-5z" />
      <path d="M4 9h16M9 4l-2 5 5 11 5-11-2-5" />
    </svg>`,
  ai: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M9 5.5A3.5 3.5 0 0115.5 7a3.5 3.5 0 01.5 6.9A3.5 3.5 0 019.2 15 3.5 3.5 0 018 8.3 3.5 3.5 0 019 5.5z" />
      <path d="M12 5v14M8.5 9.5H12M12 13h4M8.5 16H12" />
      <circle cx="7" cy="9.5" r="1" />
      <circle cx="17" cy="13" r="1" />
      <circle cx="7.5" cy="16" r="1" />
    </svg>`,
  award: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="8" r="4" />
      <path d="M10.2 12l-2 8 3.8-2 3.8 2-2-8" />
      <path d="M10.2 8l1.2 1.2L14 6.8" />
    </svg>`,
  kit: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8 7V5.8A2.8 2.8 0 0110.8 3h2.4A2.8 2.8 0 0116 5.8V7" />
      <rect x="4" y="7" width="16" height="13" rx="2.5" />
      <path d="M4 11h16M10 11v2h4v-2" />
    </svg>`,
  knowledge: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3.5 5.5A4.5 4.5 0 018 4h4v15H8a4.5 4.5 0 00-4.5 1.5v-15z" />
      <path d="M20.5 5.5A4.5 4.5 0 0016 4h-4v15h4a4.5 4.5 0 014.5 1.5v-15z" />
      <path d="M6.5 8.5H10M14 8.5h3.5M6.5 12H10M14 12h3.5" />
    </svg>`,
  technology: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
      <circle cx="12" cy="10" r="2.2" />
      <path d="M12 6.5v1.3M12 12.2v1.3M8.5 10h1.3M14.2 10h1.3M9.5 7.5l.9.9M13.6 11.6l.9.9M14.5 7.5l-.9.9M10.4 11.6l-.9.9" />
    </svg>`,
  healthcare: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 21s-7-4.3-7-10a4.2 4.2 0 017-2.7A4.2 4.2 0 0119 11c0 5.7-7 10-7 10z" />
      <path d="M7.8 12h2.2l1.2-2.5 1.8 5 1.2-2.5h2" />
    </svg>`,
  silver: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8 3h8l1.5 5L12 12 6.5 8 8 3z" />
      <circle cx="12" cy="15" r="5" />
      <path d="M12 12.8l.8 1.6 1.8.3-1.3 1.2.3 1.8-1.6-.9-1.6.9.3-1.8-1.3-1.2 1.8-.3.8-1.6z" />
    </svg>`,
  associate: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="6" r="2.5" />
      <circle cx="6" cy="17" r="2.5" />
      <circle cx="18" cy="17" r="2.5" />
      <path d="M10.8 8.2L7.2 14.8M13.2 8.2l3.6 6.6M8.5 17h7" />
    </svg>`
};

const ALL_SPONSOR_PACKAGES = [
  { category: 'Premium Sponsorship Benefits', title: 'Title Sponsor', amount: 2999999, accent: '#0b8f8c', icon: SPONSOR_ICONS.title, benefits: ['Exclusive Title Branding Rights','Premium Brand Visibility Across All Platforms','High-Impact Speaking Opportunity','Premium Exhibition & Showcase Space','VIP Access & Strategic Networking','Strong Media, PR & Recognition Value'] },
  { category: 'Premium Sponsorship Benefits', title: 'Co-Title Sponsor', amount: 1999999, accent: '#b88700', icon: SPONSOR_ICONS.partnership, benefits: ['Prominent Co-Branding with ICAIH 2026','Speaking Opportunity in a Key Session','Premium Exhibition Stall','High-Visibility Logo Placement','Delegate Passes and VIP Networking Access'] },
  { category: 'Premium Sponsorship Benefits', title: 'Healthcare Innovation Sponsor', amount: 999999, accent: '#0b8f8c', icon: SPONSOR_ICONS.innovation, benefits: ['Official Healthcare Innovation Sponsor Recognition','Dedicated Innovation Showcase Opportunity','Product, Service, or Clinical Solution Demonstration','Panel Participation with Industry Leaders','Premium Branding Across Conference Platforms','Strategic B2B Networking Access'] },
  { category: 'Strategic Sponsorship Benefits', title: 'Platinum Sponsor', amount: 499999, accent: '#6b7280', icon: SPONSOR_ICONS.premium, benefits: ['Prominent Brand Visibility','Dedicated Exhibition Booth','Stage Recognition During the Event','Strategic Networking Access','Session-Level Visibility','Product Demonstration Opportunity'] },
  { category: 'Strategic Sponsorship Benefits', title: 'AI Transformation Sponsor', amount: 499999, accent: '#b88700', icon: SPONSOR_ICONS.ai, benefits: ['Official AI Transformation Sponsor Recognition','AI-Focused Brand Visibility','AI Healthcare Session Visibility','AI Solution Demonstration Opportunity','Strategic Access to Healthcare Decision Makers'] },
  { category: 'Strategic Sponsorship Benefits', title: 'Gold Sponsor', amount: 299999, accent: '#234b9b', icon: SPONSOR_ICONS.award, benefits: ['Official Gold Sponsor Recognition','Logo Placement on Selected Conference Materials','Exhibition Stall for Brand Promotion','Website and Digital Visibility','Delegate Participation and Networking','Promotional Material Distribution Opportunity'] },
  { category: 'Partner Benefits', title: 'Delegate Kit Sponsor', amount: 299999, accent: '#0b8f8c', icon: SPONSOR_ICONS.kit, benefits: ['Exclusive Delegate Kit Branding','Direct Brand Reach to Every Delegate','Promotional Inserts Inside Kits','High Visibility at Registration Area','Website and Brochure Recognition','Long-Lasting Brand Recall'] },
  { category: 'Partner Benefits', title: 'Knowledge Partner', amount: 199999, accent: '#b88700', icon: SPONSOR_ICONS.knowledge, benefits: ['Official Knowledge Partner Recognition','Academic Branding Across Conference Platforms','Research Visibility Among Academic Audiences','Association with Knowledge Sessions','Expert Contribution or Session Moderation Opportunity','Website and Brochure Logo Visibility'] },
  { category: 'Partner Benefits', title: 'Technology Partner', amount: 199999, accent: '#6b7280', icon: SPONSOR_ICONS.technology, benefits: ['Official Technology Partner Recognition','Technology Showcase Opportunity','Product Demo and Solution Presentation','Brand Visibility Across Conference Platforms','Networking with Healthcare and Innovation Leaders','B2B Partnership and Collaboration Access'] },
  { category: 'Associate & Brand Visibility Benefits', title: 'Healthcare Partner', amount: 199999, accent: '#0b8f8c', icon: SPONSOR_ICONS.healthcare, benefits: ['Official Healthcare Partner Recognition','Healthcare Sector Brand Visibility','Clinical Innovation Showcase Opportunity','Exhibition Visibility for Healthcare Services','Networking with Healthcare Leaders','Website and Brochure Branding'] },
  { category: 'Associate & Brand Visibility Benefits', title: 'Silver Sponsor', amount: 99999, accent: '#b88700', icon: SPONSOR_ICONS.silver, benefits: ['Official Silver Sponsor Recognition','Logo Visibility in Selected Materials','Website and Brochure Branding','Event Recognition During the Conference','Delegate Entry for Sponsor Representatives'] },
  { category: 'Associate & Brand Visibility Benefits', title: 'Associate Sponsor', amount: 99999, accent: '#234b9b', icon: SPONSOR_ICONS.associate, benefits: ['Official Associate Sponsor Recognition','Website Visibility in Sponsor Section','Branding in Selected Event Materials','Promotional Mention During Conference Communication','Affordable Brand Exposure to Healthcare and AI Audience'] },
  { title: 'Premium Exhibitor', amount: 39999, accent: '#8a6a00', icon: SPONSOR_ICONS.premium, benefits: ['Exhibition Booth (3m × 3m)','Spacious stall for product and service showcase','Display banners, brochures, standees, and live demos','Direct interaction with healthcare professionals and delegates','Brand visibility on ICAIH 2026 website','Company profile included in the official exhibitor directory','Two complimentary delegate passes'] },
  { title: 'Standard Exhibitor', amount: 34999, accent: '#12315f', icon: SPONSOR_ICONS.associate, benefits: ['Exhibition Booth (2m × 2m)','Dedicated stall space for showcasing products and services','Opportunity to engage directly with participants','Company information included in the exhibitor booklet','One free delegate pass for company representative','Brand exposure among healthcare professionals, students, and researchers'] },
  { title: 'Standard Pavilion', amount: 29999, accent: '#087447', icon: SPONSOR_ICONS.innovation, benefits: ['Startup showcase space','Dedicated table space in the Startup Pavilion','Present innovative healthcare and AI solutions','Startup profile included in the official conference directory','Meet potential investors and funding partners','Interact with AI experts, researchers, and industry leaders','Opportunity to demonstrate ideas and gain valuable feedback','Build collaborations for future growth'] }
];

const STALL_TIER_NAMES = ['Premium Exhibitor', 'Standard Exhibitor', 'Standard Pavilion'];
const SPONSOR_PACKAGES = ALL_SPONSOR_PACKAGES.filter(pkg => !STALL_TIER_NAMES.includes(pkg.title));
const STALL_PACKAGES = ALL_SPONSOR_PACKAGES.filter(pkg => STALL_TIER_NAMES.includes(pkg.title));
const ALL_PAYMENT_TIERS = [...SPONSOR_PACKAGES, ...STALL_PACKAGES];
const SPONSOR_FEES = ALL_PAYMENT_TIERS.reduce((fees, pkg) => {
  fees[pkg.title] = pkg.amount;
  return fees;
}, {});
let sponsorFormMode = 'sponsor';

function renderSponsorPackages() {
  const grid = document.getElementById('sponsorPackagesGrid');
  if (!grid) return;

  const renderCard = (pkg) => `
    <article class="feature-panel reveal sponsor-package-card" style="--sponsor-accent:${pkg.accent};">
      <div class="sponsor-card-head">
        <span class="sponsor-card-icon" aria-hidden="true" title="${pkg.title}">${pkg.icon}</span>
        <div><h3>${pkg.title}</h3><p class="sponsor-card-amount">${formatINR(pkg.amount)}</p></div>
      </div>
      <ul class="sponsor-benefit-list">${pkg.benefits.map(benefit => `<li>${benefit}</li>`).join('')}</ul>
      <button class="btn secondary sponsor-card-action" type="button" data-sponsor-tier="${pkg.title}">Choose Package</button>
    </article>`;

  const categoryOrder = ['Premium Sponsorship Benefits','Strategic Sponsorship Benefits','Partner Benefits','Associate & Brand Visibility Benefits'];
  grid.innerHTML = categoryOrder.map(category => {
    const cards = SPONSOR_PACKAGES.filter(pkg => pkg.category === category).map(renderCard).join('');
    return `<section class="sponsor-category-group"><div class="sponsor-grid-heading"><span>${category}</span><p>Choose the sponsorship package that best suits your goals.</p></div><div class="sponsor-category-cards">${cards}</div></section>`;
  }).join('');

  grid.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  grid.querySelectorAll('[data-sponsor-tier]').forEach(btn => btn.addEventListener('click', () => openSponsorModal('sponsor', btn.dataset.sponsorTier)));
}

function getSponsorModePackages(mode = sponsorFormMode) {
  return mode === 'stall' ? STALL_PACKAGES : SPONSOR_PACKAGES;
}

function populateSponsorTierOptions(mode = sponsorFormMode, selectedTier = '') {
  const select = document.getElementById('sponsorTier');
  if (!select) return;

  const packages = getSponsorModePackages(mode);

  select.innerHTML = packages
    .map(pkg => `<option value="${pkg.title}">${pkg.title} – ${formatINR(pkg.amount)}</option>`)
    .join('');

  if (selectedTier && packages.some(pkg => pkg.title === selectedTier)) {
    select.value = selectedTier;
  } else if (packages.length) {
    select.value = packages[0].title;
  }
}

function renderStallPackages() {
  const grid = document.getElementById('stallPackagesGrid');
  if (!grid) return;

  grid.innerHTML = STALL_PACKAGES.map(pkg => `
    <article class="feature-panel reveal sponsor-package-card stall-package-card" style="--sponsor-accent:${pkg.accent};">
      <div class="sponsor-card-head">
        <span class="sponsor-card-icon" aria-hidden="true" title="${pkg.title}">${pkg.icon}</span>
        <div><h3>${pkg.title}</h3><p class="sponsor-card-amount">${formatINR(pkg.amount)}</p></div>
      </div>
      <ul class="sponsor-benefit-list">${pkg.benefits.map(benefit => `<li>${benefit}</li>`).join('')}</ul>
      <button class="btn secondary sponsor-card-action" type="button" data-stall-tier="${pkg.title}">Book This Stall</button>
    </article>`).join('');

  grid.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  grid.querySelectorAll('[data-stall-tier]').forEach(btn =>
    btn.addEventListener('click', () => openSponsorModal('stall', btn.dataset.stallTier))
  );
}

renderSponsorPackages();
renderStallPackages();
populateSponsorTierOptions();

document.getElementById('openStallModal')?.addEventListener('click', () => openSponsorModal('stall'));

function formatINR(amount) {
  return '₹' + Number(amount || 0).toLocaleString('en-IN');
}

function getRegistrationPaymentDetails() {
  const role = document.getElementById('registrationRole')?.value || 'Delegate';
  const studentCountInput = document.getElementById('studentCount');
  const studentCount = normalizeStudentCountInput(studentCountInput);
  const derivedBulkOfferKey = getBulkOfferKeyForCount(studentCount);
  const bulkOfferKey = derivedBulkOfferKey || document.getElementById('bulkOffer')?.value || '1-4';

  if (role === 'Bulk Booking') {
    const offer = BULK_OFFERS[bulkOfferKey] || BULK_OFFERS['1-4'];
    const count = studentCount > 0 ? studentCount : offer.min;
    const baseTotal = count * REGISTRATION_FEES.Student;
    const discountAmount = Math.round(baseTotal * offer.discount / 100);
    const payableAmount = baseTotal - discountAmount;

    const bulkEarlyBirdActive = isEarlyBirdActive();
    const bulkDiscountPercent = bulkEarlyBirdActive ? Math.max(offer.discount, EARLY_BIRD_DISCOUNT_PERCENT) : offer.discount;
    const finalDiscountAmount = Math.round(baseTotal * bulkDiscountPercent / 100);
    const finalPayableAmount = baseTotal - finalDiscountAmount;

    return {
      role,
      feeAmount: finalPayableAmount,
      discountPercent: bulkDiscountPercent,
      bulkOfferKey,
      bulkOffer: offer.label,
      studentCount: count,
      requiresPayment: finalPayableAmount > 0,
      earlyBirdActive: bulkEarlyBirdActive,
      note: `${offer.label}. ${count} students × ₹999. Early Bird 10% discount applies until July 12, 2026. Payable amount after discount: ${formatINR(finalPayableAmount)}.`
    };
  }

  const baseFee = Number(REGISTRATION_FEES[role] ?? 1999);

  // Online Attendee has a fixed fee and is not eligible for Early Bird discount.
  const isOnlineAttendee = role === 'Online Attendee';
  const isTSIMember = role === 'TSI Member';
  const earlyBirdActive = (isOnlineAttendee || isTSIMember) ? false : isEarlyBirdActive();
  const fee = (isOnlineAttendee || isTSIMember) ? baseFee : applyEarlyBirdDiscount(baseFee);
  const discountPercent = (!isOnlineAttendee && !isTSIMember && earlyBirdActive && baseFee > 0)
    ? EARLY_BIRD_DISCOUNT_PERCENT
    : 0;

  return {
    role,
    baseFee,
    feeAmount: fee,
    discountPercent,
    bulkOffer: '',
    studentCount: '',
    requiresPayment: fee > 0,
    earlyBirdActive,
    note: fee > 0
      ? (isOnlineAttendee
        ? `${role} registration fee: ${formatINR(baseFee)}. Early Bird offer is not applicable. Payable amount: ${formatINR(fee)}.`
        : (earlyBirdActive
          ? `${role} registration fee: ${formatINR(baseFee)}. Early Bird 10% discount applied until July 12. Payable amount: ${formatINR(fee)}.`
          : `${role} registration fee: ${formatINR(baseFee)}. Early Bird offer ended after July 12, 2026; standard fee applies.`))
      : `${role} registration - no fee required`
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

function validateManualPaymentFields(details) {
  return Boolean(details);
}

// buildCrowdshakiPaymentUrl removed — Crowdshaki payment page integration
// has been intentionally removed. For manual payments we use the merchant
// UPI deep-link produced by `buildMythUpiUrl(details, purpose)` and generate
// QR codes from that URL.

function createUpiTransactionReference(purpose = 'Payment') {
  const safePurpose = String(purpose || 'Payment').replace(/[^a-z0-9]/gi, '').slice(0, 10).toUpperCase();
  return `ICAIH${safePurpose}${Date.now()}`.slice(0, 35);
}

function buildMythUpiUrl(details, purpose = 'Registration') {
  const amount = Number(details.feeAmount || 0).toFixed(2);
  const paymentNote = `${MYTH_UPI_PAYMENT.transactionNote} - ${purpose}`;

  // Encode each value separately. Do not encode the complete UPI URL and do not
  // use URLSearchParams here because some UPI applications interpret `+` in
  // names or notes incorrectly. `%20` keeps spaces compatible across apps.
  // Match the exact merchant parameters embedded in the official IOB/BHIM QR.
  // The amount and note remain dynamic for each website registration.
  const query = [
    `ver=${encodeURIComponent(MYTH_UPI_PAYMENT.version)}`,
    `pa=${encodeURIComponent(MYTH_UPI_PAYMENT.upiId)}`,
    `pn=${encodeURIComponent(MYTH_UPI_PAYMENT.payeeName)}`,
    `tn=${encodeURIComponent(paymentNote)}`,
    `am=${encodeURIComponent(amount)}`,
    'cu=INR',
    `mode=${encodeURIComponent(MYTH_UPI_PAYMENT.mode)}`,
    `purpose=${encodeURIComponent(MYTH_UPI_PAYMENT.purposeCode)}`,
    `orgid=${encodeURIComponent(MYTH_UPI_PAYMENT.organizationId)}`,
    'sign=',
    `mc=${encodeURIComponent(MYTH_UPI_PAYMENT.merchantCode)}`
  ].join('&');

  return `upi://pay?${query}`;
}

const UPI_ANDROID_APPS = [
  {
    id: 'gpay',
    name: 'Google Pay',
    packageName: 'com.google.android.apps.nbu.paisa.user'
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    packageName: 'com.phonepe.app'
  },
  {
    id: 'paytm',
    name: 'Paytm',
    packageName: 'net.one97.paytm'
  },
  {
    id: 'bhim',
    name: 'BHIM',
    packageName: 'in.org.npci.upiapp'
  }
];

let pendingUpiPayment = null;

function isAndroidDevice() {
  return /Android/i.test(navigator.userAgent || '');
}

function getUpiQuery(upiUrl) {
  return String(upiUrl || '').replace(/^upi:\/\/pay\?/, '');
}

function buildAndroidIntentUrl(upiUrl, app) {
  const query = getUpiQuery(upiUrl);
  const genericUpiFallback = encodeURIComponent(upiUrl);

  // Paytm supports its own payment deep-link scheme. Using it avoids Chrome
  // redirecting an installed Paytm app to the Play Store.
  if (app.id === 'paytm') {
    return `paytmmp://pay?${query}`;
  }

  // BHIM does not consistently resolve package-specific Chrome intents on
  // every Android build. Use the standard UPI payment URI instead, which
  // prevents an incorrect Play Store redirect and preserves the exact amount.
  // Android will open BHIM directly when it is the default UPI handler;
  // otherwise it will show the installed UPI-app chooser.
  if (app.id === 'bhim') {
    return upiUrl;
  }

  return `intent://pay?${query}#Intent;scheme=upi;package=${app.packageName};S.browser_fallback_url=${genericUpiFallback};end`;
}

function closeUpiAppChooser() {
  const chooser = document.getElementById('upiAppChooser');
  if (chooser) {
    chooser.classList.remove('open');
    chooser.setAttribute('aria-hidden', 'true');
  }
  pendingUpiPayment = null;
}

function launchUpiApp(appId) {
  if (!pendingUpiPayment) return;

  const { upiUrl, messageId } = pendingUpiPayment;
  const app = UPI_ANDROID_APPS.find(item => item.id === appId);

  if (!app) return;

  if (isAndroidDevice()) {
    // Use the standard UPI scheme with the selected app package. This opens the
    // installed app directly and preserves the exact dynamic amount and payee details.
    window.location.assign(buildAndroidIntentUrl(upiUrl, app));
  } else {
    showMessage(messageId, 'UPI app payments must be opened from an Android phone.', 'error');
    return;
  }

  if (messageId) {
    showMessage(
      messageId,
      app
        ? (app.id === 'bhim'
          ? 'Opening the UPI payment screen. Select BHIM if Android shows the app chooser.'
          : `Opening ${app.name} directly with the selected amount.`)
        : 'Opening the selected UPI application.',
      ''
    );
  }

  closeUpiAppChooser();
}

function openUpiAppChooser({ upiUrl, amount, purpose, messageId }) {
  pendingUpiPayment = { upiUrl, amount, purpose, messageId };

  const chooser = document.getElementById('upiAppChooser');
  const amountText = document.getElementById('upiChooserAmount');
  const purposeText = document.getElementById('upiChooserPurpose');

  if (!chooser) {
    window.location.href = upiUrl;
    return;
  }

  if (amountText) amountText.textContent = formatINR(amount);
  if (purposeText) purposeText.textContent = purpose || 'ICAIH 2026 Payment';

  chooser.classList.add('open');
  chooser.setAttribute('aria-hidden', 'false');
}

document.addEventListener('click', event => {
  const appButton = event.target.closest('[data-upi-app]');
  if (appButton) {
    launchUpiApp(appButton.dataset.upiApp);
    return;
  }

  if (event.target.matches('[data-close-upi-chooser]')) {
    closeUpiAppChooser();
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeUpiAppChooser();
});

function buildDynamicQrImageUrl(details, purpose = 'Registration') {
  const upiUrl = buildMythUpiUrl(details, purpose);
  const qrParams = new URLSearchParams({
    size: '260x260',
    margin: '10',
    data: upiUrl
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
    `Opening the secure UPI payment flow for ${formatINR(details.feeAmount)}. Complete the payment, then return and submit the registration form.`,
    ''
  );

  // Open the UPI deep-link (MYTH merchant) using the existing chooser logic.
  const upiUrl = buildMythUpiUrl(details, 'Registration');
  openUpiAppChooser({ upiUrl, amount: details.feeAmount, purpose: 'Registration', messageId: 'registrationMessage' });
}
function updateRegistrationPaymentUI({ keepPayment = false } = {}) {
  const role = document.getElementById('registrationRole')?.value || 'Delegate';
  const bulkBox = document.getElementById('bulkBookingBox');
  const studentCount = document.getElementById('studentCount');
  const openUpiBtn = document.getElementById('openUpiBtn');
  const studentIdNotice = document.getElementById('studentIdNotice');
  const studentIdConfirmed = document.getElementById('studentIdConfirmed');
  const isStudentRegistration = role === 'Student' || role === 'Bulk Booking';

  if (bulkBox) bulkBox.hidden = role !== 'Bulk Booking';
  if (studentCount) studentCount.required = role === 'Bulk Booking';
  if (studentIdNotice) studentIdNotice.hidden = !isStudentRegistration;
  if (studentIdConfirmed) {
    studentIdConfirmed.required = isStudentRegistration;
    if (!isStudentRegistration) studentIdConfirmed.checked = false;
  }


  if (role === 'Bulk Booking') synchronizeBulkOfferWithStudentCount();

  const details = getRegistrationPaymentDetails();

  const feeAmount = document.getElementById('feeAmount');
  const discountPercent = document.getElementById('discountPercent');
  const selectedFeeText = document.getElementById('selectedFeeText');
  const selectedFeeNote = document.getElementById('selectedFeeNote');
  const earlyBirdStatus = document.getElementById('earlyBirdStatus');
  const paymentQrText = document.getElementById('paymentQrText');
  const paymentQrImage = document.getElementById('paymentQrImage');
  const paymentQrBox = document.querySelector('.payment-qr-box');

  if (feeAmount) feeAmount.value = details.feeAmount;
  if (discountPercent) discountPercent.value = details.discountPercent;

  if (selectedFeeText) {
    selectedFeeText.textContent = details.requiresPayment ? formatINR(details.feeAmount) : 'No Fee';
  }

  if (selectedFeeNote) {
    selectedFeeNote.textContent = details.note;
  }

  if (earlyBirdStatus) {
    if (role === 'Bulk Booking') {
      earlyBirdStatus.textContent = details.bulkOfferKey === '1-4'
        ? 'Standard student fee applied: ₹999 per student for 1–4 students. No Early Bird discount is applied.'
        : 'Student bulk-booking discount is available. Early Bird 10% discount applies until July 12, 2026.';
      earlyBirdStatus.classList.remove('expired');
    } else if (details.earlyBirdActive && details.requiresPayment) {
      earlyBirdStatus.textContent = 'Early Bird offer active: 10% discount is automatically applied through July 12, 2026.';
      earlyBirdStatus.classList.remove('expired');
    } else if (details.requiresPayment) {
      earlyBirdStatus.textContent = 'Standard registration fee applies after July 12, 2026.';
      earlyBirdStatus.classList.add('expired');
    } else {
      earlyBirdStatus.textContent = '';
      earlyBirdStatus.classList.remove('expired');
    }
  }

  if (paymentQrBox) paymentQrBox.hidden = !details.requiresPayment;
  if (openUpiBtn) openUpiBtn.disabled = !details.requiresPayment;

  if (!details.requiresPayment) {
    setPaymentStatus(
      'not-required',
      'No payment is required for this category. You can submit the registration directly.'
    );
  } else {
    if (!keepPayment) {
      setPaymentStatus(
        'pending-verification',
        'Complete the payment securely, then submit the form.'
      );
    }
  }

  if (paymentQrText) {
    paymentQrText.textContent = `Pay ${formatINR(details.feeAmount)} through the secure UPI/Razorpay page using Google Pay, PhonePe, Paytm, BHIM, cards, or net banking.`;
  }

  if (paymentQrImage && details.requiresPayment) {
    paymentQrImage.src = buildDynamicQrImageUrl(details);
    paymentQrImage.alt = `ICAIH 2026 secure payment QR code for ${formatINR(details.feeAmount)}`;
    paymentQrImage.title = `Scan to open the secure payment flow for ${formatINR(details.feeAmount)}`;
  }
}

document.getElementById('registrationRole')?.addEventListener('change', () => updateRegistrationPaymentUI());

document.getElementById('studentCount')?.addEventListener('input', event => {
  normalizeStudentCountInput(event.currentTarget);
  synchronizeBulkOfferWithStudentCount();
  updateRegistrationPaymentUI();
});

document.getElementById('studentCount')?.addEventListener('blur', () => {
  synchronizeBulkOfferWithStudentCount({ showError: true });
});

document.getElementById('bulkOffer')?.addEventListener('change', event => {
  const studentCountInput = document.getElementById('studentCount');
  const count = normalizeStudentCountInput(studentCountInput);
  const expectedKey = getBulkOfferKeyForCount(count);
  if (expectedKey) {
    event.currentTarget.value = expectedKey;
  } else {
    const selected = BULK_OFFERS[event.currentTarget.value];
    if (selected && studentCountInput) studentCountInput.value = String(selected.min);
  }
  synchronizeBulkOfferWithStudentCount();
  updateRegistrationPaymentUI();
});

['name', 'fullName', 'participantName', 'email', 'emailAddress', 'phone', 'organization'].forEach(fieldName => {
  document.querySelector(`[name="${fieldName}"]`)?.addEventListener('input', () => {
    updateRegistrationPaymentUI({ keepPayment: true });
  });
});


document.getElementById('openUpiBtn')?.addEventListener('click', openManualUpiPayment);

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

function openSponsorModal(mode = 'sponsor', selectedTier = '') {
  sponsorFormMode = mode === 'stall' ? 'stall' : 'sponsor';
  const modal = document.getElementById('sponsorModal');
  if (!modal) return;

  const modalTitle = document.getElementById('sponsorModalTitle');
  const modalKicker = document.getElementById('sponsorModalKicker');
  const tierLabel = document.getElementById('sponsorTierLabel');
  const selectedFeeLabel = document.getElementById('sponsorSelectedFeeLabel');
  const paymentHeading = document.getElementById('sponsorPaymentHeading');
  const submitBtn = document.getElementById('sponsorSubmitBtn');
  const formTypeInput = document.getElementById('sponsorInquiryType');
  const instructionsTitle = document.getElementById('sponsorPaymentInstructionsTitle');
  const instructionStep1 = document.getElementById('sponsorInstructionStep1');
  const instructionStep5 = document.getElementById('sponsorInstructionStep5');
  const instructionStep6 = document.getElementById('sponsorInstructionStep6');
  const instructionStep7 = document.getElementById('sponsorInstructionStep7');
  const instructionStep8 = document.getElementById('sponsorInstructionStep8');
  const instructionAlert = document.getElementById('sponsorInstructionAlert');

  populateSponsorTierOptions(sponsorFormMode, selectedTier);

  if (formTypeInput) formTypeInput.value = sponsorFormMode;

  if (sponsorFormMode === 'stall') {
    if (modalKicker) modalKicker.textContent = 'Stall / Exhibitor Booking';
    if (modalTitle) modalTitle.textContent = 'Book Stall Space';
    if (tierLabel) tierLabel.innerHTML = 'Stall / Exhibitor Tier <b class="required-star">*</b>';
    if (selectedFeeLabel) selectedFeeLabel.textContent = 'Selected Stall Fee';
    if (paymentHeading) paymentHeading.textContent = 'Secure Stall Payment';
    if (submitBtn) submitBtn.textContent = 'Submit Stall Booking';
    if (instructionsTitle) instructionsTitle.textContent = 'Stall Booking & Payment Instructions';
    if (instructionStep1) instructionStep1.textContent = 'Fill in all the required stall or exhibitor booking details.';
    if (instructionStep5) instructionStep5.textContent = 'After the payment is successful, return to this stall booking form.';
    if (instructionStep6) instructionStep6.innerHTML = 'Click <strong>Submit Stall Booking</strong> to complete your booking. <strong>This step is mandatory.</strong>';
    if (instructionStep7) instructionStep7.innerHTML = 'Your stall booking details will not be submitted to the admin unless you click <strong>Submit Stall Booking</strong>.';
    if (instructionStep8) instructionStep8.textContent = 'If you complete the payment but do not submit the stall booking form, your booking will remain incomplete. Keep your payment receipt or transaction ID for verification.';
    if (instructionAlert) instructionAlert.innerHTML = '<strong>Important:</strong> Payment alone does not complete your stall booking. You must return to this form and click <strong>Submit Stall Booking</strong>.';
  } else {
    if (modalKicker) modalKicker.textContent = 'Sponsor Inquiry';
    if (modalTitle) modalTitle.textContent = 'Become a Sponsor';
    if (tierLabel) tierLabel.innerHTML = 'Sponsorship Tier <b class="required-star">*</b>';
    if (selectedFeeLabel) selectedFeeLabel.textContent = 'Selected Sponsor Fee';
    if (paymentHeading) paymentHeading.textContent = 'Secure Sponsor Payment';
    if (submitBtn) submitBtn.textContent = 'Submit Sponsor Inquiry';
    if (instructionsTitle) instructionsTitle.textContent = 'Sponsorship & Payment Instructions';
    if (instructionStep1) instructionStep1.textContent = 'Fill in all the required sponsorship details.';
    if (instructionStep5) instructionStep5.textContent = 'After the payment is successful, return to this sponsorship form.';
    if (instructionStep6) instructionStep6.innerHTML = 'Click <strong>Submit Sponsor Inquiry</strong> to complete your request. <strong>This step is mandatory.</strong>';
    if (instructionStep7) instructionStep7.innerHTML = 'Your sponsorship details will not be submitted to the admin unless you click <strong>Submit Sponsor Inquiry</strong>.';
    if (instructionStep8) instructionStep8.textContent = 'If you complete the payment but do not submit the sponsorship form, your request will remain incomplete. Keep your payment receipt or transaction ID for verification.';
    if (instructionAlert) instructionAlert.innerHTML = '<strong>Important:</strong> Payment alone does not complete your sponsorship request. You must return to this form and click <strong>Submit Sponsor Inquiry</strong>.';
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

  updateSponsorPaymentUI();
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

document.getElementById('openSponsorModal')?.addEventListener('click', () => openSponsorModal('sponsor'));

document.querySelectorAll('.footer-sponsor-open').forEach(btn => {
  btn.addEventListener('click', () => openSponsorModal('sponsor'));
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
      ? `${sponsorTier} ${sponsorFormMode === 'stall' ? 'stall booking fee' : 'sponsorship fee'}`
      : sponsorFormMode === 'stall' ? 'Select a stall / exhibitor tier to view the fee.' : 'Select a sponsorship tier to view the fee.'
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

function resetSponsorPaymentState() {
  setSponsorPaymentStatus(
    'pending-verification',
    'Select a package and complete payment on the secure payment page.'
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
  // Sponsor Crowdshaki URL builder removed. Use the MYTH UPI deep-link
  // generator (`buildMythUpiUrl`) for sponsor payment QR and direct UPI opens.
  return '';
}

function buildSponsorDynamicQrImageUrl(details) {
  const upiUrl = buildMythUpiUrl(details, 'Sponsorship');
  const qrParams = new URLSearchParams({
    size: '260x260',
    margin: '10',
    data: upiUrl
  });
  return `https://api.qrserver.com/v1/create-qr-code/?${qrParams.toString()}`;
}

function validateSponsorPaymentFields(details, showError = false) {
  if (!details.sponsorTier) {
    if (showError) {
      showMessage('sponsorMessage', 'Please select a sponsorship or stall tier.', 'error');
      document.getElementById('sponsorTier')?.focus();
    }
    return false;
  }

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

  if (feeAmount) feeAmount.value = details.feeAmount;

  if (selectedFeeText) {
    selectedFeeText.textContent = details.requiresPayment ? formatINR(details.feeAmount) : 'Select Tier';
  }

  if (selectedFeeNote) {
    selectedFeeNote.textContent = details.note;
  }

  if (openPaymentBtn) openPaymentBtn.disabled = !details.requiresPayment;

  if (!keepPayment) resetSponsorPaymentState();

  if (paymentQrText) {
    paymentQrText.textContent = details.requiresPayment
      ? `Pay ${formatINR(details.feeAmount)} through the secure UPI/Razorpay payment page.`
      : 'Select a sponsorship or stall tier to generate the secure payment page and QR code.';
  }

  if (paymentQrImage && details.requiresPayment) {
    paymentQrImage.src = buildSponsorDynamicQrImageUrl(details);
    paymentQrImage.alt = `ICAIH 2026 secure payment QR code for ${formatINR(details.feeAmount)}`;
    paymentQrImage.title = `Scan to open the secure payment flow for ${formatINR(details.feeAmount)}`;
  }

  if (details.requiresPayment) {
    if (!keepPayment) {
      setSponsorPaymentStatus(
        'pending-verification',
        'Complete the payment securely, then submit the form.'
      );
    } else {
      validateSponsorPaymentFields(details, false);
    }
  }
}

function openSponsorPaymentPage() {
  const form = document.getElementById('sponsorForm');
  const details = getSponsorPaymentDetails();

  if (!details.sponsorTier) {
    showMessage('sponsorMessage', `Please select a ${sponsorFormMode === 'stall' ? 'stall / exhibitor tier' : 'sponsorship tier'} before opening the payment page.`, 'error');
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
    `Opening the secure UPI payment flow for ${formatINR(details.feeAmount)}. Complete the payment securely, then return and submit the form.`,
    ''
  );

  const upiUrl = buildMythUpiUrl(details, 'Sponsorship');
  openUpiAppChooser({ upiUrl, amount: details.feeAmount, purpose: 'Sponsorship', messageId: 'sponsorMessage' });
}

document.getElementById('sponsorTier')?.addEventListener('input', () => updateSponsorPaymentUI());
document.getElementById('sponsorTier')?.addEventListener('change', () => updateSponsorPaymentUI());

['companyName', 'contactPerson', 'email', 'phone'].forEach(fieldName => {
  document.querySelector(`#sponsorForm [name="${fieldName}"]`)?.addEventListener('input', () => {
    updateSponsorPaymentUI({ keepPayment: true });
  });
});


document.getElementById('openSponsorPaymentBtn')?.addEventListener('click', openSponsorPaymentPage);


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
      ['Category', formData.category || 'General']
    ];


    rows.push(
      ['Paid Amount', formatINR(formData.feeAmount)],
      ['Registration ID', refId || '—'],
      ['Payment Status', formData.paymentStatus || '—']
    );

    detailsEl.innerHTML = rows.map(([label, value]) => `
      <div class="detail-row">
        <span>${label}:</span>
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

function escapeSuccessText(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function openSubmissionSuccessModal(config = {}) {
  const modal = document.getElementById('submissionSuccessModal');
  if (!modal) return;

  const tag = document.getElementById('submissionSuccessTag');
  const title = document.getElementById('submissionSuccessTitle');
  const body = document.getElementById('submissionSuccessBody');
  const details = document.getElementById('submissionSuccessDetails');
  const note = document.getElementById('submissionSuccessNote');

  if (tag) tag.textContent = config.tag || 'Form Submitted';
  if (title) title.textContent = config.title || 'Submission Received Successfully!';
  if (body) body.innerHTML = config.body || 'Thank you. Your form has been received successfully.';
  if (note) note.textContent = config.note || 'Your details have been saved. The ICAIH 2026 team will contact you if further information is required.';

  const rows = Array.isArray(config.details) ? config.details : [];
  if (details) {
    details.innerHTML = rows
      .filter(row => row && row.value !== undefined && row.value !== null && String(row.value).trim())
      .map(row => `<div class="detail-row"><span>${escapeSuccessText(row.label)}:</span><strong>${escapeSuccessText(row.value)}</strong></div>`)
      .join('');
  }

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeSubmissionSuccessModal() {
  const modal = document.getElementById('submissionSuccessModal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.getElementById('closeSubmissionSuccessModal')?.addEventListener('click', closeSubmissionSuccessModal);
document.getElementById('submissionSuccessModal')?.addEventListener('click', event => {
  if (event.target.id === 'submissionSuccessModal') closeSubmissionSuccessModal();
});

function openCompetitionClosedModal() {
  openSubmissionSuccessModal({
    tag: 'Competition submissions are closed.',
    title: 'Competition submissions are closed.',
    body: `
      <p>Competition submissions are closed.</p>
      <p>The deadline for Pre-Conference Competitions, Research Paper Submission, and International Awards Nomination has been completed on 16 July 2026.</p>
      <p>Thank you for your interest and support.</p>
    `,
    details: [],
    note: 'Thank you for your interest and support.'
  });
}

function resetRegistrationFormState(form) {
  form.reset();
  form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="number"], textarea').forEach(field => {
    if (!field.readOnly) field.value = '';
  });
  form.querySelectorAll('.field-error').forEach(field => field.classList.remove('field-error'));
  resetPaymentProof();
  updateRegistrationPaymentUI();
}

function resetApplicationFormState(form, applicationType = 'pre-conference-competition') {
  form.reset();
  form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="number"], textarea').forEach(field => {
    if (!field.readOnly && field.type !== 'hidden') field.value = '';
  });
  form.querySelectorAll('input[type="file"]').forEach(field => { field.value = ''; });
  form.querySelectorAll('.field-error').forEach(field => field.classList.remove('field-error'));
  showMessage('applicationMessage', '', '');
  setApplicationType(applicationType);
    syncPreConferenceSubmissionTitle();
  updateApplicationFileMailLinks();
}

/* ── Registration form submit ── */
document.getElementById('registrationForm')?.addEventListener('submit', async e => {
  e.preventDefault();

  const form = e.currentTarget;
  const details = getRegistrationPaymentDetails();

  if (details.role === 'Bulk Booking') {
    const { count, offerKey } = synchronizeBulkOfferWithStudentCount({ showError: true });
    if (!offerKey || !count) {
      showMessage(
        'registrationMessage',
        'Please enter a whole-number student count of at least 1. Pricing is applied automatically: 1–4 = ₹999 per student, 5–24 = 10%, 25–49 = 20%, and 50+ = 25%.',
        'error'
      );
      document.getElementById('studentCount')?.focus();
      return;
    }
  }

  const studentIdConfirmed = document.getElementById('studentIdConfirmed');
  if ((details.role === 'Student' || details.role === 'Bulk Booking') && !studentIdConfirmed?.checked) {
    showMessage(
      'registrationMessage',
      'Please confirm that you will bring your original and currently valid student ID card for verification.',
      'error'
    );
    studentIdConfirmed?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    studentIdConfirmed?.focus();
    return;
  }

  if (!validatePhoneFields(form, 'registrationMessage')) return;

  const formData = new FormData(form);
  const normalizedFields = getNormalizedRegistrationFields(formData);

  const requiredRegistrationFields = [
    { key: 'name', label: 'Full Name', selector: '[name="name"]' },
    { key: 'email', label: 'Email Address', selector: '[name="email"]' },
    { key: 'phone', label: 'Phone Number', selector: '[name="phone"]' },
    { key: 'organization', label: 'Organization / Institution', selector: '[name="organization"]' }
  ];

  const missingRegistrationField = requiredRegistrationFields.find(
    field => !normalizedFields[field.key]
  );

  if (missingRegistrationField) {
    showMessage(
      'registrationMessage',
      `${missingRegistrationField.label} is required.`,
      'error'
    );

    const missingInput = form.querySelector(missingRegistrationField.selector);
    missingInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    missingInput?.focus();
    return;
  }

  applyNormalizedRegistrationFields(formData, normalizedFields);

  if (!validateManualPaymentFields(details, true)) return;

  formData.set('role', details.role);
  formData.set('registrationRole', details.role);
  formData.set('category', formData.get('category') || 'General');
  formData.set('feeAmount', String(details.feeAmount));
  formData.set('discountPercent', String(details.discountPercent));
  formData.set('studentCount', String(details.studentCount || ''));
  formData.set('bulkOffer', details.bulkOffer || '');
  formData.set('paymentConfirmed', details.requiresPayment ? 'payment-page-opened' : 'not-required');
  formData.set('paymentStatus', details.requiresPayment ? 'pending-verification' : 'not-required');
  

  const submitButton = form.querySelector('button[type="submit"]');
  const originalSubmitText = submitButton ? submitButton.textContent : '';

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
  }

  showMessage('registrationMessage', 'Submitting registration…', '');

  try {
    // The registration endpoint expects JSON. Sending FormData here creates a
    // multipart request that Express cannot parse without Multer, leaving
    // req.body empty and causing the required-field error.
    const registrationPayload = Object.fromEntries(formData.entries());

    const response = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationPayload)
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

    showMessage('registrationMessage', 'Registration received. Opening confirmation in 3 seconds…', 'ok');
    await waitForSuccessPopup();
    openSuccessModal(modalData, refId, result.emailStatus);

    showMessage(
      'registrationMessage',
      result.message || 'Registration submitted successfully. Payment is pending verification.',
      'ok'
    );

    resetRegistrationFormState(form);

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
  

  const submitButton = form.querySelector('button[type="submit"]');
  const originalSubmitText = submitButton ? submitButton.textContent : '';

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
  }

  showMessage('sponsorMessage', sponsorFormMode === 'stall' ? 'Submitting stall booking…' : 'Submitting sponsor inquiry…', '');

  try {
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch(`${API_BASE}/api/sponsor-inquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || 'Inquiry failed.');
    }

    const submittedMode = sponsorFormMode;
    const submittedData = Object.fromEntries(formData.entries());
    const submittedTier = submittedData.sponsorTier || (submittedMode === 'stall' ? 'Stall Space' : 'Sponsorship Package');
    const submittedRefId = result.refId || result.id || `ICAIH-${Date.now().toString(36).toUpperCase()}`;

    showMessage(
      'sponsorMessage',
      result.message || 'Inquiry submitted successfully. Payment is pending verification.',
      'ok'
    );

    form.reset();
    resetSponsorPaymentState();
    updateSponsorPaymentUI();
    closeSponsorModal();
    await waitForSuccessPopup();

    openSubmissionSuccessModal({
      tag: submittedMode === 'stall' ? 'Stall Booking Submitted' : 'Sponsor Form Submitted',
      title: submittedMode === 'stall' ? 'Stall Space Request Received!' : 'Sponsorship Request Received!',
      body: submittedMode === 'stall'
        ? 'Thank you for booking an exhibitor stall at <strong>ICAIH 2026</strong>. Your request has been received successfully.'
        : 'Thank you for your interest in sponsoring <strong>ICAIH 2026</strong>. Your sponsorship request has been received successfully.',
      details: [
        { label: 'Company Name', value: submittedData.companyName },
        { label: 'Contact Person', value: submittedData.contactPerson },
        { label: 'Email', value: submittedData.email },
        { label: submittedMode === 'stall' ? 'Stall Package' : 'Sponsorship Tier', value: submittedTier },
        { label: 'Paid Amount', value: formatINR(details.feeAmount) },
        { label: 'Registration ID', value: submittedRefId },
        { label: 'Payment Status', value: 'Pending Verification' }
      ],
      note: submittedMode === 'stall'
        ? 'Your stall booking details have been saved. The ICAIH 2026 team will contact you regarding space allocation and setup instructions.'
        : 'Your sponsorship details have been saved. The ICAIH 2026 team will contact you regarding confirmation and branding requirements.'
    });
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
    closeSubmissionSuccessModal();
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

const APPLICATION_LABELS = {
  'pre-conference-competition': 'Pre-Conference Competitions Application Form (Submission Deadline: July 8, 2026)',
  'research-paper': 'Research Paper Submission Form (Submission Deadline: July 8, 2026)',
  'award-nomination': 'ICAIH 2026 International Awards Nomination Form'
};

const APPLICATION_FIELD_CLASS = {
  'pre-conference-competition': 'pre-competition-fields',
  'research-paper': 'research-paper-fields',
  'award-nomination': 'award-nomination-fields'
};

function getSafeApplicationType(type) {
  return Object.prototype.hasOwnProperty.call(APPLICATION_LABELS, type) ? type : 'pre-conference-competition';
}

function isMobileApplicationView() {
  return window.matchMedia('(max-width: 640px)').matches;
}

function showApplicationPicker() {
  const modal = document.getElementById('applicationModal');
  if (!modal || !isMobileApplicationView()) return;

  modal.classList.add('mobile-application-picker');
  modal.classList.remove('mobile-application-form-page');

  // On the mobile selection screen no form is selected yet.
  // The blue active state is applied only after the user taps a form.
  document.querySelectorAll('.application-tab').forEach(tab => {
    tab.classList.remove('active');
    tab.setAttribute('aria-selected', 'false');
  });

  const header = document.getElementById('mobileApplicationPageHeader');
  if (header) header.setAttribute('aria-hidden', 'true');
  modal.scrollTo({ top: 0, behavior: 'smooth' });
}

function showApplicationFormPage(type) {
  const modal = document.getElementById('applicationModal');
  if (!modal || !isMobileApplicationView()) return;
  modal.classList.remove('mobile-application-picker');
  modal.classList.add('mobile-application-form-page');
  const title = document.getElementById('mobileApplicationPageTitle');
  if (title) title.textContent = APPLICATION_LABELS[getSafeApplicationType(type)];
  const header = document.getElementById('mobileApplicationPageHeader');
  if (header) header.setAttribute('aria-hidden', 'false');
  modal.scrollTo({ top: 0, behavior: 'smooth' });
  window.setTimeout(() => {
    document.getElementById('mobileApplicationPageHeader')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, 80);
}

function openApplicationModal() {
  const modal = document.getElementById('applicationModal');
  if (!modal) return;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setApplicationType(document.getElementById('applicationType')?.value || 'pre-conference-competition');
  if (isMobileApplicationView()) showApplicationPicker();
}

function closeApplicationModal() {
  const modal = document.getElementById('applicationModal');
  if (!modal) return;

  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function setInactiveApplicationFields() {
  const applicationType = getSafeApplicationType(document.getElementById('applicationType')?.value);
  const activeClass = APPLICATION_FIELD_CLASS[applicationType];
  const typedClasses = Object.values(APPLICATION_FIELD_CLASS);

  typedClasses.forEach(className => {
    const disabled = className !== activeClass;
    document.querySelectorAll(`.${className} input, .${className} select, .${className} textarea`).forEach(field => {
      field.disabled = disabled;
    });
  });

  document.querySelectorAll('.non-award-fields input, .non-award-fields select, .non-award-fields textarea').forEach(field => {
    field.disabled = applicationType === 'award-nomination';
  });

  document.querySelectorAll('.office-use-section input, .office-use-section textarea').forEach(field => {
    field.disabled = true;
  });

  document.querySelectorAll('input[name="participationType"], input[name="teamMembersCount"], input[name="teamMemberNames"], input[name="individualMemberName"]').forEach(field => {
    field.disabled = true;
    field.required = false;
  });
}

function setApplicationType(type) {
  const safeType = getSafeApplicationType(type);
  const applicationTypeInput = document.getElementById('applicationType');
  const submitButton = document.getElementById('applicationSubmitBtn');

  if (applicationTypeInput) applicationTypeInput.value = safeType;

  document.body.classList.toggle('application-competition-mode', safeType === 'pre-conference-competition');
  document.body.classList.toggle('application-research-mode', safeType === 'research-paper');
  document.body.classList.toggle('application-award-mode', safeType === 'award-nomination');

  document.querySelectorAll('.application-tab').forEach(tab => {
    const isActive = tab.dataset.applicationType === safeType;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  if (submitButton) {
    submitButton.textContent = safeType === 'research-paper'
      ? 'Submit Research Paper'
      : safeType === 'award-nomination'
        ? 'Submit Award Nomination'
        : 'Submit Competition Application';
  }

  const panel = document.querySelector('.application-form-scroll');
  if (panel) panel.scrollTop = 0;

  setInactiveApplicationFields();
  setConditionalOtherFields();
  applyApplicationRequiredFields();
  updateApplicationFileMailLinks();
  syncPreConferenceSubmissionTitle();
  applyApplicationRequiredFields();
}

function validateApplicationFiles(form) {
  const maxBytes = 15 * 1024 * 1024;
  const applicationType = getSafeApplicationType(document.getElementById('applicationType')?.value);
  const allowedExt = applicationType === 'research-paper'
    ? /\.(pdf|doc|docx)$/i
    : /\.(pdf|doc|docx|ppt|pptx|png|jpg|jpeg)$/i;
  const errorText = applicationType === 'research-paper'
    ? 'Invalid file type. Accepted formats for research paper: PDF, DOC, DOCX.'
    : 'Invalid file type. Accepted formats: PDF, DOC, DOCX, PPT, PPTX, PNG, JPG.';
  const fileInputs = Array.from(form.querySelectorAll('input[type="file"]:not(:disabled)'));
  const files = fileInputs.flatMap(input => Array.from(input.files || []));

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


function isVisibleApplicationElement(element) {
  if (!element || element.disabled) return false;
  return Boolean(element.offsetParent || element.getClientRects().length);
}

function setConditionalOtherFields() {
  document.querySelectorAll('#applicationForm .inline-other').forEach(label => {
    const radio = label.querySelector('input[type="radio"]');
    const textInput = label.querySelector('input:not([type="radio"])');
    if (!radio || !textInput) return;

    const active = !radio.disabled && radio.checked;
    textInput.disabled = radio.disabled || !active;
    textInput.required = active;
    if (!active) textInput.value = '';
  });
}

function addRequiredStar(target) {
  if (!target || target.querySelector('[data-auto-required-star]') || target.querySelector('.required-star')) return;
  target.insertAdjacentHTML('beforeend', ' <b class="required-star" data-auto-required-star>*</b>');
}

function removeAutoRequiredStars(scope) {
  scope.querySelectorAll('[data-auto-required-star]').forEach(star => star.remove());
}

function applyApplicationRequiredFields() {
  const form = document.getElementById('applicationForm');
  if (!form) return;

  removeAutoRequiredStars(form);
  setConditionalOtherFields();

  const fields = Array.from(form.querySelectorAll('input, select, textarea'))
    .filter(field => field.name !== 'participationType' && field.name !== 'individualMemberName' && field.name !== 'teamMembersCount' && field.name !== 'teamMemberNames');

  fields.forEach(field => {
    if (field.type === 'hidden' || field.disabled) return;

    const visible = isVisibleApplicationElement(field);
    if (!visible) {
      field.required = false;
      return;
    }

    if (field.type === 'file') {
      const requiredFile = field.hasAttribute('data-required-file');
      field.required = requiredFile;
      if (requiredFile) addRequiredStar(field.closest('label')?.querySelector('span'));
      return;
    }

    if (field.type === 'radio') {
      const block = field.closest('.choice-block');
      addRequiredStar(block?.querySelector('.choice-title'));
      field.required = true;
      return;
    }

    if (field.type === 'checkbox') {
      const group = field.closest('.choice-block');
      if (group) {
        addRequiredStar(group.querySelector('.choice-title'));
      } else {
        addRequiredStar(field.closest('label')?.querySelector('span'));
        field.required = true;
      }
      return;
    }

    field.required = true;
    addRequiredStar(field.closest('label')?.querySelector('span'));
  });
}

function getFieldLabel(field) {
  const label = field.closest('label');
  if (!label) return field.name || 'This field';
  const span = label.querySelector('span');
  return (span ? span.textContent : label.textContent).replace('*', '').trim() || field.name || 'This field';
}

function validateActiveApplicationRequiredFields(form) {
  applyApplicationRequiredFields();

  const controls = Array.from(form.querySelectorAll('input, select, textarea'))
    .filter(field => field.type !== 'hidden' && isVisibleApplicationElement(field));

  const firstEmpty = controls.find(field => {
    if (field.type === 'radio') return false;
    if (field.type === 'file') return field.required && !(field.files && field.files.length);
    if (field.type === 'checkbox') return field.required && !field.checked;
    return field.required && !String(field.value || '').trim();
  });

  if (firstEmpty) {
    firstEmpty.classList.add('field-error');
    firstEmpty.focus({ preventScroll: false });
    showMessage('applicationMessage', `${getFieldLabel(firstEmpty)} is required. Please fill all required fields marked in red.`, 'error');
    return false;
  }

  const radioNames = [...new Set(controls.filter(field => field.type === 'radio' && field.required && field.name !== 'participationType').map(field => field.name))];
  for (const name of radioNames) {
    const group = controls.filter(field => field.type === 'radio' && field.name === name);
    if (!group.some(field => field.checked)) {
      const first = group[0];
      first.focus({ preventScroll: false });
      const title = first.closest('.choice-block')?.querySelector('.choice-title')?.textContent.replace('*', '').trim() || 'Please select one option';
      showMessage('applicationMessage', `${title} is required. Please select one option.`, 'error');
      return false;
    }
  }

  const checkboxGroups = [...new Set(controls
    .filter(field => field.type === 'checkbox' && field.closest('.choice-block'))
    .map(field => field.name))];

  for (const name of checkboxGroups) {
    const group = controls.filter(field => field.type === 'checkbox' && field.name === name);
    if (group.length && !group.some(field => field.checked)) {
      const first = group[0];
      first.focus({ preventScroll: false });
      const title = first.closest('.choice-block')?.querySelector('.choice-title')?.textContent.replace('*', '').trim() || 'Please select at least one option';
      showMessage('applicationMessage', `${title} is required. Please select at least one option.`, 'error');
      return false;
    }
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    showMessage('applicationMessage', 'Please fill all required fields marked in red before submitting.', 'error');
    return false;
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
  tab.addEventListener('click', () => {
    const type = tab.dataset.applicationType;
    setApplicationType(type);
    showApplicationFormPage(type);
  });
});

document.getElementById('mobileApplicationBackBtn')?.addEventListener('click', showApplicationPicker);

window.addEventListener('resize', () => {
  const modal = document.getElementById('applicationModal');
  if (!modal?.classList.contains('open')) return;
  if (isMobileApplicationView()) {
    if (!modal.classList.contains('mobile-application-form-page')) showApplicationPicker();
  } else {
    modal.classList.remove('mobile-application-picker', 'mobile-application-form-page');
    document.getElementById('mobileApplicationPageHeader')?.setAttribute('aria-hidden', 'true');
  }
});

function clearApplicationForm() {
  const form = document.getElementById('applicationForm');
  const currentType = getSafeApplicationType(document.getElementById('applicationType')?.value);
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

  const selected = document.querySelector(`input[name="participationType"][value="${safeType}"]:not(:disabled)`);
  if (selected) selected.checked = true;

  const teamCount = document.querySelector('input[name="teamMembersCount"]:not(:disabled)');
  const teamMembers = document.querySelector('textarea[name="teamMemberNames"]:not(:disabled)');
  const individualMember = document.querySelector('input[name="individualMemberName"]:not(:disabled)');

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

  if (typeof applyApplicationRequiredFields === 'function') applyApplicationRequiredFields();
}

function syncPreConferenceSubmissionTitle() {
  const applicationType = getSafeApplicationType(document.getElementById('applicationType')?.value);
  const hiddenTitle = document.getElementById('applicationSubmissionTitle');
  if (!hiddenTitle) return;

  if (applicationType === 'research-paper') {
    const presentationType = document.querySelector('input[name="presentationType"]:checked:not(:disabled)')?.value || '';
    const topic = document.querySelector('.research-paper-fields input[name="topicTheme"]:checked:not(:disabled)')?.value || '';
    hiddenTitle.value = presentationType || topic || 'Research Paper Submission';
    return;
  }

  if (applicationType === 'award-nomination') {
    const awardCategory = document.querySelector('input[name="awardCategory"]:checked:not(:disabled)')?.value || '';
    hiddenTitle.value = awardCategory || 'ICAIH 2026 International Awards Nomination';
    return;
  }

  const selectedCompetition = document.querySelector('input[name="competitionCategory"]:checked:not(:disabled)')?.value || '';
  const selectedTopic = document.querySelector('.pre-competition-fields input[name="topicTheme"]:checked:not(:disabled)')?.value || '';
  hiddenTitle.value = selectedCompetition || selectedTopic || 'Pre-Conference Competition Submission';
}

function buildSafeFileName(value, fallback = 'Topic') {
  return String(value || '')
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || fallback;
}

function getActiveApplicationTopic() {
  const applicationType = getSafeApplicationType(document.getElementById('applicationType')?.value);
  if (applicationType === 'research-paper') {
    return document.querySelector('.research-paper-fields input[name="topicTheme"]:checked:not(:disabled)')?.value
      || document.querySelector('input[name="presentationType"]:checked:not(:disabled)')?.value
      || 'Research_Topic';
  }
  if (applicationType === 'award-nomination') {
    return document.querySelector('input[name="awardCategory"]:checked:not(:disabled)')?.value || 'Award_Category';
  }
  return document.querySelector('.pre-competition-fields input[name="topicTheme"]:checked:not(:disabled)')?.value
    || document.querySelector('input[name="competitionCategory"]:checked:not(:disabled)')?.value
    || 'Competition_Topic';
}

function getTypedApplicationFileName(defaultName) {
  const applicationType = getSafeApplicationType(document.getElementById('applicationType')?.value);
  const selector = applicationType === 'research-paper'
    ? 'input[name="emailFileNameResearch"]'
    : applicationType === 'award-nomination'
      ? 'input[name="emailFileNameAward"]'
      : 'input[name="emailFileNamePre"]';
  const typedName = document.querySelector(selector)?.value?.trim();
  return typedName || defaultName;
}

function updateApplicationFileMailLinks() {
  const applicationType = getSafeApplicationType(document.getElementById('applicationType')?.value);
  const enteredName = document.querySelector('input[name="fullName"]:not(:disabled)')?.value || '';
  const fullName = String(enteredName).trim() || 'YourName';
  const topic = getActiveApplicationTopic();
  const suggestedBase = `${buildSafeFileName(fullName, 'YourName')}_${buildSafeFileName(topic, 'Topic')}`;
  const suggestedName = `${suggestedBase}.pdf`;
  const finalFileName = getTypedApplicationFileName(suggestedName);
  const formName = APPLICATION_LABELS[applicationType];
  const subject = `ICAIH 2026 ${formName} - Supporting File - ${finalFileName}`;
  const body = [
    `Dear ICAIH 2026 Team,`,
    ``,
    `I am sending my supporting file for the ${formName}.`,
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

document.querySelectorAll('input[name="competitionCategory"], input[name="presentationType"], input[name="awardCategory"], input[name="topicTheme"]').forEach(input => {
  input.addEventListener('change', syncPreConferenceSubmissionTitle);
});

document.querySelectorAll('#applicationForm input, #applicationForm select, #applicationForm textarea').forEach(field => {
  field.addEventListener('input', () => {
    field.classList.remove('field-error');
    syncPreConferenceSubmissionTitle();
    setConditionalOtherFields();
    applyApplicationRequiredFields();
    updateApplicationFileMailLinks();
  });
  field.addEventListener('change', () => {
    field.classList.remove('field-error');
    syncPreConferenceSubmissionTitle();
    setConditionalOtherFields();
    applyApplicationRequiredFields();
    updateApplicationFileMailLinks();
  });
});

setApplicationType('pre-conference-competition');
syncPreConferenceSubmissionTitle();
updateApplicationFileMailLinks();

document.getElementById('applicationForm')?.addEventListener('submit', async e => {
  e.preventDefault();

  const submitButton = document.getElementById('applicationSubmitBtn');
  const originalSubmitText = submitButton ? submitButton.textContent : '';

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Submission Closed';
  }

  openCompetitionClosedModal();

  if (submitButton) {
    submitButton.disabled = false;
    submitButton.textContent = originalSubmitText || 'Submit Application';
  }
});

/* Add Apply Now modal to ESC close behavior */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeApplicationModal();
    closeSubmissionSuccessModal();
  }
});


/* ICAIH 2026 Guidelines navigation actions */
function openApplicationTypeFromGuidelines(type) {
  openApplicationModal();
  setApplicationType(type);
}

function openSponsorFromGuidelines(tier, mode = 'sponsor') {
  openSponsorModal(mode, tier);
  if (tier) {
    document.getElementById('sponsorTier')?.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

document.querySelectorAll('[data-guideline-action]').forEach(button => {
  button.addEventListener('click', () => {
    const action = button.dataset.guidelineAction;
    if (action === 'competition') {
      openApplicationTypeFromGuidelines('pre-conference-competition');
    } else if (action === 'research') {
      openApplicationTypeFromGuidelines('research-paper');
    } else if (action === 'award') {
      openApplicationTypeFromGuidelines('award-nomination');
    } else if (action === 'sponsor') {
      openSponsorFromGuidelines('', 'sponsor');
    } else if (action === 'stall') {
      openSponsorFromGuidelines('Standard Pavilion', 'stall');
    }
  });
});


document.addEventListener('change', function(e) {
  // No TSI membership number handling required
});


/* ICAIH 2026 official Chief Guests and Speakers.
   Edit this data object to update names, designations, or images dynamically. */
const ICAIH_OFFICIAL_PEOPLE = {
  presidential: [
    { name: 'Dr. S. Elumalai', designation: 'Former Registrar, University of Madras', image: 'assets/speakers-revised/s-elumalai.png' }
  ],
  welcome: [
    { name: 'Dr. D. Sathish Dev', designation: 'Deputy Medical Superintendent, Vels Medical College & Hospital, Tiruvallur District', image: 'assets/speakers-revised/d-sathish-dev.png' }
  ],
  chiefGuests: [
    { name: 'Dr. K.G. Arunraj', designation: 'Minister for Health and Family Welfare Department, Government of Tamil Nadu', image: 'assets/speakers-revised/kg-arunraj.jpeg' },
    { name: 'Dr. R. Kumar', designation: 'Minister for Information Technology, Government of Tamil Nadu', image: 'assets/speakers-revised/r-kumar.jpeg' },
    { name: 'Dr. Darez Ahamed, IAS', designation: 'Secretary to Government, Health and Family Welfare Department, Government of Tamil Nadu', image: 'assets/speakers-revised/darez-ahamed-ias.png' },
    { name: 'Mr. Pradeep Yadav, IAS', designation: 'Additional Chief Secretary, Information Technology and Digital Services Department, Government of Tamil Nadu', image: 'assets/speakers-revised/pradeep-yadav-ias.jpeg' },
    { name: 'Dr. Soumya Swaminathan', designation: 'Former Chief Scientist at the World Health Organization', image: 'assets/speakers-revised/soumya-swaminathan.jpeg' },
    { name: 'Dr. T. Arunkumar', designation: 'Member of the Tamil Nadu Legislative Assembly – Tiruvallur', image: 'assets/speakers-revised/t-arunkumar.jpeg' },
    { name: 'Dr. M. S. Ravi', designation: 'Member of the Tamil Nadu Legislative Assembly – Ponneri', image: 'assets/speakers-revised/m-s-ravi.jpeg' },
    { name: 'M. Arul Prakasam', designation: 'Member of the Tamil Nadu Legislative Assembly – Saidapet', image: 'assets/speakers-revised/m-arul-prakasam.jpeg' }
  ],
  speakers: [
    { name: 'Dr. S. Uma, IAS', designation: 'Project Director, Tamil Nadu Health System Project', image: 'assets/speakers-revised/s-uma-ias.jpeg' },
    { name: 'Dr. Sudha Seshayyan', designation: 'Former Vice-Chancellor, Tamil Nadu Dr. M.G.R. Medical University, Chennai', image: 'assets/speakers-revised/sudha-seshayyan.jpeg' },
    { name: 'Dr. Sunil Shroff', designation: 'President, Telemedicine Society of India; Urologist and Transplant Surgeon', image: 'assets/speakers-revised/sunil-shroff.jpeg' },
    { name: 'Vanitha Venugopal', designation: 'CEO, Tamil Nadu Technology Hub, Government of Tamil Nadu', image: 'assets/speakers-revised/vanitha-venugopal.jpeg' },
    { name: 'K. Krishna Chaitanya', designation: 'CEO, Tamil Nadu Infrastructure Fund Management Corporation Limited', image: 'assets/speakers-revised/k-krishna-chaitanya.jpeg' },
    { name: 'Dr. Renuka Vidyashankar', designation: 'Managing Director, Tamil Nadu Apex Skill Development Centre for Healthcare', image: 'assets/speakers-revised/renuka-vidyashankar.jpeg' },
    { name: 'Mr. Praveen Kumar', designation: 'Practice Leader – Risk, Cyber and Analytics', image: 'assets/speakers-revised/praveen-kumar.jpeg' },
    { name: 'Mr. Vikram Elango', designation: 'Generative AI Specialist, AWS, Dubai', image: 'assets/speakers-revised/vikram-elango.jpeg' },
    { name: 'Dr. Parasuraman Raman', designation: 'Principal Scientist, M. S. Swaminathan Research Foundation', image: 'assets/speakers-revised/parasuraman-raman.jpeg' }
  ],
  awardRecipients: [
    { name: 'Dr. S. Pushkala', designation: 'Recipient of the Lifetime Achievement Award', image: 'assets/speakers-revised/s-pushkala.jpeg' },
    { name: 'Dr. E. Theranirajan', designation: 'Recipient of the Lifetime Achievement Award', image: 'assets/speakers-revised/e-theranirajan.jpeg' },
    { name: 'Dr. Kumudha Lingaraj', designation: 'Recipient of the Lifetime Achievement Award', image: 'assets/speakers-revised/kumudha-lingaraj.png' },
    { name: 'Dr. Arunkumar Krishnasamy', designation: 'Recipient of the Lifetime Achievement Award', image: 'assets/speakers-revised/arunkumar-krishnasamy.jpeg' },
    { name: 'Dr. Vasanth Ramasamy', designation: 'Recipient of the Lifetime Achievement Award', image: 'assets/speakers-revised/vasanth-ramasamy.jpeg' }
  ],
  valedictory: [
    { name: 'Prof. Dr. R. Velraj', designation: 'Former Vice-Chancellor, Anna University', image: 'assets/speakers-revised/r-velraj.png' }
  ],
  voteThanks: [
    { name: 'T. L. Nandagopal, MCA., MSW.', designation: 'Chairman, G Care Council', image: 'assets/speakers-revised/tl-nandagopal.jpeg' }
  ],
  experts: [
    { name: 'State Planning Commission', image: '/assets/associates-final-upload/state-planning-commission.png' },
    { name: 'ELCOT', image: '/assets/associates-final-upload/elcot.png' },
    { name: 'EDII-TN', image: '/assets/associates-final-upload/edii-tn.png' },
    { name: 'ICT Academy', image: '/assets/associates-final-upload/ict-academy.png' },
    { name: 'iTNT Hub', image: '/assets/associates-final-upload/itnt.png' },
    { name: 'TNRiSE', image: '/assets/associates-final-upload/tnrise.png' },
    { name: 'Telemedicine Society of India', image: '/assets/associates-final-upload/tsi.png' },
    { name: 'TVA', image: '/assets/associates-final-upload/tva.png' }
  ]
};

function buildOfficialPersonCard(person, config = {}) {
  const { roleLabel = '', featured = false, logoCard = false } = config;
  const card = document.createElement('article');
  card.className = 'official-person-card';
  if (featured) card.classList.add('featured-person-card');
  if (logoCard) card.classList.add('logo-card');

  const photo = document.createElement('div');
  photo.className = 'official-person-photo';
  const img = document.createElement('img');
  img.src = person.image;
  img.alt = person.name;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.addEventListener('error', () => {
    if (person.image.startsWith('/assets/')) {
      img.src = person.image.slice(1);
    }
  }, { once: true });
  photo.appendChild(img);

  const content = document.createElement('div');
  content.className = 'official-person-content';

  if (roleLabel && !logoCard) {
    const badge = document.createElement('span');
    badge.className = 'official-role-badge';
    badge.textContent = roleLabel;
    content.appendChild(badge);
  }

  const name = document.createElement('h4');
  name.textContent = person.name;
  content.appendChild(name);

  if (person.designation) {
    const designation = document.createElement('p');
    designation.textContent = person.designation;
    content.appendChild(designation);
  }

  card.append(photo, content);
  return card;
}

function renderOfficialPeopleGroup(containerId, title, people, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  container.classList.toggle('group-featured', !!options.featured);
  container.classList.toggle('group-logos', !!options.logoGrid);

  const heading = document.createElement('h3');
  heading.className = 'official-group-title';
  heading.textContent = title;

  const grid = document.createElement('div');
  grid.className = options.logoGrid ? 'official-logo-grid' : 'official-people-grid';
  if (options.featured) grid.classList.add('featured-grid');

  people.forEach(person => {
    grid.appendChild(buildOfficialPersonCard(person, {
      roleLabel: '',
      featured: !!options.featured,
      logoCard: !!options.logoGrid
    }));
  });
  container.append(heading, grid);
}

function renderOfficialSpeakers() {
  renderOfficialPeopleGroup('presidentialAddressContainer', 'Presidential Address', ICAIH_OFFICIAL_PEOPLE.presidential, { featured: true });
  renderOfficialPeopleGroup('welcomeAddressContainer', 'Welcome Address', ICAIH_OFFICIAL_PEOPLE.welcome, { featured: true });
  renderOfficialPeopleGroup('chiefGuestsContainer', 'Chief Guest', ICAIH_OFFICIAL_PEOPLE.chiefGuests);
  renderOfficialPeopleGroup('speakersContainer', 'Speakers', ICAIH_OFFICIAL_PEOPLE.speakers);
  renderOfficialPeopleGroup('awardRecipientsContainer', 'Recipient of the Lifetime Achievement Award', ICAIH_OFFICIAL_PEOPLE.awardRecipients);
  renderOfficialPeopleGroup('valedictoryGuestContainer', 'Valedictory & Certificate Distribution Ceremony – Chief Guest', ICAIH_OFFICIAL_PEOPLE.valedictory, { featured: true });
  renderOfficialPeopleGroup('voteThanksContainer', 'Vote of Thanks', ICAIH_OFFICIAL_PEOPLE.voteThanks, { featured: true });
  renderOfficialPeopleGroup('expertsContainer', 'Associates', ICAIH_OFFICIAL_PEOPLE.experts, { logoGrid: true });
}
renderOfficialSpeakers();

/* ICAIH 2026 curated gallery. Repeated individual photos are removed and competition winner images are included. */
const ICAIH_CONFERENCE_GALLERY = [{"src":"assets/gallery-curated-2026/gallery-01.jpg?v=20260722-gallery-curated","alt":"Conference opening session at ICAIH 2026","caption":"Conference opening session at ICAIH 2026"},{"src":"assets/gallery-curated-2026/gallery-02.jpg?v=20260722-gallery-curated","alt":"Address delivered during ICAIH 2026","caption":"Address delivered during ICAIH 2026"},{"src":"assets/gallery-curated-2026/gallery-03.jpg?v=20260722-gallery-curated","alt":"Special guests and delegates at ICAIH 2026","caption":"Special guests and delegates at ICAIH 2026"},{"src":"assets/gallery-curated-2026/gallery-04.jpg?v=20260722-gallery-curated","alt":"Honourees recognised during ICAIH 2026","caption":"Honourees recognised during ICAIH 2026"},{"src":"assets/gallery-curated-2026/gallery-05.jpg?v=20260722-gallery-curated","alt":"Selected conference photograph – Shyam","caption":"Selected conference photograph – Shyam"},{"src":"assets/gallery-curated-2026/gallery-06.jpg?v=20260722-gallery-curated","alt":"Selected conference photograph – Edwin","caption":"Selected conference photograph – Edwin"},{"src":"assets/gallery-curated-2026/gallery-07.jpg?v=20260722-gallery-curated","alt":"Selected conference photograph – Manikandan","caption":"Selected conference photograph – Manikandan"},{"src":"assets/gallery-curated-2026/gallery-08.jpg?v=20260722-gallery-curated","alt":"Selected conference photograph – Padma","caption":"Selected conference photograph – Padma"},{"src":"assets/gallery-curated-2026/gallery-09.jpg?v=20260722-gallery-curated","alt":"Selected conference photograph – Monisha","caption":"Selected conference photograph – Monisha"},{"src":"assets/gallery-curated-2026/gallery-10.jpg?v=20260722-gallery-curated","alt":"Selected conference photograph – Alex","caption":"Selected conference photograph – Alex"},{"src":"assets/gallery-curated-2026/gallery-11.jpg?v=20260722-gallery-curated","alt":"Selected conference photograph – Lavakumar","caption":"Selected conference photograph – Lavakumar"},{"src":"assets/gallery-curated-2026/gallery-12.jpg?v=20260722-gallery-curated","alt":"Selected conference photograph – Anandhababu","caption":"Selected conference photograph – Anandhababu"},{"src":"assets/gallery-curated-2026/gallery-13.jpg?v=20260722-gallery-curated","alt":"Selected conference photograph – Ramkumar","caption":"Selected conference photograph – Ramkumar"},{"src":"assets/gallery-curated-2026/gallery-14.jpg?v=20260722-gallery-curated","alt":"Selected conference photograph – Dhanush Raj","caption":"Selected conference photograph – Dhanush Raj"},{"src":"assets/gallery-curated-2026/gallery-15.jpg?v=20260722-gallery-curated","alt":"Selected conference photograph – Reena","caption":"Selected conference photograph – Reena"},{"src":"assets/gallery-curated-2026/gallery-16.jpg?v=20260722-gallery-curated","alt":"Competition winner recognised at ICAIH 2026","caption":"Competition winner recognised at ICAIH 2026"},{"src":"assets/gallery-curated-2026/gallery-17.jpg?v=20260722-gallery-curated","alt":"Competition winner recognised at ICAIH 2026","caption":"Competition winner recognised at ICAIH 2026"},{"src":"assets/gallery-curated-2026/gallery-18.jpg?v=20260722-gallery-curated","alt":"Competition winner recognised at ICAIH 2026","caption":"Competition winner recognised at ICAIH 2026"},{"src":"assets/gallery-curated-2026/gallery-19.jpg?v=20260722-gallery-curated","alt":"Competition winner recognised at ICAIH 2026","caption":"Competition winner recognised at ICAIH 2026"},{"src":"assets/gallery-curated-2026/gallery-20.jpg?v=20260722-gallery-curated","alt":"Competition winner recognised at ICAIH 2026","caption":"Competition winner recognised at ICAIH 2026"},{"src":"assets/gallery-curated-2026/gallery-21.jpg?v=20260722-gallery-curated","alt":"Competition winner recognised at ICAIH 2026","caption":"Competition winner recognised at ICAIH 2026"},{"src":"assets/gallery-curated-2026/gallery-22.jpg?v=20260722-gallery-curated","alt":"Competition winner recognised at ICAIH 2026","caption":"Competition winner recognised at ICAIH 2026"},{"src":"assets/gallery-curated-2026/gallery-23.jpg?v=20260722-gallery-curated","alt":"Competition winner recognised at ICAIH 2026","caption":"Competition winner recognised at ICAIH 2026"},{"src":"assets/gallery-curated-2026/gallery-24.jpg?v=20260722-gallery-curated","alt":"Competition winner recognised at ICAIH 2026","caption":"Competition winner recognised at ICAIH 2026"},{"src":"assets/gallery-curated-2026/gallery-25.jpg?v=20260722-gallery-curated","alt":"Competition winner recognised at ICAIH 2026","caption":"Competition winner recognised at ICAIH 2026"},{"src":"assets/gallery-curated-2026/gallery-26.jpg?v=20260722-gallery-curated","alt":"Competition winner recognised at ICAIH 2026","caption":"Competition winner recognised at ICAIH 2026"},{"src":"assets/gallery-curated-2026/gallery-27.jpg?v=20260722-gallery-curated","alt":"Competition winner recognised at ICAIH 2026","caption":"Competition winner recognised at ICAIH 2026"},{"src":"assets/gallery-curated-2026/gallery-28.jpg?v=20260722-gallery-curated","alt":"Competition winner recognised at ICAIH 2026","caption":"Competition winner recognised at ICAIH 2026"},{"src":"assets/gallery-curated-2026/gallery-29.jpg?v=20260722-gallery-curated","alt":"Competition winner recognised at ICAIH 2026","caption":"Competition winner recognised at ICAIH 2026"},{"src":"assets/gallery-curated-2026/gallery-30.jpg?v=20260722-gallery-curated","alt":"Competition winner recognised at ICAIH 2026","caption":"Competition winner recognised at ICAIH 2026"}];

(function initialiseConferenceGallery() {
  const grid = document.getElementById('conferenceGalleryGrid');
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImage = document.getElementById('galleryLightboxImage');
  const caption = document.getElementById('galleryLightboxCaption');
  const closeButton = document.getElementById('galleryLightboxClose');
  const previousButton = document.getElementById('galleryLightboxPrev');
  const nextButton = document.getElementById('galleryLightboxNext');
  if (!grid || !lightbox || !lightboxImage || !caption) return;

  let activeIndex = 0;

  function showImage(index) {
    activeIndex = (index + ICAIH_CONFERENCE_GALLERY.length) % ICAIH_CONFERENCE_GALLERY.length;
    const item = ICAIH_CONFERENCE_GALLERY[activeIndex];
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt;
    caption.textContent = item.caption || item.alt || '';
  }

  function openLightbox(index) {
    showImage(index);
    lightbox.hidden = false;
    document.body.classList.add('gallery-lightbox-open');
    closeButton?.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImage.src = '';
    document.body.classList.remove('gallery-lightbox-open');
  }

  grid.innerHTML = '';
  ICAIH_CONFERENCE_GALLERY.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'conference-gallery-item visible';
    button.setAttribute('aria-label', `Open gallery image ${index + 1}`);

    const image = document.createElement('img');
    image.src = item.src;
    image.alt = item.alt;
    image.loading = index < 6 ? 'eager' : 'lazy';
    image.decoding = 'async';
    image.onerror = () => {
      image.onerror = null;
      image.src = item.src.replace(/^\//, '');
    };

    button.append(image);
    button.addEventListener('click', () => openLightbox(index));
    grid.appendChild(button);
  });

  closeButton?.addEventListener('click', closeLightbox);
  previousButton?.addEventListener('click', () => showImage(activeIndex - 1));
  nextButton?.addEventListener('click', () => showImage(activeIndex + 1));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', event => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') showImage(activeIndex - 1);
    if (event.key === 'ArrowRight') showImage(activeIndex + 1);
  });
})();;
