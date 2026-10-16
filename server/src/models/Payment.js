const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkAssignment', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkerProfile', required: true, index: true },
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployerProfile', required: true, index: true },
  amount: { type: Number, required: true },
  platformFee: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  provider: { type: String, default: 'razorpay' },
  providerOrderId: String,
  providerPaymentId: String,
  providerSignature: String,
  status: {
    type: String,
    enum: ['CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'DISPUTED'],
    default: 'CREATED',
  },
  webhookVerified: { type: Boolean, default: false },
  paidAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Payment', schema);