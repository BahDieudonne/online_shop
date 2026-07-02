const router = require('express').Router();
const ServiceReview = require('../models/ServiceReview');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

// GET /api/service-reviews public, returns approved reviews + aggregate stats
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 9 } = req.query;
    const skip = (page - 1) * limit;

    const [reviews, total, stats] = await Promise.all([
      ServiceReview.find({ status: 'approved' })
        .populate('customer', 'firstName lastName avatar')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      ServiceReview.countDocuments({ status: 'approved' }),
      ServiceReview.aggregate([
        { $match: { status: 'approved' } },
        {
          $group: {
            _id: null,
            average: { $avg: '$rating' },
            count:   { $sum: 1 },
            five:    { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
            four:    { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
            three:   { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
            two:     { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
            one:     { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const summary = stats[0] || { average: 0, count: 0, five: 0, four: 0, three: 0, two: 0, one: 0 };

    return res.json({
      success: true,
      data: reviews,
      summary: { ...summary, average: Math.round(summary.average * 10) / 10 },
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
});

// POST /api/service-reviews authenticated customers only
router.post('/', authenticate, async (req, res, next) => {
  try {
    const existing = await ServiceReview.findOne({ customer: req.user._id });
    if (existing) return errorResponse(res, 'You have already submitted a service review', 400);

    const { rating, title, body } = req.body;
    if (!rating || !body) return errorResponse(res, 'Rating and review text are required', 400);

    const review = await ServiceReview.create({
      customer: req.user._id,
      rating: Number(rating),
      title: title?.trim(),
      body: body.trim(),
    });

    return successResponse(res, review, 'Review submitted it will appear after moderation', 201);
  } catch (err) { next(err); }
});

// PATCH /api/service-reviews/:id/status admin: approve or reject
router.patch('/:id/status', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) return errorResponse(res, 'Invalid status', 400);
    const review = await ServiceReview.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    );
    if (!review) return errorResponse(res, 'Review not found', 404);
    return successResponse(res, review, `Review ${status}`);
  } catch (err) { next(err); }
});

// GET /api/service-reviews/pending admin: list pending reviews
router.get('/pending', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const reviews = await ServiceReview.find({ status: 'pending' })
      .populate('customer', 'firstName lastName email')
      .sort('-createdAt');
    return successResponse(res, reviews);
  } catch (err) { next(err); }
});

module.exports = router;
