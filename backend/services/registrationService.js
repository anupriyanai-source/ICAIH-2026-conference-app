const RegistrationModel = require('../models/registrationModel');
const { sendRegistrationEmails } = require('./emailService');

function isEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val || '').trim());
}

function sanitize(val) {
  return String(val || '').trim();
}

const ROLE_FEES = {
  'Student': 499,
  'Research Scholar': 999,
  'Healthcare Professional': 1499,
  'Delegate': 1499,
  'Speaker': 0,
  'Online Attendee': 1,
  'Startup Founder': 1999,
  'Industry Expert': 2499
};

const BULK_OFFERS = {
  '5-25': { min: 5, max: 25, discount: 10, label: 'Student Group: 5 to 25 Students - 10% Discount' },
  '25-50': { min: 25, max: 50, discount: 20, label: 'Student Group: 25 to 50 Students - 20% Discount' },
  '50-plus': { min: 50, max: Infinity, discount: 25, label: 'Student Group: 50+ Students - 25% Discount' }
};

function calculatePayment({ role, bulkOffer, studentCount }) {
  if (role === 'Bulk Booking') {
    const offer = BULK_OFFERS[bulkOffer];
    const count = Number(studentCount || 0);

    if (!offer) {
      throw { status: 400, message: 'Please select a valid bulk booking offer.' };
    }

    if (!count || count < offer.min || count > offer.max) {
      throw { status: 400, message: 'Student count does not match the selected bulk booking offer.' };
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

  return {
    feeAmount: Number(ROLE_FEES[role] ?? 1499),
    discountPercent: 0,
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
    const role = sanitize(body.role) || 'Delegate';
    const category = sanitize(body.category) || 'General';
    const paymentReference = sanitize(body.paymentReference || body.payment_reference).toUpperCase();
    const paymentWhatsappShared = sanitize(body.paymentWhatsappShared || body.payment_whatsapp_shared);

    if (!name || !email || !phone || !organization) {
      throw { status: 400, message: 'Name, email, phone, and organization are required.' };
    }

    if (!isEmail(email)) {
      throw { status: 400, message: 'Please enter a valid email address.' };
    }

    if (!/^\d{10}$/.test(phone)) {
      throw { status: 400, message: 'Please enter a valid 10 digit phone number.' };
    }

    const payment = calculatePayment({
      role,
      bulkOffer: sanitize(body.bulkOffer),
      studentCount: body.studentCount
    });

    const requiresPayment = payment.feeAmount > 0;

    if (requiresPayment && paymentWhatsappShared !== '1') {
      throw { status: 400, message: 'Please share the payment screenshot on WhatsApp before entering the UTR / transaction ID.' };
    }

    if (requiresPayment && !/^[A-Za-z0-9]{10,30}$/.test(paymentReference)) {
      throw { status: 400, message: 'Please enter a valid UTR / transaction ID. It must contain 10 to 30 letters or numbers only.' };
    }

    const existing = await RegistrationModel.findByEmail(email);
    if (existing) {
      throw { status: 409, message: 'This email is already registered. Reference ID: ' + existing.ref_id };
    }

    const paymentStatus = requiresPayment ? 'pending-verification' : 'not-required';

    const registrationData = {
      name,
      email,
      phone,
      organization,
      role,
      category,
      feeAmount: payment.feeAmount,
      discountPercent: payment.discountPercent,
      bulkOffer: payment.bulkOffer,
      studentCount: payment.studentCount,
      paymentConfirmed: false,
      paymentStatus,
      paymentReference
    };

    const { refId } = await RegistrationModel.create(registrationData);
    const emailResult = await sendRegistrationEmails({ ...registrationData, refId });

    return {
      message: requiresPayment
        ? 'Registration submitted successfully. Payment UTR received and pending manual verification.'
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
