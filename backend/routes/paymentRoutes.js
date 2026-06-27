const express = require('express');
const QRCode = require('qrcode');

const router = express.Router();

const UPI_ID = process.env.UPI_ID || process.env.PAYMENT_UPI_ID || 'MYTHREALITYTECHNOLOGIESPRIV@iob';
const PAYEE_NAME = process.env.UPI_PAYEE_NAME || process.env.PAYMENT_PAYEE_NAME || 'MYTH REALITY TECHNOLOGIES PRIVATE LIMITED';

function buildUpiUrl({ amount, purpose = 'ICAIH 2026 Payment', reference = '' }) {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    const error = new Error('A valid payment amount is required.');
    error.status = 400;
    throw error;
  }

  const transactionReference = String(reference || `ICAIH${Date.now()}`)
    .replace(/[^A-Za-z0-9_-]/g, '')
    .slice(0, 35);

  const paymentPurpose = String(purpose || 'ICAIH 2026 Payment').slice(0, 80);
  const query = [
    `pa=${encodeURIComponent(UPI_ID)}`,
    `pn=${encodeURIComponent(PAYEE_NAME)}`,
    `am=${encodeURIComponent(numericAmount.toFixed(2))}`,
    'cu=INR',
    `tn=${encodeURIComponent(paymentPurpose)}`,
    `tr=${encodeURIComponent(transactionReference)}`
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
