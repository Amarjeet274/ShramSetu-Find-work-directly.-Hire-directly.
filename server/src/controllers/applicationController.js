const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const EmployerProfile = require('../models/EmployerProfile');
const WorkerProfile = require('../models/WorkerProfile');
const WorkAssignment = require('../models/WorkAssignment');
const { computeMatchScore } = require('../services/matchingService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { emitToUser } = require('../sockets');
const { notify } = require('../services/notificationService');


exports.apply = catchAsync(async (req, res) => {
    const worker = await WorkerProfile.findOne({ user: req.user._id });
    const job = await Job.findById(req.params.id);
    if (!job) throw new AppError('Job not found', 404);
    if (job.status !== 'POSTED') throw new AppError('This job is no longer accepting applications', 400);

    const existing = await JobApplication.findOne({ job: job._id, worker: worker._id });
    if (existing) throw new AppError('Already applied', 400);

    const [jLng, jLat] = job.location.coordinates;
    const [wLng, wLat] = worker.location?.coordinates || [0, 0];
    const distanceKm = wLng && wLat ? haversine(wLat, wLng, jLat, jLng) : 0;

    const { score } = computeMatchScore(job, { ...worker.toObject(), distanceKm });

    const application = await JobApplication.create({
        job: job._id,
        worker: worker._id,
        matchScore: score,
        coverNote: req.body.coverNote,
    });

    // Notify employer
    const employerProfile = await EmployerProfile.findById(job.employer);
    emitToUser(employerProfile.user, 'application:new', { jobId: job._id, applicationId: application._id });

    res.status(201).json({ success: true, application });

    // Inside apply(), after creating application & employerProfile:
    await notify(
        employerProfile.user,
        'APPLICATION_NEW',
        'New application received',
        `${worker.fullName || 'A worker'} applied to "${job.title}"`,
        { jobId: job._id, applicationId: application._id }
    );
});

exports.listMyApplications = catchAsync(async (req, res) => {
    const worker = await WorkerProfile.findOne({ user: req.user._id });
    const apps = await JobApplication.find({ worker: worker._id })
        .populate({ path: 'job', populate: { path: 'employer', select: 'businessName rating' } })
        .sort('-createdAt');
    res.json({ success: true, applications: apps });
});

exports.listApplicationsForJob = catchAsync(async (req, res) => {
    const employerProfile = await EmployerProfile.findOne({ user: req.user._id });
    const job = await Job.findOne({ _id: req.params.jobId, employer: employerProfile._id });
    if (!job) throw new AppError('Not found', 404);

    const apps = await JobApplication.find({ job: job._id })
        .populate('worker', 'fullName photoUrl skills experienceYears rating totalJobsCompleted verification.idVerified')
        .sort('-matchScore');
    res.json({ success: true, applications: apps });
});

exports.updateStatus = catchAsync(async (req, res) => {
    const employerProfile = await EmployerProfile.findOne({ user: req.user._id });
    const { status } = req.body;
    const app = await JobApplication.findById(req.params.id).populate('job');
    if (!app) throw new AppError('Application not found', 404);
    if (!app.job.employer.equals(employerProfile._id)) throw new AppError('Not authorized', 403);

    app.status = status;
    await app.save();

    const workerProfile = await WorkerProfile.findById(app.worker);
    emitToUser(workerProfile.user, 'application:status', { applicationId: app._id, status });

    res.json({ success: true, application: app });

    // Inside updateStatus():
    await notify(
        workerProfile.user,
        'APPLICATION_STATUS',
        `Application ${status}`,
        `Your application for "${app.job.title}" is now ${status}`,
        { applicationId: app._id, status }
    );

});

exports.hire = catchAsync(async (req, res) => {
    const employerProfile = await EmployerProfile.findOne({ user: req.user._id });
    const app = await JobApplication.findById(req.params.id).populate('job');
    if (!app) throw new AppError('Application not found', 404);
    if (!app.job.employer.equals(employerProfile._id)) throw new AppError('Not authorized', 403);

    app.status = 'HIRED';
    await app.save();

    const job = await Job.findById(app.job._id);
    job.status = 'HIRED';
    job.workersHired += 1;
    await job.save();

    const assignment = await WorkAssignment.create({
        job: job._id,
        worker: app.worker,
        employer: employerProfile._id,
        application: app._id,
        startDate: job.schedule?.startDate || new Date(),
        status: 'IN_PROGRESS',
    });

    const workerProfile = await WorkerProfile.findById(app.worker);
    emitToUser(workerProfile.user, 'assignment:new', { assignmentId: assignment._id, jobId: job._id });

    res.json({ success: true, assignment });

    // Inside hire():
    await notify(
        workerProfile.user,
        'HIRED',
        'You got hired! 🎉',
        `You were hired for "${job.title}". Start: ${job.schedule?.startDate || 'soon'}`,
        { assignmentId: assignment._id, jobId: job._id }
    );

});

function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}