const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['phone', 'identity', 'business', 'face'], required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  documents: [String],
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  notes: String,
  metadata: Object, // future: face embedding hash, liveness score
}, { timestamps: true });

module.exports = mongoose.model('Verification', schema);