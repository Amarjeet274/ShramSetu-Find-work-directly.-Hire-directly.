const Notification = require('../models/Notification');
const { emitToUser } = require('../sockets');

/**
 * Persist + deliver in real time.
 * @param {ObjectId} userId
 * @param {string} type
 * @param {string} title
 * @param {string} body
 * @param {Object} data
 */
exports.notify = async (userId, type, title, body, data = {}) => {
  if (!userId) return null;
  const n = await Notification.create({ user: userId, type, title, body, data });
  emitToUser(userId, 'notification:new', {
    _id: n._id, type, title, body, data, createdAt: n.createdAt,
  });
  return n;
};

exports.notifyMany = async (userIds, type, title, body, data = {}) => {
  await Promise.all(userIds.map((id) => exports.notify(id, type, title, body, data)));
};