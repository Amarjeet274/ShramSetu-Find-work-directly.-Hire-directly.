const SupportTicket = require('../models/SupportTicket');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { notify } = require('../services/notificationService');



exports.createTicket = catchAsync(async (req, res) => {
    const { category, subject, description } = req.body;
    const ticket = await SupportTicket.create({
        user: req.user._id,
        category, subject, description,
        messages: [{ sender: req.user._id, text: description }],
    });
    res.status(201).json({ success: true, ticket });
});

exports.listMyTickets = catchAsync(async (req, res) => {
    const tickets = await SupportTicket.find({ user: req.user._id }).sort('-updatedAt');
    res.json({ success: true, tickets });
});

exports.addMessage = catchAsync(async (req, res) => {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) throw new AppError('Not found', 404);
    if (!ticket.user.equals(req.user._id) && !['support', 'admin'].includes(req.user.role))
        throw new AppError('Not authorized', 403);

    ticket.messages.push({ sender: req.user._id, text: req.body.text, attachments: req.body.attachments });
    if (req.user.role === 'support' || req.user.role === 'admin') ticket.status = 'IN_PROGRESS';
    else if (ticket.status === 'WAITING_FOR_USER') ticket.status = 'IN_PROGRESS';
    await ticket.save();
    res.json({ success: true, ticket });

    if (['support', 'admin'].includes(req.user.role)) {
        await notify(
            ticket.user,
            'SUPPORT_REPLY',
            'New reply from support',
            req.body.text.slice(0, 120),
            { ticketId: ticket._id }
        );
    }

});

exports.listAll = catchAsync(async (req, res) => {
    const tickets = await SupportTicket.find().populate('user', 'phone role').sort('-updatedAt');
    res.json({ success: true, tickets });
});

exports.updateStatus = catchAsync(async (req, res) => {
    const ticket = await SupportTicket.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true }
    );
    if (!ticket) throw new AppError('Not found', 404);
    res.json({ success: true, ticket });
});