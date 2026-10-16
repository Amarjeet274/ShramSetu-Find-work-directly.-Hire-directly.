const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const EmployerProfile = require('../models/EmployerProfile');
const otpService = require('../services/otpService');
const tokenService = require('../services/tokenService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const isProd = process.env.NODE_ENV === 'production';
const cookieBase = { httpOnly: true, secure: isProd, sameSite: 'strict' };

exports.sendOtp = catchAsync(async (req, res) => {
    const { phone } = req.body;
    if (!/^[6-9]\d{9}$/.test(phone)) throw new AppError('Enter a valid 10-digit mobile number', 400);
    await otpService.sendOtp(phone);
    res.json({ success: true, message: 'OTP sent' });
});

exports.verifyOtp = catchAsync(async (req, res) => {
    const { phone, otp, role, language } = req.body;
    if (!phone || !otp) throw new AppError('Phone and OTP required', 400);
    await otpService.verifyOtp(phone, otp);

    let user = await User.findOne({ phone });
    let isNewUser = false;

    if (!user) {
        if (!role) throw new AppError('Role is required for new accounts', 400);
        if (!['worker', 'employer'].includes(role)) throw new AppError('Invalid role', 400);
        user = await User.create({ phone, role, language: language || 'hi', isVerified: true });
        isNewUser = true;

        // Create stub profile
        if (role === 'worker') await WorkerProfile.create({ user: user._id, fullName: '' });
        if (role === 'employer') await EmployerProfile.create({ user: user._id, businessName: '' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = tokenService.signAccess(user._id);
    const refreshToken = tokenService.signRefresh(user._id);

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, accessToken, user: user.toSafeJSON(), isNewUser });
    res.cookie('shramsetu_at', accessToken, { ...cookieBase, maxAge: 15 * 60 * 1000 });

    res.cookie('shramsetu_rt', refreshToken, { ...cookieBase, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie('shramsetu_csrf', crypto.randomBytes(24).toString('hex'), {
        httpOnly: false, secure: isProd, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, user: user.toSafeJSON(), isNewUser });
});

exports.refresh = catchAsync(async (req, res) => {
    const token = req.cookies?.shramsetu_rt;
    if (!token) throw new AppError('No refresh token', 401);
    const decoded = tokenService.verifyRefresh(token);
    const user = await User.findById(decoded.id);
    if (!user) throw new AppError('User not found', 401);
    const at = tokenService.signAccess(user._id);
    res.cookie('shramsetu_at', at, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 });
    res.json({ success: true, user: user.toSafeJSON() });
});

exports.logout = catchAsync(async (req, res) => {
    res.clearCookie('shramsetu_at');
    res.clearCookie('shramsetu_rt');
    res.clearCookie('shramsetu_csrf');
    res.json({ success: true });
});

exports.me = catchAsync(async (req, res) => {
    let profile = null;
    if (req.user.role === 'worker') profile = await WorkerProfile.findOne({ user: req.user._id });
    if (req.user.role === 'employer') profile = await EmployerProfile.findOne({ user: req.user._id });
    res.json({ success: true, user: req.user.toSafeJSON(), profile });
});

exports.socketToken = catchAsync(async (req, res) => {
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '5m' });
  res.json({ success: true, token });
});


/**
 * DEV ONLY — bypass OTP for local testing.
 * Gated by NODE_ENV check in the route.
 */
exports.devLogin = catchAsync(async (req, res) => {
  const { role } = req.body;
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'Dev login disabled' });
  }
  if (!['worker', 'employer', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }

  /* Find or create a dev user */
  const phone = `9000000000${role === 'worker' ? '1' : role === 'employer' ? '2' : '3'}`;
  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ phone, role, language: 'en', isVerified: true, verificationStatus: 'verified' });
    if (role === 'worker') await WorkerProfile.create({ user: user._id, fullName: 'Dev Worker' });
    if (role === 'employer') await EmployerProfile.create({ user: user._id, businessName: 'Dev Employer' });
  }

  const accessToken = tokenService.signAccess(user._id);
  const refreshToken = tokenService.signRefresh(user._id);

  const isProd = process.env.NODE_ENV === 'production';
  const cookieBase = { httpOnly: true, secure: isProd, sameSite: 'strict' };

  res.cookie('shramsetu_at', accessToken, { ...cookieBase, maxAge: 15 * 60 * 1000 });
  res.cookie('shramsetu_rt', refreshToken, { ...cookieBase, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.cookie('shramsetu_csrf', require('crypto').randomBytes(24).toString('hex'), {
    httpOnly: false, secure: isProd, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ success: true, user: user.toSafeJSON() });
});