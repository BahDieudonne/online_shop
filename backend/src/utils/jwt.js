// utils/jwt.js
const jwt = require('jsonwebtoken');

exports.generateAccessToken = (user) => jwt.sign(
  { id: user._id, role: user.role, email: user.email },
  process.env.JWT_ACCESS_SECRET,
  { expiresIn: '15m' }
);

exports.generateRefreshToken = (user) => jwt.sign(
  { id: user._id },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: '30d' }
);

exports.verifyRefreshToken = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET);
