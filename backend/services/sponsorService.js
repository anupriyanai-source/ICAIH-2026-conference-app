const SponsorModel = require('../models/sponsorModel');
const { sendSponsorEmails } = require('./emailService');

function sanitize(val) {
  return String(val || '').trim();
}

function isEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val || '').trim());
}

const SPONSOR_FEES = {
  'Platinum Sponsor': 99999,
  'Gold Sponsor': 74999,
  'Silver Sponsor': 49999,
  'Premium Exhibitor': 24999,
  'Standard Exhibitor': 22999,
  'Startup Pavilion': 19999
};

const SponsorService = {
  async submitInquiry(body) {
    const companyName = sanitize(body.companyName);
    const contactPerson = sanitize(body.contactPerson);
    const email = sanitize(body.email).toLowerCase();
    const phone = sanitize(body.phone);
    const sponsorTier = sanitize(body.sponsorTier);
    const message = sanitize(body.message);
    const paymentReference = sanitize(body.paymentReference || body.payment_reference).toUpperCase();
    const paymentWhatsappShared = sanitize(body.paymentWhatsappShared || body.payment_whatsapp_shared);

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

    if (paymentWhatsappShared !== '1') {
      throw { status: 400, message: 'Please share the sponsor payment screenshot on WhatsApp before entering the UTR / transaction ID.' };
    }

    if (!/^[A-Za-z0-9]{10,30}$/.test(paymentReference)) {
      throw { status: 400, message: 'Please enter a valid UTR / transaction ID. It must contain 10 to 30 letters or numbers only.' };
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

    const emailResult = await sendSponsorEmails({
      ...sponsorData,
      refId
    });

    return {
      message: 'Sponsor inquiry submitted successfully. Payment UTR is pending manual verification.',
      id: refId,
      emailStatus: emailResult.message
    };
  },

  async getAllInquiries() {
    return SponsorModel.findAll();
  }
};

module.exports = SponsorService;
