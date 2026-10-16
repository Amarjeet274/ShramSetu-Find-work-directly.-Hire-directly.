const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

let io;

module.exports = function initSocket(server) {
  io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
    pingTimeout: 20000,
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Unauthorized'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('Unauthorized'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user._id}`);

    socket.on('conversation:join', (conversationId) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on('message:send', async ({ conversationId, text }, ack) => {
      try {
        const convo = await Conversation.findById(conversationId);
        if (!convo || !convo.participants.some(p => p.equals(socket.user._id))) {
          return ack?.({ error: 'Not allowed' });
        }
        const msg = await Message.create({
          conversation: conversationId,
          sender: socket.user._id,
          text,
        });
        convo.lastMessage = text;
        convo.lastMessageAt = new Date();
        await convo.save();

        io.to(`conv:${conversationId}`).emit('message:new', {
          _id: msg._id,
          conversation: conversationId,
          sender: socket.user._id,
          text,
          createdAt: msg.createdAt,
        });
        ack?.({ ok: true });
      } catch (e) {
        ack?.({ error: 'Failed' });
      }
    });

    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conv:${conversationId}`).emit('typing', {
        userId: socket.user._id,
        isTyping,
      });
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

module.exports.emitToUser = (userId, event, payload) => {
  if (io) io.to(`user:${userId}`).emit(event, payload);
};