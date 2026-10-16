const WorkAssignment = require('../models/WorkAssignment');
const EmployerProfile = require('../models/EmployerProfile');
const WorkerProfile = require('../models/WorkerProfile');
const WorkHistory = require('../models/WorkHistory');
const Job = require('../models/Job');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { emitToUser } = require('../sockets');
const { notify } = require('../services/notificationService');


exports.requestCompletion = catchAsync(async (req, res) => {
    const worker = await WorkerProfile.findOne({ user: req.user._id });
    const a = await WorkAssignment.findOne({ _id: req.params.id, worker: worker._id });
    if (!a) throw new AppError('Assignment not found', 404);

    a.status = 'COMPLETION_REQUESTED';
    a.completionRequestedAt = new Date();
    a.completionProofUrl = req.body.proofUrl;
    await a.save();

    const job = await Job.findById(a.job);
    job.status = 'COMPLETION_REQUESTED';
    await job.save();

    const employer = await EmployerProfile.findById(a.employer);
    emitToUser(employer.user, 'assignment:completion-requested', { assignmentId: a._id });


    // requestCompletion():
    await notify(
        employer.user,
        'COMPLETION_REQUESTED',
        'Worker marked work complete',
        `Please review and confirm completion.`,
        { assignmentId: a._id }
    );

    res.json({ success: true, assignment: a });
});

exports.confirmCompletion = catchAsync(async (req, res) => {
    const employer = await EmployerProfile.findOne({ user: req.user._id });
    const a = await WorkAssignment.findOne({ _id: req.params.id, employer: employer._id });
    if (!a) throw new AppError('Not found', 404);

    a.status = 'COMPLETED';
    a.completedAt = new Date();
    await a.save();

    const job = await Job.findById(a.job);
    job.status = 'PAYMENT_PENDING';
    await job.save();

    const workerProfile = await WorkerProfile.findById(a.worker);
    workerProfile.totalJobsCompleted += 1;
    await workerProfile.save();

    // Create Work History (permanent record)
    await WorkHistory.create({
        worker: a.worker,
        employer: a.employer,
        job: job._id,
        assignment: a._id,
        skill: job.category,
        category: job.category,
        location: job.address,
        startDate: a.startDate,
        endDate: a.completedAt,
        durationDays: Math.max(1, Math.ceil((a.completedAt - a.startDate) / 86400000)),
        paymentAmount: job.payRate,
        paymentStatus: 'PENDING',
        completionStatus: 'COMPLETED',
    });

    emitToUser(workerProfile.user, 'assignment:completed', { assignmentId: a._id });

    // confirmCompletion():
    await notify(
        workerProfile.user,
        'COMPLETION_CONFIRMED',
        'Work confirmed ✅',
        `Your work on "${job.title}" was confirmed. Payment pending.`,
        { assignmentId: a._id }
    );


    res.json({ success: true, assignment: a });
});

exports.listMine = catchAsync(async (req, res) => {
    let filter;
    if (req.user.role === 'worker') {
        const w = await WorkerProfile.findOne({ user: req.user._id });
        filter = { worker: w._id };
    } else {
        const e = await EmployerProfile.findOne({ user: req.user._id });
        filter = { employer: e._id };
    }
    const list = await WorkAssignment.find(filter)
        .populate('job', 'title payRate address category')
        .sort('-createdAt');
    res.json({ success: true, assignments: list });
});