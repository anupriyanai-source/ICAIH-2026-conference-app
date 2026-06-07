const crypto = require('crypto');
const https = require('https');

function clean(value) {
  return String(value || '').trim();
}

function getRazorpayConfig() {
  const keyId = clean(process.env.RAZORPAY_KEY_ID);
  const keySecret = clean(process.env.RAZORPAY_KEY_SECRET);

  if (!keyId || !keySecret) {
    throw { status: 500, message: 'Razorpay keys are missing. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env, then restart the backend.' };
  }

  return { keyId, keySecret };
}

function toPaise(amount) {
  const value = Number(amount || 0);
  if (!Number.isFinite(value) || value <= 0) {
    throw { status: 400, message: 'Valid payment amount is required.' };
  }
  return Math.round(value * 100);
}

function razorpayRequest(method, apiPath, body) {
  const { keyId, keySecret } = getRazorpayConfig();
  const payload = body ? JSON.stringify(body) : '';

  const options = {
    hostname: 'api.razorpay.com',
    path: apiPath,
    method,
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64'),
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    },
    timeout: 30000
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed = {};
        try { parsed = data ? JSON.parse(data) : {}; } catch (_) { parsed = { raw: data }; }

        if (res.statusCode >= 200 && res.statusCode < 300) {
          return resolve(parsed);
        }

        const description = parsed?.error?.description || parsed?.message || `Razorpay API failed with status ${res.statusCode}`;
        return reject({ status: res.statusCode, message: description, details: parsed });
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error('Razorpay payment request timed out.'));
    });

    req.on('error', (error) => {
      reject({ status: 500, message: error.message || 'Razorpay payment request failed.' });
    });

    if (payload) req.write(payload);
    req.end();
  });
}

async function createRazorpayOrder({ amount, role, name, email, phone, studentCount, bulkOffer }) {
  const { keyId } = getRazorpayConfig();
  const amountPaise = toPaise(amount);
  const receipt = `ICAIH-${Date.now()}`.slice(0, 40);

  const order = await razorpayRequest('POST', '/v1/orders', {
    amount: amountPaise,
    currency: 'INR',
    receipt,
    payment_capture: 1,
    notes: {
      conference: 'ICAIH 2026',
      role: clean(role),
      name: clean(name),
      email: clean(email),
      phone: clean(phone),
      studentCount: clean(studentCount),
      bulkOffer: clean(bulkOffer)
    }
  });

  return {
    keyId,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    receipt: order.receipt
  };
}

function verifyRazorpaySignature(orderId, paymentId, signature) {
  const { keySecret } = getRazorpayConfig();

  if (!orderId || !paymentId || !signature) {
    throw { status: 400, message: 'Payment verification details are missing.' };
  }

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (expectedSignature !== signature) {
    throw { status: 400, message: 'Payment verification failed. Invalid payment signature.' };
  }

  return true;
}

async function fetchRazorpayOrder(orderId) {
  if (!orderId) {
    throw { status: 400, message: 'Razorpay order ID is missing.' };
  }
  return razorpayRequest('GET', `/v1/orders/${encodeURIComponent(orderId)}`);
}

async function verifyPaidPayment({ orderId, paymentId, signature, expectedAmount }) {
  verifyRazorpaySignature(orderId, paymentId, signature);

  const order = await fetchRazorpayOrder(orderId);
  const expectedPaise = toPaise(expectedAmount);

  if (Number(order.amount) !== expectedPaise) {
    throw { status: 400, message: `Payment amount mismatch. Expected ₹${expectedAmount}.` };
  }

  if (Number(order.amount_paid || 0) < expectedPaise || order.status !== 'paid') {
    throw { status: 400, message: 'Payment is not completed yet. Please complete payment before submitting registration.' };
  }

  return {
    verified: true,
    orderId,
    paymentId,
    amount: expectedAmount,
    status: order.status
  };
}

module.exports = {
  createRazorpayOrder,
  verifyPaidPayment,
  verifyRazorpaySignature
};
