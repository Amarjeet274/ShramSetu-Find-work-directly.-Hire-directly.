const storageService = require('../services/storageService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.uploadSingle = catchAsync(async (req, res) => {
  if (!req.file) throw new AppError('No file provided', 400);
  const result = await storageService.putFile(req.file);
  res.status(201).json({ success: true, file: result });
});

exports.uploadMultiple = catchAsync(async (req, res) => {
  if (!req.files?.length) throw new AppError('No files provided', 400);
  const results = await Promise.all(req.files.map((f) => storageService.putFile(f)));
  res.status(201).json({ success: true, files: results });
});