const jwt = require('jsonwebtoken');

exports.signAccess = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

exports.signRefresh = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });

exports.verifyRefresh = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET);