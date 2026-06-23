// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['order_placed', 'order_confirmed', 'order_shipped', 'order_delivered',
           'order_cancelled', 'payment_received', 'payment_failed', 'flash_sale',
           'price_drop', 'back_in_stock', 'review_approved', 'coupon', 'system'],
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed },       // { orderId, productId, etc. }
  channels: {
    inApp: { sent: Boolean, sentAt: Date },
    email: { sent: Boolean, sentAt: Date },
    sms: { sent: Boolean, sentAt: Date },
    push: { sent: Boolean, sentAt: Date },
  },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  actionUrl: { type: String },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
