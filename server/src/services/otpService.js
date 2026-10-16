const crypto = require('crypto');
const OTPSession = require('../models/OTPSession');
const smsService = require('./smsService');
const AppError = require('../utils/AppError');

const hashOTP = (otp) => crypto.createHash('sha256').update(otp + process.env.JWT_SECRET).digest('hex');

exports.sendOtp = async (phone) => {
  const existing = await OTPSession.findOne({ phone });
  if (existing && Date.now() - existing.createdAt.getTime() < process.env.OTP_RESEND_COOLDOWN_SECONDS * 1000) {
    throw new AppError('Please wait before requesting another OTP', 429);
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + process.env.OTP_EXPIRY_MINUTES * 60000);

  await OTPSession.findOneAndUpdate(
    { phone },
    { otpHash: hashOTP(otp), attempts: 0, expiresAt, createdAt: new Date() },
    { upsert: true, new: true }
  );

  await smsService.sendOtp(phone, otp);
  return { sent: true };
};

exports.verifyOtp = async (phone, otp) => {
  const session = await OTPSession.findOne({ phone });
  if (!session) throw new AppError('No OTP session. Request a new one.', 400);
  if (session.expiresAt < new Date()) throw new AppError('OTP expired', 400);
  if (session.attempts >= process.env.OTP_MAX_ATTEMPTS) {
    throw new AppError('Too many failed attempts. Request a new OTP.', 429);
  }
  if (session.otpHash !== hashOTP(otp)) {
    session.attempts += 1;
    await session.save();
    throw new AppError('Incorrect OTP', 400);
  }
  await OTPSession.deleteOne({ phone });
  return true;
};