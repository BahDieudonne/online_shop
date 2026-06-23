// models/Cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId },
  variantName: { type: String },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  price: { type: Number, required: true },           // Snapshot price
  savedForLater: { type: Boolean, default: false },
  addedAt: { type: Date, default: Date.now },
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
  sessionId: { type: String },                       // Guest cart
  items: [cartItemSchema],
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  couponCode: { type: String },
  couponDiscount: { type: Number, default: 0 },
  expiresAt: { type: Date, default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000) },
}, { timestamps: true });

cartSchema.virtual('subtotal').get(function () {
  return this.items.filter(i => !i.savedForLater).reduce((sum, i) => sum + i.price * i.quantity, 0);
});

cartSchema.virtual('itemCount').get(function () {
  return this.items.filter(i => !i.savedForLater).reduce((sum, i) => sum + i.quantity, 0);
});

cartSchema.index({ user: 1 });
cartSchema.index({ sessionId: 1 });

module.exports = mongoose.model('Cart', cartSchema);
