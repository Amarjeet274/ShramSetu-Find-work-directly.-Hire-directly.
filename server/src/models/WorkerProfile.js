const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fullName: { type: String, required: true },
  photoUrl: String,
  bio: String,
  skills: [String],
  experienceYears: { type: Number, default: 0 },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' },
  },
  address: String,
  availability: {
    type: String,
    enum: ['morning', 'afternoon', 'night', 'full_day', 'flexible'],
    default: 'flexible',
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  totalJobsCompleted: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  reliabilityScore: { type: Number, default: 100 },
  verification: {
    idVerified: { type: Boolean, default: false },
    idDocumentUrl: String,
    faceVerified: { type: Boolean, default: false },
  },
  dob: Date,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  languages: [String],
  aadhaarNumber: { type: String, select: false },  // never sent to frontend by default
  aadhaarName: String,
  aadhaarDocUrl: String,
  selfieUrl: String,
  upiId: String,
  bankAccount: { type: String, select: false },
  ifsc: { type: String, select: false },

}, { timestamps: true });

module.exports = mongoose.model('WorkerProfile', schema);