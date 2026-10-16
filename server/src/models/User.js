const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true, index: true },
  role: { type: String, enum: ['worker', 'employer', 'support', 'admin'], required: true },
  language: { type: String, enum: ['en', 'hi', 'bho'], default: 'hi' },
  isVerified: { type: Boolean, default: false },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'unverified',
  },
  status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' },
  faceVerificationId: { type: String, default: null }, // future
  lastLoginAt: Date,
}, { timestamps: true });

userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    phone: this.phone,
    role: this.role,
    language: this.language,
    isVerified: this.isVerified,
    verificationStatus: this.verificationStatus,
  };
};

module.exports = mongoose.model('User', userSchema);