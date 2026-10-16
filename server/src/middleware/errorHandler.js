const AppError = require('../utils/AppError');

module.exports = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('[API error]', err.stack || err);
  }

  let error = { ...err, message: err.message };
  if (err.name === 'CastError') error = new AppError('Resource not found', 404);
  if (err.code === 11000) error = new AppError('Duplicate field value', 400);
  if (err.name === 'ValidationError') {
    const msg = Object.values(err.errors).map(e => e.message).join(', ');
    error = new AppError(msg, 400);
  }
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.isOperational ? error.message : 'Something went wrong. Please try again.',
  });
};