const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkerProfile', required: true, index: true },
  status: {
    type: String,
    enum: ['APPLIED', 'VIEWED', 'SHORTLISTED', 'HIRED', 'REJECTED', 'WITHDRAWN'],
    default: 'APPLIED',
  },
  matchScore: { type: Number, default: 0 },
  coverNote: String,
  rejectionReason: String,
}, { timestamps: true });

schema.index({ job: 1, worker: 1 }, { unique: true });

module.exports = mongoose.model('JobApplication', schema);