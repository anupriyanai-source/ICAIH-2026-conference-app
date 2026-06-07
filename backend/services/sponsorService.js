const SponsorModel = require('../models/sponsorModel');

function sanitize(val) {
  return String(val || '').trim();
}
function isEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val || '').trim());
}

const SponsorService = {
  async submitInquiry(body) {
    const companyName = sanitize(body.companyName);
    const contactPerson = sanitize(body.contactPerson);
    const email = sanitize(body.email).toLowerCase();
    const phone = sanitize(body.phone);
    const sponsorTier = sanitize(body.sponsorTier);
    const message = sanitize(body.message);

    if (!companyName || !contactPerson || !email || !sponsorTier) {
      throw { status: 400, message: 'Company name, contact person, email, and sponsorship tier are required.' };
    }
    if (!isEmail(email)) {
      throw { status: 400, message: 'Please enter a valid email address.' };
    }

    const { refId } = await SponsorModel.create({ companyName, contactPerson, email, phone, sponsorTier, message });
    return { message: 'Sponsor inquiry submitted successfully.', id: refId };
  },

  async getAllInquiries() {
    return SponsorModel.findAll();
  }
};

module.exports = SponsorService;
