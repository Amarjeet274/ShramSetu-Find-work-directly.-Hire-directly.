const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }],
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkAssignment' },
  lastMessage: String,
  lastMessageAt: Date,
  unreadCount: { type: Map, of: Number, default: {} },
}, { timestamps: true });

schema.index({ participants: 1, job: 1 });

module.exports = mongoose.model('Conversation', schema);