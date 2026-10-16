const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkAssignment', required: true },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  against: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: String,
  evidence: [String],
  status: { type: String, enum: ['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
  resolution: String,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Dispute', schema);