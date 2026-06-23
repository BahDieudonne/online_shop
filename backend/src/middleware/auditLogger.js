const AuditLog = require('../models/AuditLog');

const auditLog = (action) => async (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = async (data) => {
    if (data.success !== false && req.user) {
      try {
        await AuditLog.create({
          user: req.user._id,
          action,
          resource: req.params.id || null,
          resourceModel: req.baseUrl.split('/').pop(),
          changes: req.body,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        });
      } catch (e) { /* non-blocking */ }
    }
    return originalJson(data);
  };
  next();
};

module.exports = { auditLog };
