// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  image: { url: String, publicId: String },
  icon: { type: String },                          // Icon class or SVG
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  level: { type: Number, default: 0 },             // 0=top, 1=sub, 2=sub-sub
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  metaTitle: { type: String },
  metaDescription: { type: String },
  productCount: { type: Number, default: 0 },
}, { timestamps: true, toJSON: { virtuals: true } });

categorySchema.virtual('children', {
  ref: 'Category', localField: '_id', foreignField: 'parent',
});

categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });

module.exports = mongoose.model('Category', categorySchema);
