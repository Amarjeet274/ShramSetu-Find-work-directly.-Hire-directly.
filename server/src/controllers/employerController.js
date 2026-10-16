const EmployerProfile = require('../models/EmployerProfile');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getMe = catchAsync(async (req, res) => {
  const profile = await EmployerProfile.findOne({ user: req.user._id });
  res.json({ success: true, profile });
});

exports.updateMe = catchAsync(async (req, res) => {
  const allowed = [
    /* Shared */
    'accountType', 'email', 'photoUrl', 'address', 'serviceRadiusKm',
    'description', 'ownerName', 'upiId',
    /* Contact */
    'contactPhone', 'showContact', 'hiringCategories',
    /* Business */
    'businessName', 'businessType', 'industry', 'yearsInBusiness', 'employeeCount',
    /* Individual */
    'fullName', 'hireReason', 'householdSize', 'idType', 'idNumber',
  ];

  const updates = {};
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  });

  if (req.body.lng !== undefined && req.body.lat !== undefined) {
    updates.location = {
      type: 'Point',
      coordinates: [Number(req.body.lng), Number(req.body.lat)],
    };
  }

  const profile = await EmployerProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: updates },
    { new: true, runValidators: true }
  );

  res.json({ success: true, profile });
});

exports.submitVerification = catchAsync(async (req, res) => {
  const {
    /* Business */
    documentUrl, selfieUrl, gstNumber, panNumber,
    /* Individual */
    idType, idNumber, idDocUrl,
  } = req.body;

  const profile = await EmployerProfile.findOne({ user: req.user._id });
  if (!profile) throw new AppError('Profile not found', 404);

  const isBusiness = profile.accountType === 'business';

  if (isBusiness) {
    if (!documentUrl || !selfieUrl) {
      throw new AppError('Business document and selfie required', 400);
    }
  } else {
    if (!idDocUrl || !selfieUrl) {
      throw new AppError('ID document and selfie required', 400);
    }
  }

  const verificationDocs = isBusiness ? [documentUrl, selfieUrl] : [idDocUrl, selfieUrl];

  const v = await Verification.create({
    user: req.user._id,
    type: isBusiness ? 'business' : 'identity',
    status: 'PENDING',
    documents: verificationDocs,
    metadata: isBusiness
      ? { gstNumber, panNumber, accountType: 'business' }
      : { idType, idNumber, accountType: 'individual' },
  });

  const profileUpdate = isBusiness
    ? {
      businessDocUrl: documentUrl,
      selfieUrl,
      gstNumber: gstNumber || profile.gstNumber,
      panNumber: panNumber || profile.panNumber,
      'verification.documentUrl': documentUrl,
    }
    : {
      idDocUrl,
      selfieUrl,
      idType: idType || profile.idType,
      idNumber: idNumber || profile.idNumber,
      'verification.documentUrl': idDocUrl,
    };

  await EmployerProfile.updateOne({ user: req.user._id }, profileUpdate);
  await User.findByIdAndUpdate(req.user._id, { verificationStatus: 'pending' });

  res.status(201).json({ success: true, verification: v });
});

exports.getPublic = catchAsync(async (req, res) => {
  const profile = await EmployerProfile.findById(req.params.id).select(
    'businessName photoUrl rating totalReviews jobsPosted workersHired paymentReliability verification.businessVerified'
  );
  if (!profile) throw new AppError('Employer not found', 404);
  res.json({ success: true, profile });
});