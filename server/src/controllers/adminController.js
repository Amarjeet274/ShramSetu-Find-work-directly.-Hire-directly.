const User = require('../models/User');
const Job = require('../models/Job');
const Payment = require('../models/Payment');
const Dispute = require('../models/Dispute');
const Report = require('../models/Report');
const SupportTicket = require('../models/SupportTicket');
const AuditLog = require('../models/AuditLog');
const Verification = require('../models/Verification');
const { notify } = require('../services/notificationService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/* =========================================================
 * USERS
 * ======================================================= */

exports.listUsers = catchAsync(async (req, res) => {
  const { role, status, page = 1, limit = 20 } = req.query;
  const q = {};
  if (role) q.role = role;
  if (status) q.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(q).sort('-createdAt').skip(skip).limit(Number(limit)),
    User.countDocuments(q),
  ]);

  res.json({ success: true, users, total, page: Number(page) });
});

exports.updateUserStatus = catchAsync(async (req, res) => {
  const { status, reason } = req.body;
  if (!['active', 'suspended', 'banned'].includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!user) throw new AppError('User not found', 404);

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'admin',
    action: 'USER_STATUS_UPDATE',
    targetType: 'User',
    targetId: user._id,
    reason,
    metadata: { status },
    ip: req.ip,
  });

  res.json({ success: true, user });
});

/* =========================================================
 * REPORTS
 * ======================================================= */

exports.listReports = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 30 } = req.query;
  const q = {};
  if (status) q.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [reports, total] = await Promise.all([
    Report.find(q)
      .populate('reporter', 'phone role')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit)),
    Report.countDocuments(q),
  ]);

  res.json({ success: true, reports, total, page: Number(page) });
});

exports.updateReport = catchAsync(async (req, res) => {
  const { status, resolution } = req.body;
  if (!['OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED'].includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status, resolution },
    { new: true }
  );
  if (!report) throw new AppError('Report not found', 404);

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'admin',
    action: 'REPORT_UPDATE',
    targetType: 'Report',
    targetId: report._id,
    metadata: { status },
    ip: req.ip,
  });

  res.json({ success: true, report });
});

/* =========================================================
 * ANALYTICS
 * ======================================================= */

exports.analytics = catchAsync(async (req, res) => {
  const [
    totalUsers,
    workers,
    employers,
    activeJobs,
    completedJobs,
    payments,
    openReports,
    openTickets,
    openDisputes,
    pendingVerifications,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'worker' }),
    User.countDocuments({ role: 'employer' }),
    Job.countDocuments({
      status: { $in: ['POSTED', 'APPLIED', 'SHORTLISTED', 'HIRED', 'IN_PROGRESS'] },
    }),
    Job.countDocuments({ status: 'PAID' }),
    Payment.aggregate([
      { $match: { status: 'SUCCESS' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Report.countDocuments({ status: 'OPEN' }),
    SupportTicket.countDocuments({ status: { $in: ['OPEN', 'IN_PROGRESS'] } }),
    Dispute.countDocuments({ status: { $in: ['OPEN', 'INVESTIGATING'] } }),
    Verification.countDocuments({ status: 'PENDING' }),
  ]);

  res.json({
    success: true,
    analytics: {
      totalUsers,
      workers,
      employers,
      activeJobs,
      completedJobs,
      transactions: payments[0] || { total: 0, count: 0 },
      openReports,
      openTickets,
      openDisputes,
      pendingVerifications,
    },
  });
});

/* =========================================================
 * AUDIT LOGS
 * ======================================================= */

exports.listAuditLogs = catchAsync(async (req, res) => {
  const { page = 1, limit = 100 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const [logs, total] = await Promise.all([
    AuditLog.find()
      .populate('actor', 'phone role')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit)),
    AuditLog.countDocuments(),
  ]);

  res.json({ success: true, logs, total, page: Number(page) });
});

/* =========================================================
 * VERIFICATIONS
 * ======================================================= */

exports.listVerifications = catchAsync(async (req, res) => {
  const list = await Verification.find({ status: 'PENDING' })
    .populate('user', 'phone role verificationStatus')
    .sort('-createdAt');
  res.json({ success: true, verifications: list });
});

