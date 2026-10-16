const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkerProfile', required: true, index: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
}, { timestamps: true });
schema.index({ worker: 1, job: 1 }, { unique: true });
module.exports = mongoose.model('SavedJob', schema);