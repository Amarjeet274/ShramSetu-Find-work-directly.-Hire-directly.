const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const EmployerProfile = require('../models/EmployerProfile');
const WorkerProfile = require('../models/WorkerProfile');
const { computeMatchScore } = require('../services/matchingService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/* Helpers */

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/*  POST /api/jobs — Employer creates a job */
exports.createJob = catchAsync(async (req, res) => {
  const employerProfile = await EmployerProfile.findOne({ user: req.user._id });
  if (!employerProfile) throw new AppError('Complete your employer profile first', 400);

  const {
    title,
    category,
    description,
    requiredSkills,
    lng,
    lat,
    address,
    travelRadiusKm,
    schedule,
    payRate,
    payType,
    workersNeeded,
    minExperienceYears,
  } = req.body;

  if (!title || !category || !description) throw new AppError('Missing required fields', 400);
  if (lng === undefined || lat === undefined) throw new AppError('Location required', 400);
  if (!payRate) throw new AppError('Pay rate required', 400);

  const job = await Job.create({
    employer: employerProfile._id,
    title: title.trim(),
    category,
    description: description.trim(),
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
    location: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
    address: address || '',
    travelRadiusKm: travelRadiusKm || 5,
    schedule: schedule || { shift: 'flexible' },
    payRate: Number(payRate),
    payType: payType || 'day',
    workersNeeded: workersNeeded || 1,
    minExperienceYears: minExperienceYears || 0,
    status: 'POSTED',
  });

  employerProfile.jobsPosted = (employerProfile.jobsPosted || 0) + 1;
  await employerProfile.save();

  res.status(201).json({ success: true, job });
});

/* =========================================================
 * GET /api/jobs — Public/authenticated listing
 * Supports: ?lng=&lat=&radius=&category=&q=&page=&limit=
 * ======================================================= */
exports.listJobs = catchAsync(async (req, res) => {
  const {
    lng,
    lat,
    radius = 10000,
    category,
    q,
    page = 1,
    limit = 20,
  } = req.query;

  const query = { status: 'POSTED' };
  if (category) query.category = category;
  if (q) {
    // Simple regex search (safe — not using $where)
    const safe = String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { title: { $regex: safe, $options: 'i' } },
      { description: { $regex: safe, $options: 'i' } },
      { category: { $regex: safe, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const lim = Math.min(Number(limit), 50);

  let jobsQuery;
  if (lng && lat) {
    jobsQuery = Job.find({
      ...query,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius, 10),
        },
      },
    })
      .skip(skip)
      .limit(lim)
      .populate('employer', 'businessName rating verification.businessVerified');
  } else {
    jobsQuery = Job.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(lim)
      .populate('employer', 'businessName rating verification.businessVerified');
  }

  const [jobs, total] = await Promise.all([
    jobsQuery,
    Job.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: jobs.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / lim),
    jobs,
  });
});

/* =========================================================
 * GET /api/jobs/matched — Worker's ranked nearby jobs
 * ======================================================= */
exports.getMatchedJobsForWorker = catchAsync(async (req, res) => {
  const worker = await WorkerProfile.findOne({ user: req.user._id });
  if (!worker) throw new AppError('Worker profile missing', 400);
  if (!worker.location?.coordinates?.length) {
    return res.json({ success: true, matches: [], note: 'Set your location to see matched jobs' });
  }

  const [lng, lat] = worker.location.coordinates;

  const jobs = await Job.find({
    status: 'POSTED',
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: 30000, // 30 km
      },
    },
  })
    .limit(50)
    .populate('employer', 'businessName rating verification.businessVerified');

  const workerObj = worker.toObject();

  const scored = jobs
    .map((j) => {
      const [jLng, jLat] = j.location.coordinates;
      const distanceKm = haversine(lat, lng, jLat, jLng);
      const { score, breakdown } = computeMatchScore(j, {
        ...workerObj,
        distanceKm,
      });
      return { job: j, matchScore: score, breakdown, distanceKm };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  res.json({ success: true, count: scored.length, matches: scored });
});

/* =========================================================
 * GET /api/jobs/:id — Job detail
 * ======================================================= */
exports.getJob = catchAsync(async (req, res) => {
  const job = await Job.findById(req.params.id).populate(
    'employer',
    'businessName rating totalReviews jobsPosted workersHired verification.businessVerified address'
  );
  if (!job) throw new AppError('Job not found', 404);
  res.json({ success: true, job });
});

/* =========================================================
 * PATCH /api/jobs/:id — Employer updates own job
 * ======================================================= */
exports.updateJob = catchAsync(async (req, res) => {
  const employerProfile = await EmployerProfile.findOne({ user: req.user._id });
  if (!employerProfile) throw new AppError('Employer profile missing', 400);

  const job = await Job.findOne({
    _id: req.params.id,
    employer: employerProfile._id,
  });
  if (!job) throw new AppError('Job not found or not yours', 404);

  if (['PAID', 'CANCELLED'].includes(job.status)) {
    throw new AppError('Cannot edit a completed or cancelled job', 400);
  }

  const allowed = [
    'title',
    'category',
    'description',
    'requiredSkills',
    'travelRadiusKm',
    'schedule',
    'payRate',
    'payType',
    'workersNeeded',
    'minExperienceYears',
    'address',
    'status',
  ];
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) job[k] = req.body[k];
  });

  // Handle location separately
  if (req.body.lng !== undefined && req.body.lat !== undefined) {
    job.location = {
      type: 'Point',
      coordinates: [Number(req.body.lng), Number(req.body.lat)],
    };
  }

  await job.save();
  res.json({ success: true, job });
});

/* =========================================================
 * DELETE /api/jobs/:id — Employer cancels own job
 * ======================================================= */
exports.deleteJob = catchAsync(async (req, res) => {
  const employerProfile = await EmployerProfile.findOne({ user: req.user._id });
  if (!employerProfile) throw new AppError('Employer profile missing', 400);

  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, employer: employerProfile._id },
    { status: 'CANCELLED' },
    { new: true }
  );
  if (!job) throw new AppError('Job not found or not yours', 404);

  // Notify any pending applicants (best-effort)
  try {
    const pendingApps = await JobApplication.find({
      job: job._id,
      status: { $in: ['APPLIED', 'VIEWED', 'SHORTLISTED'] },
    }).populate('worker');
    const { notify } = require('../services/notificationService');
    for (const app of pendingApps) {
      if (app.worker?.user) {
        await notify(
          app.worker.user,
          'JOB_CANCELLED',
          'Job cancelled',
          `The job "${job.title}" was cancelled by the employer.`,
          { jobId: job._id }
        );
      }
    }
  } catch (e) {
    console.warn('[deleteJob] notification failed:', e.message);
  }

  res.json({ success: true, message: 'Job cancelled', job });
});