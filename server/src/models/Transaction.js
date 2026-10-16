const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  type: { type: String, enum: ['DEBIT', 'CREDIT', 'REFUND'], required: true },
  amount: Number,
  party: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: String,
}, { timestamps: true });

module.exports = mongoose.model('Transaction', schema);