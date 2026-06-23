const mongoose = require('mongoose');

const serviceReviewSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating:   { type: Number, required: true, min: 1, max: 5 },
  title:    { type: String, maxlength: 100 },
  body:     { type: String, required: true, maxlength: 1000 },
  status:   { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

serviceReviewSchema.index({ customer: 1 }, { unique: true });
serviceReviewSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ServiceReview', serviceReviewSchema);
