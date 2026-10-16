const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');

exports.list = catchAsync(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(100);
  res.json({ success: true, notifications });
});

exports.markRead = catchAsync(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, _id: { $in: req.body.ids } }, { read: true });
  res.json({ success: true });
});