const Review = require('../models/Review');
const WorkAssignment = require('../models/WorkAssignment');
const WorkerProfile = require('../models/WorkerProfile');
const EmployerProfile = require('../models/EmployerProfile');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.create = catchAsync(async (req, res) => {
  const { assignmentId, rating, feedback } = req.body;
  if (!rating || rating < 1 || rating > 5) throw new AppError('Rating must be 1-5', 400);

  const a = await WorkAssignment.findById(assignmentId);
  if (!a) throw new AppError('Assignment not found', 404);
  if (a.status !== 'COMPLETED') throw new AppError('Assignment not completed', 400);

  const isWorker = req.user.role === 'worker';
  const worker = await WorkerProfile.findById(a.worker);
  const employer = await EmployerProfile.findById(a.employer);

  if (isWorker && !worker.user.equals(req.user._id)) throw new AppError('Not authorized', 403);
  if (!isWorker && !employer.user.equals(req.user._id)) throw new AppError('Not authorized', 403);

  const data = {
    assignment: a._id,
    reviewer: req.user._id,
    reviewerRole: req.user.role,
    rating,
    feedback,
  };
  if (isWorker) {
    data.revieweeUser = employer.user;
    data.revieweeEmployer = employer._id;
  } else {
    data.revieweeUser = worker.user;
    data.revieweeWorker = worker._id;
  }

  const review = await Review.create(data);

  // Recompute rating
  if (isWorker) {
    const stats = await Review.aggregate([
      { $match: { revieweeEmployer: employer._id } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    employer.rating = Number((stats[0]?.avg || 0).toFixed(1));
    employer.totalReviews = stats[0]?.count || 0;
    await employer.save();
  } else {
    const stats = await Review.aggregate([
      { $match: { revieweeWorker: worker._id } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    worker.rating = Number((stats[0]?.avg || 0).toFixed(1));
    worker.totalReviews = stats[0]?.count || 0;
    await worker.save();
  }

  res.status(201).json({ success: true, review });
});

exports.forWorker = catchAsync(async (req, res) => {
  const reviews = await Review.find({ revieweeWorker: req.params.id })
    .populate('reviewer', 'role')
    .sort('-createdAt');
  res.json({ success: true, reviews });
});

exports.forEmployer = catchAsync(async (req, res) => {
  const reviews = await Review.find({ revieweeEmployer: req.params.id })
    .populate('reviewer', 'role')
    .sort('-createdAt');
  res.json({ success: true, reviews });
});