const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true },
  title: String,
  body: String,
  data: Object,
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', schema);