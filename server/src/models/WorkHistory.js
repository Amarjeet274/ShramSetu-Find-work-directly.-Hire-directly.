const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkerProfile', required: true, index: true },
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployerProfile', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkAssignment' },
  skill: String,
  category: String,
  location: String,
  startDate: Date,
  endDate: Date,
  durationDays: Number,
  paymentAmount: Number,
  paymentStatus: { type: String, enum: ['PENDING', 'PAID'], default: 'PENDING' },
  rating: Number,
  feedback: String,
  completionStatus: { type: String, enum: ['COMPLETED', 'DISPUTED'], default: 'COMPLETED' },
}, { timestamps: true });

module.exports = mongoose.model('WorkHistory', schema);