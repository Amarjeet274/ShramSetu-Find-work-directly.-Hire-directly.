const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.protect = catchAsync(async (req, res, next) => {
  let token = req.cookies?.shramsetu_at;
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next(new AppError('Please log in to continue', 401));

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-__v');
  if (!user) return next(new AppError('User no longer exists', 401));
  if (['suspended', 'banned'].includes(user.status)) return next(new AppError('Account suspended', 403));
  req.user = user;
  next();
});

// Role check — NEVER trust frontend role
exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return next(new AppError('You do not have permission to perform this action', 403));
  next();
};