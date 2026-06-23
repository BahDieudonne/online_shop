const rateLimit = require('express-rate-limit');

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,
  message: { message: 'Too many attempts. Try again in 15 minutes.' },
  standardHeaders: true, legacyHeaders: false,
});

exports.apiLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute
  max: 100,
  message: { message: 'Rate limit exceeded. Slow down.' },
});

exports.uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { message: 'Too many uploads. Wait a minute.' },
});
