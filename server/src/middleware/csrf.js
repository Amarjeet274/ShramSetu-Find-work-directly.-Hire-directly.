const crypto = require('crypto');
const AppError = require('../utils/AppError');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

exports.issueCsrf = (req, res, next) => {
  if (!req.cookies?.shramsetu_csrf) {
    const token = crypto.randomBytes(24).toString('hex');
    res.cookie('shramsetu_csrf', token, {
      httpOnly: false,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
  next();
};

// exports.verifyCsrf = (req, res, next) => {
//   if (SAFE_METHODS.has(req.method)) return next();
//   // Skip webhook (signed separately)
//   if (req.originalUrl.startsWith('/api/payments/webhook')) return next();

//   const cookieToken = req.cookies?.shramsetu_csrf;
//   const headerToken = req.headers['x-csrf-token'];
//   if (!cookieToken || !headerToken || cookieToken !== headerToken) {
//     return next(new AppError('Invalid CSRF token', 403));
//   }
//   next();
// };

exports.verifyCsrf = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();
  if (req.originalUrl.startsWith('/api/payments/webhook')) return next();
  // Dev-only: bypass CSRF for the dev-login endpoint
  if (
    process.env.NODE_ENV !== 'production' &&
    req.originalUrl.startsWith('/api/auth/dev-login')
  ) {
    return next();
  }

  const cookieToken = req.cookies?.shramsetu_csrf;
  const headerToken = req.headers['x-csrf-token'];
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(new AppError('Invalid CSRF token', 403));
  }
  next();
};