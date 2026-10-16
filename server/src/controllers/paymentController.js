const crypto = require('crypto');
const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');
const WorkAssignment = require('../models/WorkAssignment');
const WorkHistory = require('../models/WorkHistory');
const WorkerProfile = require('../models/WorkerProfile');
const EmployerProfile = require('../models/EmployerProfile');
const Job = require('../models/Job');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { emitToUser } = require('../sockets');
const paymentService = require('../services/paymentService');
const { notify } = require('../services/notificationService');


// Step 1: employer initiates → create Payment record (order)
exports.initiate = catchAsync(async (req, res) => {
  const employer = await EmployerProfile.findOne({ user: req.user._id });
  const a = await WorkAssignment.findOne({ _id: req.body.assignmentId, employer: employer._id });
  if (!a) throw new AppError('Assignment not found', 404);
  if (a.status !== 'COMPLETED') throw new AppError('Assignment not yet confirmed complete', 400);

  const job = await Job.findById(a.job);
  const amount = job.payRate;

  const order = await paymentService.createOrder({
    amount,
    receipt: `asg_${a._id}`,
    notes: { assignmentId: a._id.toString(), employerId: employer._id.toString() },
  });

  const payment = await Payment.create({
    assignment: a._id,
    job: job._id,
    worker: a.worker,
    employer: employer._id,
    amount,
    platformFee: 0,
    provider: 'razorpay',
    providerOrderId: order.id,
    status: 'CREATED',
  });

  res.json({
    success: true,
    payment,
    order: {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      dev: !!order.dev,
    },
  });
});

// Step 2: webhook from provider (verified)
exports.webhook = catchAsync(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const raw = req.body.toString('utf8');

  if (!paymentService.verifyWebhookSignature(raw, signature)) {
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }
  const event = JSON.parse(raw);

  if (event.event === 'payment.captured') {
    const entity = event.payload.payment.entity;
    const payment = await Payment.findOne({ providerOrderId: entity.order_id });
    if (!payment || payment.status === 'SUCCESS') return res.json({ ok: true });

    payment.status = 'SUCCESS';
    payment.providerPaymentId = entity.id;
    payment.webhookVerified = true;
    payment.paidAt = new Date();
    await payment.save();

    await Transaction.create({
      payment: payment._id, type: 'CREDIT',
      amount: payment.amount, party: payment.employer,
      note: 'Worker payment',
    });

    await WorkHistory.findOneAndUpdate({ assignment: payment.assignment }, { paymentStatus: 'PAID' });
    const worker = await WorkerProfile.findById(payment.worker);
    worker.totalEarnings += payment.amount;
    await worker.save();

    await Job.findByIdAndUpdate(payment.job, { status: 'PAID' });

    await notify(
      worker.user,
      'PAYMENT_SUCCESS',
      `Payment received: ₹${payment.amount}`,
      `You received ₹${payment.amount} for your recent job.`,
      { paymentId: payment._id }
    );
  }

  res.json({ ok: true });
});

exports.listMine = catchAsync(async (req, res) => {
    let filter;
    if (req.user.role === 'worker') {
        const w = await WorkerProfile.findOne({ user: req.user._id });
        filter = { worker: w._id };
    } else {
        const e = await EmployerProfile.findOne({ user: req.user._id });
        filter = { employer: e._id };
    }
    const payments = await Payment.find(filter).sort('-createdAt');
    res.json({ success: true, payments });
});