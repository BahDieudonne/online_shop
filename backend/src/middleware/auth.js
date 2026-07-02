// middleware/auth.js JWT + RBAC
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify access token
exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select('-password -refreshTokens');

    if (!user || !user.isActive || user.isBanned) {
      return res.status(401).json({ message: 'Account inactive or banned' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// RBAC: authorize by role
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }
  next();
};

// Admin or higher
exports.isAdmin = exports.authorize('admin', 'super_admin');

// Manager or higher
exports.isManager = exports.authorize('manager', 'admin', 'super_admin');

// Staff or higher
exports.isStaff = exports.authorize('staff', 'manager', 'admin', 'super_admin');

// Optional auth (populates req.user if token present, doesn't block)
exports.optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = await User.findById(decoded.id).select('-password -refreshTokens');
    }
  } catch {}
  next();
};