exports.reviewVerification = catchAsync(async (req, res) => {
  const { status, notes } = req.body;
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  const v = await Verification.findByIdAndUpdate(
    req.params.id,
    { status, notes, reviewedBy: req.user._id, reviewedAt: new Date() },
    { new: true }
  );
  if (!v) throw new AppError('Verification not found', 404);

  // Reflect on user + profile
  if (status === 'APPROVED') {
    await User.findByIdAndUpdate(v.user, { verificationStatus: 'verified' });
    if (v.type === 'identity') {
      const WorkerProfile = require('../models/WorkerProfile');
      await WorkerProfile.updateOne(
        { user: v.user },
        { 'verification.idVerified': true }
      );
    }
    if (v.type === 'business') {
      const EmployerProfile = require('../models/EmployerProfile');
      await EmployerProfile.updateOne(
        { user: v.user },
        { 'verification.businessVerified': true }
      );
    }
  } else {
    await User.findByIdAndUpdate(v.user, { verificationStatus: 'rejected' });
  }

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'admin',
    action: 'VERIFICATION_REVIEW',
    targetType: 'Verification',
    targetId: v._id,
    metadata: { status },
    ip: req.ip,
  });

  // Notify user (best-effort)
  try {
    await notify(
      v.user,
      'VERIFICATION_STATUS',
      `Verification ${status}`,
      status === 'APPROVED'
        ? 'Your verification was approved. You now have a verified badge.'
        : 'Your verification was rejected. Please resubmit with clear documents.',
      { verificationId: v._id, status }
    );
  } catch (e) {
    console.warn('[reviewVerification] notify failed:', e.message);
  }

  res.json({ success: true, verification: v });
});

/* =========================================================
 * JOBS MODERATION
 * ======================================================= */

exports.listJobs = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 30 } = req.query;
  const q = {};
  if (status) q.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [jobs, total] = await Promise.all([
    Job.find(q)
      .populate('employer', 'businessName rating verification.businessVerified')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit)),
    Job.countDocuments(q),
  ]);

  res.json({ success: true, jobs, total, page: Number(page) });
});

exports.cancelJob = catchAsync(async (req, res) => {
  const { reason } = req.body;
  if (!reason) throw new AppError('Reason required', 400);

  const job = await Job.findByIdAndUpdate(
    req.params.id,
    { status: 'CANCELLED' },
    { new: true }
  );
  if (!job) throw new AppError('Job not found', 404);

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'admin',
    action: 'JOB_CANCEL',
    targetType: 'Job',
    targetId: job._id,
    reason,
    ip: req.ip,
  });

  res.json({ success: true, job });
});

/* =========================================================
 * PAYMENTS
 * ======================================================= */

exports.listPayments = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 30 } = req.query;
  const q = {};
  if (status) q.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [payments, total, sum] = await Promise.all([
    Payment.find(q)
      .populate({ path: 'worker', select: 'fullName user' })
      .populate({ path: 'employer', select: 'businessName user' })
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit)),
    Payment.countDocuments(q),
    Payment.aggregate([
      { $match: { status: 'SUCCESS' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  res.json({
    success: true,
    payments,
    total,
    page: Number(page),
    totalVolume: sum[0]?.total || 0,
  });
});

/* =========================================================
 * DISPUTES
 * ======================================================= */

exports.listDisputes = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 30 } = req.query;
  const q = {};
  if (status) q.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [disputes, total] = await Promise.all([
    Dispute.find(q)
      .populate('raisedBy', 'phone role')
      .populate({
        path: 'assignment',
        populate: { path: 'job worker employer' },
      })
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit)),
    Dispute.countDocuments(q),
  ]);

  res.json({ success: true, disputes, total, page: Number(page) });
});

exports.updateDispute = catchAsync(async (req, res) => {
  const { status, resolution } = req.body;
  if (!['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'].includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  const updates = { status };
  if (resolution) updates.resolution = resolution;
  if (status === 'RESOLVED' || status === 'CLOSED') {
    updates.resolvedBy = req.user._id;
  }

  const d = await Dispute.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!d) throw new AppError('Dispute not found', 404);

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'admin',
    action: 'DISPUTE_UPDATE',
    targetType: 'Dispute',
    targetId: d._id,
    metadata: { status },
    ip: req.ip,
  });

  res.json({ success: true, dispute: d });
});