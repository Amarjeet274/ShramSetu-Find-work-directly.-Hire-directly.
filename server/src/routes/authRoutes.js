// const router = require('express').Router();
// const c = require('../controllers/authController');
// const { protect } = require('../middleware/auth');
// const validate = require('../validators/validate');
// const { sendOtpRules, verifyOtpRules } = require('../validators/authValidators');

// router.post('/send-otp', sendOtpRules, validate, c.sendOtp);
// router.post('/verify-otp', verifyOtpRules, validate, c.verifyOtp);
// router.post('/refresh', c.refresh);
// router.post('/logout', c.logout);
// router.get('/me', protect, c.me);
// router.get('/socket-token', protect, c.socketToken);

// module.exports = router;

// testing rounter hai ye baad me hatana hai
const router = require('express').Router();
const crypto = require('crypto');
const c = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../validators/validate');
const { sendOtpRules, verifyOtpRules } = require('../validators/authValidators');
const User = require('../models/User');
const tokenService = require('../services/tokenService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/* ───── Public OTP routes ───── */
router.post('/send-otp', sendOtpRules, validate, c.sendOtp);
router.post('/verify-otp', verifyOtpRules, validate, c.verifyOtp);
router.post('/refresh', c.refresh);
router.post('/logout', c.logout);
router.get('/me', protect, c.me);

/* ───── DEV-ONLY quick login (registered FIRST at top priority) ───── */
if (process.env.NODE_ENV !== 'production') {
  router.post('/dev-login', catchAsync(async (req, res) => {
    const { role } = req.body || {};
    if (!['worker', 'employer', 'admin'].includes(role)) {
      throw new AppError('Invalid role. Use worker | employer | admin.', 400);
    }

    // ⬇️ Loosened query: match role first, fix status if wrong
    let user = await User.findOne({ role, status: 'active' });

    if (!user) {
      // Fall back: find ANY user with this role
      user = await User.findOne({ role });
      if (!user) {
        throw new AppError(`No ${role} exists. Run: npm run seed:test`, 404);
      }
      // Repair the status so the login works
      user.status = 'active';
      user.isVerified = true;
      user.verificationStatus = 'verified';
      await user.save();
      console.log(`🔧 Repaired ${role} ${user.phone}: status/verification forced to active`);
    }

    user.lastLoginAt = new Date();
    await user.save();
    const accessToken = tokenService.signAccess(user._id);
    const refreshToken = tokenService.signRefresh(user._id);
    const cookieBase = { httpOnly: true, secure: false, sameSite: 'lax' };

    res.cookie('shramsetu_at', accessToken, { ...cookieBase, maxAge: 15 * 60 * 1000 });
    res.cookie('shramsetu_rt', refreshToken, { ...cookieBase, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie('shramsetu_csrf', crypto.randomBytes(24).toString('hex'), {
      httpOnly: false, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, user: user.toSafeJSON(), devLogin: true });
  }));

  console.log('⚠️  DEV LOGIN ENABLED at POST /api/auth/dev-login');
}

/* ───── NO wildcard 404 handler here — app.js handles that globally ───── */

module.exports = router;