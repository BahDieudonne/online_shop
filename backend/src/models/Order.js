// models/Order.js — CHANCELOR STORE
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId },
  name:      { type: String, required: true },
  image:     { type: String },
  variant:   { type: String },
  sku:       { type: String },
  price:     { type: Number, required: true },
  quantity:  { type: Number, required: true, min: 1 },
  subtotal:  { type: Number, required: true },
});

const trackingEventSchema = new mongoose.Schema({
  status:    { type: String, required: true },
  message:   { type: String },
  location:  { type: String },
  timestamp: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },

  customer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  guestEmail: { type: String },

  items: [orderItemSchema],

  shippingAddress: {
    fullName:  { type: String },
    firstName: { type: String },
    lastName:  { type: String },
    phone:     { type: String },
    street:    { type: String },
    address:   { type: String },
    city:      { type: String },
    region:    { type: String },
    country:   { type: String, default: 'Cameroon' },
    notes:     { type: String },
  },

  billingAddress: {
    fullName: String, phone: String, street: String,
    city: String, region: String, country: String,
  },

  pricing: {
    subtotal:       { type: Number, required: true },
    shippingFee:    { type: Number, default: 0 },
    discount:       { type: Number, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    tax:            { type: Number, default: 0 },
    total:          { type: Number, required: true },
    currency:       { type: String, default: 'XAF' },
  },

  coupon:     { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  couponCode: { type: String },

  payment: {
    method: {
      type: String,
      enum: ['stripe', 'paypal', 'mtn_momo', 'orange_money', 'bank_transfer', 'cash_on_delivery', 'manual'],
      default: 'manual',
    },
    status:        { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    transactionId: { type: String },
    paidAt:        { type: Date },
    mobileNumber:  { type: String },
    reference:     { type: String },
  },

  status: {
    type: String,
    enum: [
      'pending_payment', 'confirmed', 'processing', 'shipped',
      'out_for_delivery', 'delivered', 'cancelled', 'refunded',
      'return_requested', 'returned',
    ],
    default: 'pending_payment',
  },

  isPreOrder: { type: Boolean, default: false },

  shipping: {
    carrier:           { type: String },
    trackingNumber:    { type: String },
    trackingUrl:       { type: String },
    estimatedDelivery: { type: Date },
    shippedAt:         { type: Date },
    deliveredAt:       { type: Date },
  },

  trackingHistory: [trackingEventSchema],

  notes:        { type: String },
  adminNotes:   { type: String },
  cancelReason: { type: String },
  refundReason: { type: String },
  refundAmount: { type: Number },
  refundedAt:   { type: Date },

  invoiceUrl:  { type: String },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  loyaltyPointsEarned: { type: Number, default: 0 },
  loyaltyPointsUsed:   { type: Number, default: 0 },
}, {
  timestamps: true,
});

orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    const padded = String(count + 1).padStart(6, '0');
    const year = new Date().getFullYear();
    this.orderNumber = `CHN-${year}-${padded}`;
  }
  next();
});

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
