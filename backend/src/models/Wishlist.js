// models/Wishlist.js
const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    addedAt: { type: Date, default: Date.now },
    priceWhenAdded: { type: Number },
  }],
  shareToken: { type: String, unique: true, sparse: true },
}, { timestamps: true });

wishlistSchema.index({ user: 1 });

module.exports = mongoose.model('Wishlist', wishlistSchema);
