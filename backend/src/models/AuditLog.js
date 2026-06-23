// models/AuditLog.js
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String },
  action: { type: String, required: true },           // e.g. 'PRODUCT_DELETED'
  resource: { type: String },                         // 'Product', 'Order', etc.
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  changes: { type: mongoose.Schema.Types.Mixed },     // { before, after }
  ip: { type: String },
  userAgent: { type: String },
  severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
}, { timestamps: true });

auditLogSchema.index({ user: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
