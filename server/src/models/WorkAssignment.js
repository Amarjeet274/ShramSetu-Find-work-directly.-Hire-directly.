const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkerProfile', required: true },
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployerProfile', required: true },
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'JobApplication' },
  startDate: Date,
  endDate: Date,
  status: {
    type: String,
    enum: ['IN_PROGRESS', 'COMPLETION_REQUESTED', 'COMPLETED', 'DISPUTED', 'CANCELLED'],
    default: 'IN_PROGRESS',
  },
  completionRequestedAt: Date,
  completedAt: Date,
  completionProofUrl: String,
}, { timestamps: true });

module.exports = mongoose.model('WorkAssignment', schema);