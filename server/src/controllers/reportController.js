const Report = require('../models/Report');
const catchAsync = require('../utils/catchAsync');

exports.create = catchAsync(async (req, res) => {
  const { targetType, targetId, reason, details } = req.body;
  const report = await Report.create({
    reporter: req.user._id,
    reporterRole: req.user.role,
    targetType, targetId, reason, details,
  });
  res.status(201).json({ success: true, report });
});

exports.listMine = catchAsync(async (req, res) => {
  const reports = await Report.find({ reporter: req.user._id }).sort('-createdAt');
  res.json({ success: true, reports });
});