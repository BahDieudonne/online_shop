const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['banner', 'faq', 'testimonial'], index: true },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },

  // Shared
  title: String,

  // Banner
  subtitle: String,
  ctaText: String,
  ctaUrl: String,
  image: String,
  bgColor: { type: String, default: '#1a237e' },

  // FAQ
  question: String,
  answer: String,
  category: { type: String, default: 'General' },

  // Testimonial
  name: String,
  role: String,
  message: String,
  rating: { type: Number, default: 5, min: 1, max: 5 },
  avatar: String,
}, { timestamps: true });

schema.index({ type: 1, isActive: 1, order: 1 });

module.exports = mongoose.model('ContentItem', schema);
