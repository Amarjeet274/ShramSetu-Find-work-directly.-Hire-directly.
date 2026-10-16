const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkAssignment', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewerRole: { type: String, enum: ['worker', 'employer'], required: true },
  revieweeUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  revieweeWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkerProfile' },
  revieweeEmployer: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployerProfile' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  feedback: { type: String, maxlength: 1000 },
}, { timestamps: true });

schema.index({ assignment: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', schema);