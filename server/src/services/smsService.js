const axios = require('axios');

/**
 * Pluggable SMS provider.
 * Configure via SMS_PROVIDER env: 'msg91' | 'twilio' | 'console'
 */
const provider = process.env.SMS_PROVIDER || 'console';

async function sendViaMSG91(phone, otp) {
  const url = 'https://control.msg91.com/api/v5/otp';
  
  const params = {
    template_id: process.env.MSG91_TEMPLATE_ID,
    mobile: `91${phone}`, // MSG91 expects country code + number
    authkey: process.env.MSG91_AUTH_KEY,
    otp: otp, // The generated OTP is passed here
  };

  try {
    const { data } = await axios.post(url, null, { params, timeout: 8000 });
    if (data.type === 'error') {
      throw new Error(`MSG91: ${data.message}`);
    }
    console.log(`[SMS:msg91] OTP sent to +91${phone}`);
    return data;
  } catch (error) {
    console.error('[SMS:msg91] Failed to send OTP:', error.response?.data || error.message);
    throw new Error('Failed to send OTP via MSG91');
  }
}

async function sendViaTwilio(phone, otp) {
  // ... your Twilio implementation
}

exports.sendOtp = async (phone, otp) => {
  if (provider === 'msg91') return sendViaMSG91(phone, otp);
  if (provider === 'twilio') return sendViaTwilio(phone, otp);
  // Dev fallback
  console.log(`[SMS:console] to +91${phone} => ${otp}`);
  return { dev: true };
};