const WorkerProfile = require('../models/WorkerProfile');
const WorkHistory = require('../models/WorkHistory');
const Review = require('../models/Review');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const storageService = require('../services/storageService');
const Verification = require('../models/Verification');
const { notify } = require('../services/notificationService');

exports.submitVerification = catchAsync(async (req, res) => {
    const { documentUrl, selfieUrl, aadhaarNumber, aadhaarName } = req.body;

    const v = await Verification.create({
        user: req.user._id,
        type: 'identity',
        status: 'PENDING',
        documents: [documentUrl, selfieUrl],
        metadata: {
            aadhaarLast4: aadhaarNumber?.slice(-4),
            aadhaarName,
            hasSelfie: !!selfieUrl,
        },
    });

    await WorkerProfile.updateOne(
        { user: req.user._id },
        {
            aadhaarNumber,
            aadhaarName,
            aadhaarDocUrl: documentUrl,
            selfieUrl,
        }
    );
    await User.findByIdAndUpdate(req.user._id, { verificationStatus: 'pending' });

    res.status(201).json({ success: true, verification: v });
});

exports.getMe = catchAsync(async (req, res) => {
    const profile = await WorkerProfile.findOne({ user: req.user._id });
    res.json({ success: true, profile });
});

exports.updateMe = catchAsync(async (req, res) => {
    const allowed = [
        'fullName', 'bio', 'skills', 'experienceYears', 'availability',
        'address', 'photoUrl', 'dob', 'gender', 'languages',
        'travelRadiusKm', 'upiId',
    ];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    if (req.body.lng !== undefined && req.body.lat !== undefined) {
        updates.location = { type: 'Point', coordinates: [req.body.lng, req.body.lat] };
    }

    const profile = await WorkerProfile.findOneAndUpdate(
        { user: req.user._id },
        { $set: updates },
        { new: true, runValidators: true }
    );
    res.json({ success: true, profile });
});

exports.getPublic = catchAsync(async (req, res) => {
    const profile = await WorkerProfile.findById(req.params.id).select(
        'fullName photoUrl skills experienceYears rating totalReviews totalJobsCompleted reliabilityScore verification.idVerified location'
    );
    if (!profile) throw new AppError('Worker not found', 404);
    res.json({ success: true, profile });
});

exports.getMyHistory = catchAsync(async (req, res) => {
    const profile = await WorkerProfile.findOne({ user: req.user._id });
    const history = await WorkHistory.find({ worker: profile._id })
        .populate('employer', 'businessName')
        .sort('-endDate');
    res.json({ success: true, history });
});

exports.getMyEarnings = catchAsync(async (req, res) => {
    const profile = await WorkerProfile.findOne({ user: req.user._id });
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay); startOfWeek.setDate(startOfWeek.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [day, week, month, all] = await Promise.all([
        WorkHistory.aggregate([{ $match: { worker: profile._id, paymentStatus: 'PAID', endDate: { $gte: startOfDay } } }, { $group: { _id: null, total: { $sum: '$paymentAmount' } } }]),
        WorkHistory.aggregate([{ $match: { worker: profile._id, paymentStatus: 'PAID', endDate: { $gte: startOfWeek } } }, { $group: { _id: null, total: { $sum: '$paymentAmount' } } }]),
        WorkHistory.aggregate([{ $match: { worker: profile._id, paymentStatus: 'PAID', endDate: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$paymentAmount' } } }]),
        WorkHistory.aggregate([{ $match: { worker: profile._id, paymentStatus: 'PAID' } }, { $group: { _id: null, total: { $sum: '$paymentAmount' } } }]),
    ]);

    res.json({
        success: true,
        earnings: {
            today: day[0]?.total || 0,
            thisWeek: week[0]?.total || 0,
            thisMonth: month[0]?.total || 0,
            allTime: all[0]?.total || 0,
        },
    });
});