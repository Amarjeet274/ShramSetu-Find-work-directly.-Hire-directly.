const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.listConversations = catchAsync(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants', 'phone role')
    .sort('-lastMessageAt');
  res.json({ success: true, conversations });
});

exports.getOrCreate = catchAsync(async (req, res) => {
  const { otherUserId, jobId } = req.body;
  if (otherUserId === req.user._id.toString()) throw new AppError('Cannot chat with yourself', 400);

  let convo = await Conversation.findOne({
    participants: { $all: [req.user._id, otherUserId] },
    job: jobId || null,
  });
  if (!convo) {
    convo = await Conversation.create({
      participants: [req.user._id, otherUserId],
      job: jobId || undefined,
    });
  }
  res.json({ success: true, conversation: convo });
});

exports.listMessages = catchAsync(async (req, res) => {
  const convo = await Conversation.findById(req.params.id);
  if (!convo || !convo.participants.some(p => p.equals(req.user._id)))
    throw new AppError('Not authorized', 403);

  const messages = await Message.find({ conversation: convo._id }).sort('createdAt').limit(200);
  res.json({ success: true, messages });
});