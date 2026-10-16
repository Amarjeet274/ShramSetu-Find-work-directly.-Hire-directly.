const faceService = require('../services/faceVerificationService');
const Verification = require('../models/Verification');
const { uploadSingle } = require('../middleware/upload');
const catchAsync = require('../utils/catchAsync');

exports.submitSelfie = [
  uploadSingle,
  catchAsync(async (req, res) => {
    const { status, confidence, note } = await faceService.verify({
      userId: req.user._id,
      selfieBuffer: req.file?.buffer,
    });
    const v = await Verification.create({
      user: req.user._id, type: 'face', status: status === 'APPROVED' ? 'APPROVED' : 'PENDING',
      documents: [req.file?.filename || 'buffer'],
      metadata: { confidence, note },
    });
    res.json({ success: true, status, verificationId: v._id });
  }),
];