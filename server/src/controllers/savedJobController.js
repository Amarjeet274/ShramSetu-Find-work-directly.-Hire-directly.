const SavedJob = require('../models/SavedJob');
const WorkerProfile = require('../models/WorkerProfile');
const catchAsync = require('../utils/catchAsync');

exports.toggle = catchAsync(async (req, res) => {
  const worker = await WorkerProfile.findOne({ user: req.user._id });
  const existing = await SavedJob.findOne({ worker: worker._id, job: req.params.jobId });
  if (existing) {
    await SavedJob.deleteOne({ _id: existing._id });
    return res.json({ success: true, saved: false });
  }
  await SavedJob.create({ worker: worker._id, job: req.params.jobId });
  res.json({ success: true, saved: true });
});

exports.list = catchAsync(async (req, res) => {
  const worker = await WorkerProfile.findOne({ user: req.user._id });
  const items = await SavedJob.find({ worker: worker._id })
    .populate({ path: 'job', populate: { path: 'employer', select: 'businessName rating' } })
    .sort('-createdAt');
  res.json({ success: true, savedJobs: items.map((s) => s.job).filter(Boolean) });
});