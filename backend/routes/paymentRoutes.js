const express = require('express');
const QRCode = require('qrcode');

const router = express.Router();

const UPI_ID = process.env.UPI_ID || process.env.PAYMENT_UPI_ID || 'MYTHREALITYTECHNOLOGIESPRIV@iob';
const PAYEE_NAME = process.env.UPI_PAYEE_NAME || process.env.PAYMENT_PAYEE_NAME || 'MYTH REALITY TECHNOLOGIES PRIVATE LIMITED';
const UPI_MERCHANT_CODE = process.env.UPI_MERCHANT_CODE || '8011';
const UPI_ORG_ID = process.env.UPI_ORG_ID || '159020';
const UPI_MODE = process.env.UPI_MODE || '00';
const UPI_PURPOSE_CODE = process.env.UPI_PURPOSE_CODE || '00';
const UPI_VERSION = process.env.UPI_VERSION || '01';

function buildUpiUrl({ amount, purpose = 'ICAIH 2026 Payment', reference = '' }) {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    const error = new Error('A valid payment amount is required.');
    error.status = 400;
    throw error;
  }

  const paymentPurpose = String(purpose || 'ICAIH 2026 Payment').slice(0, 80);
  // Preserve the official IOB/BHIM merchant parameters from the supplied QR
  // while inserting the dynamic amount and conference payment note.
  const query = [
    `ver=${encodeURIComponent(UPI_VERSION)}`,
    `pa=${encodeURIComponent(UPI_ID)}`,
    `pn=${encodeURIComponent(PAYEE_NAME)}`,
    `tn=${encodeURIComponent(paymentPurpose)}`,
    `am=${encodeURIComponent(numericAmount.toFixed(2))}`,
    'cu=INR',
    `mode=${encodeURIComponent(UPI_MODE)}`,
    `purpose=${encodeURIComponent(UPI_PURPOSE_CODE)}`,
    `orgid=${encodeURIComponent(UPI_ORG_ID)}`,
    'sign=',
    `mc=${encodeURIComponent(UPI_MERCHANT_CODE)}`
  ].join('&');

  return `upi://pay?${query}`;
}

router.get('/qr', async (req, res, next) => {
  try {
    const upiUrl = buildUpiUrl({
      amount: req.query.amount,
      purpose: req.query.purpose,
      reference: req.query.reference
    });

    const png = await QRCode.toBuffer(upiUrl, {
      type: 'png',
      width: 520,
      margin: 2,
      errorCorrectionLevel: 'M'
    });

    res.set({
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'X-UPI-Payment-URL': encodeURIComponent(upiUrl)
    });
    return res.send(png);
  } catch (error) {
    return next(error);
  }
});

router.get('/details', (req, res, next) => {
  try {
    return res.json({
      ok: true,
      upiId: UPI_ID,
      payeeName: PAYEE_NAME,
      merchantCode: UPI_MERCHANT_CODE,
      organizationId: UPI_ORG_ID,
      upiUrl: buildUpiUrl({
        amount: req.query.amount,
        purpose: req.query.purpose,
        reference: req.query.reference
      })
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
