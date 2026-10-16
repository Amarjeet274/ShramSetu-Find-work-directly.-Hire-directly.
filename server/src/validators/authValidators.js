const { body } = require('express-validator');

exports.sendOtpRules = [
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit mobile number'),
];

exports.verifyOtpRules = [
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Invalid phone'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Invalid OTP'),
  body('role').optional().isIn(['worker', 'employer']).withMessage('Invalid role'),
  body('language').optional().isIn(['en', 'hi', 'bho']),
];