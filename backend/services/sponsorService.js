const SponsorModel = require('../models/sponsorModel');
const SubmissionLookupModel = require('../models/submissionLookupModel');
const { sendSponsorEmails } = require('./emailService');

function sanitize(val) {
  return String(val || '').trim();
}

function isEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val || '').trim());
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
  'Associate Sponsor': 100000,
  'Premium Exhibitor': 39999,
  'Standard Exhibitor': 34999,
  'Standard Pavilion': 29999
};

const SponsorService = {
  async submitInquiry(body) {
    const companyName = sanitize(body.companyName);
    const contactPerson = sanitize(body.contactPerson);
    const email = sanitize(body.email).toLowerCase();
    const phone = sanitize(body.phone);
    const sponsorTier = sanitize(body.sponsorTier);
    const message = sanitize(body.message);
    const inquiryType = sanitize(body.inquiryType) === 'stall' ? 'stall' : 'sponsor';

    if (!companyName || !contactPerson || !email || !phone || !sponsorTier) {
      throw { status: 400, message: 'Company name, contact person, email, phone, and sponsorship or stall tier are required.' };
    }

    if (!isEmail(email)) {
      throw { status: 400, message: 'Please enter a valid email address.' };
    }

    if (!/^\d{10}$/.test(phone)) {
      throw { status: 400, message: 'Please enter a valid 10 digit phone number.' };
    }

    const existing = await SubmissionLookupModel.findByEmail(email);
    if (existing) {
      throw {
        status: 409,
        message: `You have already registered or submitted a form using this email address. Reference ID: ${existing.ref_id}.`
      };
    }

    const feeAmount = Number(SPONSOR_FEES[sponsorTier] || 0);

    if (!feeAmount) {
      throw { status: 400, message: 'Please select a valid sponsorship or stall tier.' };
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
      paymentMethod: '',
      message,
      inquiryType
    };

    const { refId } = await SponsorModel.create(sponsorData);

    const emailResult = await sendSponsorEmails({
      ...sponsorData,
      refId
    });

    return {
      message: inquiryType === 'stall' ? 'Stall booking submitted successfully. Payment is pending verification.' : 'Sponsor inquiry submitted successfully. Payment is pending verification.',
      id: refId,
      emailStatus: emailResult
    };
  },

  async getAllInquiries() {
    return SponsorModel.findAll();
  }
};

module.exports = SponsorService;
