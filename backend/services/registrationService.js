const RegistrationModel = require('../models/registrationModel');
const SubmissionLookupModel = require('../models/submissionLookupModel');
const { sendRegistrationEmails } = require('./emailService');

function isEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val || '').trim());
}

function sanitize(val) {
  return String(val || '').trim();
}


const ROLE_FEES = {
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

function getBulkOfferForCount(count) {
  if (!Number.isInteger(count) || count < 1) return null;
  if (count <= 4) return BULK_OFFERS['1-4'];
  if (count <= 24) return BULK_OFFERS['5-24'];
  if (count <= 49) return BULK_OFFERS['25-49'];
  return BULK_OFFERS['50-plus'];
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

function calculatePayment({ role, bulkOffer, studentCount }) {
  if (role === 'Bulk Booking') {
    const rawCount = String(studentCount ?? '').trim();
    if (!/^\d+$/.test(rawCount)) {
      throw { status: 400, message: 'Please enter the number of students using whole numbers only.' };
    }

    const count = Number(rawCount);
    const offer = getBulkOfferForCount(count);

    if (!offer) {
      throw { status: 400, message: 'Please enter at least 1 student.' };
    }

    const baseTotal = count * ROLE_FEES.Student;
    const discountAmount = Math.round(baseTotal * offer.discount / 100);

    return {
      feeAmount: baseTotal - discountAmount,
      discountPercent: offer.discount,
      bulkOffer: offer.label,
      studentCount: count
    };
  }

  const baseFee = Number(ROLE_FEES[role] ?? 1999);
  const isOnlineAttendee = role === 'Online Attendee';
  const isTSIMember = role === 'TSI Member';
  const earlyBirdActive = (isOnlineAttendee || isTSIMember) ? false : isEarlyBirdActive();

  return {
    feeAmount: (isOnlineAttendee || isTSIMember) ? baseFee : applyEarlyBirdDiscount(baseFee),
    discountPercent: !isOnlineAttendee && !isTSIMember && earlyBirdActive && baseFee > 0 ? EARLY_BIRD_DISCOUNT_PERCENT : 0,
    bulkOffer: '',
    studentCount: null
  };
}

const RegistrationService = {
  async register(body) {
    const name = sanitize(body.name);
    const email = sanitize(body.email).toLowerCase();
    const phone = sanitize(body.phone);
    const organization = sanitize(body.organization);
    let role = sanitize(
      body.role ||
      body.registrationRole ||
      body.feeCategory ||
      body.roleCategory ||
      (body.tsiMembershipNumber ? 'TSI Member' : '')
    ) || 'Delegate';

    const normalizedRole = role.toLowerCase().replace(/\s+/g, ' ').trim();
    const roleMap = {
      'tsi member': 'TSI Member',
      'student': 'Student',
      'delegate': 'Delegate',
      'startup founder': 'Startup Founder',
      'industry expert': 'Industry Expert',
      'research scholar': 'Research Scholar',
      'online attendee': 'Online Attendee',
      'bulk booking': 'Bulk Booking',
      'student bulk booking': 'Bulk Booking',
      'student bulk': 'Bulk Booking'
    };
    role = roleMap[normalizedRole] || role;
    const category = sanitize(body.category) || 'General';
    const tsiMembershipNumber = sanitize(body.tsiMembershipNumber);

    const requiredFields = [
      ['Full Name', name],
      ['Email Address', email],
      ['Phone Number', phone],
      ['Organization / Institution', organization]
    ];
    const missingField = requiredFields.find(([, value]) => !value);

    if (missingField) {
      throw { status: 400, message: `${missingField[0]} is required.` };
    }

    if (!isEmail(email)) {
      throw { status: 400, message: 'Please enter a valid email address.' };
    }

    if (!/^\d{10}$/.test(phone)) {
      throw { status: 400, message: 'Please enter a valid 10 digit phone number.' };
    }

    if (role === 'TSI Member' && !tsiMembershipNumber) {

      throw { status: 400, message: 'TSI Membership Registration Number is required.' };
    }

    if (role === 'TSI Member') {
      ROLE_FEES['TSI Member'] = 500;
    }

    if (role !== 'Bulk Booking' && !Object.prototype.hasOwnProperty.call(ROLE_FEES, role)) {
      throw { status: 400, message: 'Please select a valid registration fee category.' };
    }

    const payment = calculatePayment({
      role,
      bulkOffer: sanitize(body.bulkOffer),
      studentCount: body.studentCount
    });

    const requiresPayment = payment.feeAmount > 0;

    const existing = await SubmissionLookupModel.findRegistrationByEmail(email);
    if (existing) {
      throw {
        status: 409,
        message: `You have already registered using this email address. Registration ID: ${existing.ref_id}.`
      };
    }



    const paymentStatus = requiresPayment ? 'pending-verification' : 'not-required';

    const registrationData = {
      name,
      email,
      phone,
      organization,
      role,
      category,
      tsiMembershipNumber,
      feeAmount: payment.feeAmount,
      discountPercent: payment.discountPercent,
      bulkOffer: payment.bulkOffer,
      studentCount: payment.studentCount,
      paymentConfirmed: false,
      paymentStatus,
      paymentMethod: ''
    };

    const { refId } = await RegistrationModel.create(registrationData);
    const emailResult = await sendRegistrationEmails({ ...registrationData, refId });

    return {
      message: requiresPayment
        ? 'Registration submitted successfully. Payment is pending verification.'
        : 'Registration submitted successfully.',
      id: refId,
      feeAmount: payment.feeAmount,
      paymentStatus,
      emailStatus: emailResult.message
    };
  },

  async getAllRegistrations() {
    return RegistrationModel.findAll();
  },
};

module.exports = RegistrationService;
