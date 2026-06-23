const router = require('express').Router();
const Review = require('../models/Review');
const Order = require('../models/Order');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

router.get('/product/:productId', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const query = { product: req.params.productId, status: 'approved' };
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      Review.find(query).populate('customer', 'firstName lastName avatar').sort(sort).skip(skip).limit(Number(limit)),
      Review.countDocuments(query),
    ]);
    return paginatedResponse(res, reviews, { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const existing = await Review.findOne({ product: req.body.productId, customer: req.user._id });
    if (existing) return errorResponse(res, 'You have already reviewed this product', 400);

    // Check if verified purchase
    const order = await Order.findOne({
      customer: req.user._id,
      'items.product': req.body.productId,
      status: 'delivered',
    });

    const review = await Review.create({
      product: req.body.productId, customer: req.user._id,
      order: order?._id, rating: req.body.rating, title: req.body.title,
      body: req.body.body, images: req.body.images,
      isVerifiedPurchase: !!order,
    });

    if (order) { order.isReviewed = true; await order.save(); }
    return successResponse(res, review, 'Review submitted', 201);
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return errorResponse(res, 'Review not found', 404);
    if (review.customer.toString() !== req.user._id.toString() && !['admin', 'super_admin'].includes(req.user.role)) {
      return errorResponse(res, 'Not authorized', 403);
    }
    await review.deleteOne();
    return successResponse(res, null, 'Review deleted');
  } catch (err) { next(err); }
});

module.exports = router;
