const SponsorModel = require('../models/sponsorModel');
const { queueSponsorEmails } = require('./emailService');

function sanitize(val) {
  return String(val || '').trim();
}

function isEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val || '').trim());
}

function isValidPaymentReference(val) {
  const cleaned = sanitize(val).replace(/\s+/g, '').toUpperCase();
  return /^[A-Z0-9][A-Z0-9_-]{9,35}$/.test(cleaned) && /\d/.test(cleaned);
}

const SPONSOR_FEES = {
  'Title Sponsor': 3000000,
  'Co-Title Sponsor': 2000000,
  'Healthcare Innovation Sponsor': 1000000,
  'Platinum Sponsor': 500000,
  'AI Transformation Sponsor': 500000,
  'Gold Sponsor': 300000,
  'Delegate Kit Sponsor': 300000,
  'Knowledge Partner': 200000,
  'Technology Partner': 200000,
  'Healthcare Partner': 200000,
  'Silver Sponsor': 100000,
  'Associate Sponsor': 100000
};

const SponsorService = {
  async submitInquiry(body) {
    const companyName = sanitize(body.companyName);
    const contactPerson = sanitize(body.contactPerson);
    const email = sanitize(body.email).toLowerCase();
    const phone = sanitize(body.phone);
    const sponsorTier = sanitize(body.sponsorTier);
    const message = sanitize(body.message);
    const paymentReference = sanitize(body.paymentReference).replace(/\s+/g, '').toUpperCase();

    if (!companyName || !contactPerson || !email || !phone || !sponsorTier) {
      throw { status: 400, message: 'Company name, contact person, email, phone, and sponsorship tier are required.' };
    }

    if (!isEmail(email)) {
      throw { status: 400, message: 'Please enter a valid email address.' };
    }

    if (!/^\d{10}$/.test(phone)) {
      throw { status: 400, message: 'Please enter a valid 10 digit phone number.' };
    }

    const feeAmount = Number(SPONSOR_FEES[sponsorTier] || 0);

    if (!feeAmount) {
      throw { status: 400, message: 'Please select a valid sponsorship tier.' };
    }

    if (!paymentReference) {
      throw { status: 400, message: 'UTR / Transaction ID is required after completing the sponsor payment.' };
    }

    if (!isValidPaymentReference(paymentReference)) {
      throw { status: 400, message: 'Please enter a valid UTR / Transaction ID.' };
    }

    const paymentStatus = 'pending-verification';

    const sponsorData = {
      companyName,
      contactPerson,
      email,
      phone,
      sponsorTier,
      feeAmount,
      paymentStatus,
      paymentReference,
      message
    };

    const { refId } = await SponsorModel.create(sponsorData);

    const emailResult = queueSponsorEmails({
      ...sponsorData,
      refId
    });

    return {
      message: 'Sponsor inquiry submitted successfully. Payment is pending verification.',
      id: refId,
      emailStatus: emailResult.message
    };
  },

  async getAllInquiries() {
    return SponsorModel.findAll();
  }
};

module.exports = SponsorService;
