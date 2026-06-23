// models/Coupon.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String },
  type: { type: String, enum: ['percentage', 'fixed', 'free_shipping'], required: true },
  value: { type: Number, required: true },            // % or XAF amount
  minimumOrderAmount: { type: Number, default: 0 },
  maximumDiscount: { type: Number },                  // Cap for % coupons
  usageLimit: { type: Number, default: null },        // null = unlimited
  usagePerUser: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 },
  usedBy: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, count: Number }],
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  startsAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

couponSchema.index({ code: 1 });
couponSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
