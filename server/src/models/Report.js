const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reporterRole: { type: String, enum: ['worker', 'employer'] },
  targetType: { type: String, enum: ['user', 'job', 'review'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reason: { type: String, required: true },
  details: String,
  status: { type: String, enum: ['OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED'], default: 'OPEN' },
  resolution: String,
}, { timestamps: true });

module.exports = mongoose.model('Report', schema);