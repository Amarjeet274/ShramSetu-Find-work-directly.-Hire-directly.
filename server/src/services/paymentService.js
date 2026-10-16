const crypto = require('crypto');
const Razorpay = require('razorpay');

let rzp;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  rzp = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

exports.createOrder = async ({ amount, currency = 'INR', receipt, notes }) => {
  if (!rzp) {
    // Dev fallback
    return {
      id: `order_dev_${Date.now()}`,
      amount: amount * 100,
      currency,
      receipt,
      status: 'created',
      dev: true,
    };
  }
  return rzp.orders.create({
    amount: Math.round(amount * 100), // paise
    currency,
    receipt,
    notes,
  });
};

exports.verifyWebhookSignature = (rawBody, signature) => {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  return expected === signature;
};

exports.verifyCheckoutSignature = ({ orderId, paymentId, signature }) => {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return expected === signature;
};