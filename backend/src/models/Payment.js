// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'XAF' },
  method: {
    type: String,
    enum: ['stripe', 'paypal', 'mtn_momo', 'orange_money', 'bank_transfer', 'cash_on_delivery'],
    required: true,
  },
  status: {
    type: String,
    enum: ['initiated', 'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'initiated',
  },
  transactionId: { type: String },
  gatewayResponse: { type: mongoose.Schema.Types.Mixed },
  mobileNumber: { type: String },         // MTN / Orange
  reference: { type: String, unique: true, sparse: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  refundAmount: { type: Number },
  refundReason: { type: String },
  refundedAt: { type: Date },
  completedAt: { type: Date },
}, { timestamps: true });

paymentSchema.index({ order: 1 });
paymentSchema.index({ customer: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
