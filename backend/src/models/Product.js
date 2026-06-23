// models/Product.js — CHANCELOR STORE
const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true },       // e.g. "Black 128GB"
  attributes: mongoose.Schema.Types.Mixed,      // { color: 'Black', storage: '128GB' }
  sku: { type: String },
  barcode: { type: String },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  costPrice: { type: Number },
  stock: { type: Number, required: true, default: 0 },
  images: [{ url: String, publicId: String, order: Number }],
  weight: { type: Number },
  isActive: { type: Boolean, default: true },
});

const specSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },   // Rich HTML from editor
  shortDescription: { type: String, maxlength: 300 },

  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  brand: { type: String, trim: true },

  sku: { type: String, unique: true, sparse: true },
  barcode: { type: String },

  // Base price (used when no variants)
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  costPrice: { type: Number },

  // Variants (optional — if set, variant prices override base price)
  hasVariants: { type: Boolean, default: false },
  variantAttributes: [{ type: String }],         // e.g. ['color', 'storage']
  variants: [variantSchema],

  // Stock (used when no variants)
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },

  images: [{
    url: { type: String, required: true },
    publicId: { type: String },                  // Cloudinary public_id
    alt: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isThumbnail: { type: Boolean, default: false },
  }],

  videos: [{ url: String, type: { type: String, enum: ['youtube', 'upload'] } }],

  weight: { type: Number },                      // grams
  dimensions: {
    length: Number, width: Number, height: Number, unit: { type: String, default: 'cm' },
  },

  tags: [{ type: String, lowercase: true }],
  features: [{ type: String }],
  specifications: [specSchema],

  status: {
    type: String,
    enum: ['draft', 'published', 'scheduled', 'archived'],
    default: 'draft',
  },
  scheduledAt: { type: Date },
  condition: { type: String, enum: ['new', 'refurbished', 'used'], default: 'new' },

  // SEO
  metaTitle: { type: String },
  metaDescription: { type: String },
  metaKeywords: [{ type: String }],

  // Analytics (denormalized counters — updated via aggregation)
  analytics: {
    views: { type: Number, default: 0 },
    addToCartCount: { type: Number, default: 0 },
    purchaseCount: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },

  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isFlashSale: { type: Boolean, default: false },
  flashSalePrice: { type: Number },
  flashSaleEndsAt: { type: Date },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date, default: null },        // Soft delete
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

// Virtual: discount percentage
productSchema.virtual('discountPercent').get(function () {
  if (!this.discountPrice || !this.price) return 0;
  return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});

// Virtual: effective price (active sale price)
productSchema.virtual('effectivePrice').get(function () {
  if (this.isFlashSale && this.flashSalePrice && this.flashSaleEndsAt > new Date()) {
    return this.flashSalePrice;
  }
  return this.discountPrice || this.price;
});

// Virtual: in stock
productSchema.virtual('inStock').get(function () {
  if (this.hasVariants) {
    return this.variants.some(v => v.stock > 0 && v.isActive);
  }
  return this.stock > 0;
});

// Auto-generate slug
productSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

// Indexes
productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ status: 1, deletedAt: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isFlashSale: 1, flashSaleEndsAt: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'analytics.purchaseCount': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ slug: 1 });

module.exports = mongoose.model('Product', productSchema);
