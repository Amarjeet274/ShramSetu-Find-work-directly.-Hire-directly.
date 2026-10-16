const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorRole: String,
  action: { type: String, required: true },
  targetType: String,
  targetId: mongoose.Schema.Types.ObjectId,
  reason: String,
  metadata: Object,
  ip: String,
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', schema);