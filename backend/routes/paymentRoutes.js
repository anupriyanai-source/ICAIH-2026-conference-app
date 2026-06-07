const express = require('express');
const QRCode = require('qrcode');
const { createRazorpayOrder, verifyPaidPayment } = require('../services/paymentService');

const router = express.Router();

router.get('/payment-qr', async (req, res) => {
  try {
    const amount = Number(req.query.amount || 0);
    if (!amount || amount <= 0) {
      return res.status(400).json({ ok: false, message: 'Valid amount is required.' });
    }

    const upiId = process.env.UPI_ID || '7004245277@indianbk';
    const payeeName = encodeURIComponent(process.env.UPI_PAYEE_NAME || 'gcare health care services private limited');
    const note = encodeURIComponent(`ICAIH 2026 ${req.query.role || 'Registration'}`);
    const upiUrl = `upi://pay?pa=${upiId}&pn=${payeeName}&tn=${note}&am=${amount.toFixed(2)}&cu=INR`;

    const png = await QRCode.toBuffer(upiUrl, {
      type: 'png',
      width: 360,
      margin: 2,
      errorCorrectionLevel: 'M'
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    return res.send(png);
  } catch (error) {
    console.error('Payment QR generation error:', error.message);
    return res.status(500).json({ ok: false, message: 'Could not generate payment QR.' });
  }
});

router.post('/payment/create-order', async (req, res) => {
  try {
    const order = await createRazorpayOrder(req.body);
    return res.json({ ok: true, ...order });
  } catch (error) {
    console.error('Create payment order error:', error);
    return res.status(error.status || 500).json({ ok: false, message: error.message || 'Unable to create payment order.' });
  }
});

router.post('/payment/verify', async (req, res) => {
  try {
    const result = await verifyPaidPayment({
      orderId: req.body.razorpay_order_id || req.body.razorpayOrderId,
      paymentId: req.body.razorpay_payment_id || req.body.razorpayPaymentId,
      signature: req.body.razorpay_signature || req.body.razorpaySignature,
      expectedAmount: req.body.expectedAmount
    });

    return res.json({ ok: true, message: 'Payment verified successfully.', ...result });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(error.status || 500).json({ ok: false, message: error.message || 'Payment verification failed.' });
  }
});

module.exports = router;
