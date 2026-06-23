const router = require('express').Router();
const Coupon = require('../models/Coupon');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Public: validate coupon
router.get('/validate/:code', authenticate, async (req, res, next) => {
  try {
    const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase() });
    if (!coupon || !coupon.isValid) return errorResponse(res, 'Invalid or expired coupon', 400);
    return successResponse(res, { type: coupon.type, value: coupon.value, minOrderAmount: coupon.minOrderAmount });
  } catch (err) { next(err); }
});

// Admin
router.get('/', authenticate, authorize('staff'), async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    return successResponse(res, coupons);
  } catch (err) { next(err); }
});

router.post('/', authenticate, authorize('manager'), async (req, res, next) => {
  try {
    const coupon = await Coupon.create({ ...req.body, createdBy: req.user._id });
    return successResponse(res, coupon, 'Coupon created', 201);
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, authorize('manager'), async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return errorResponse(res, 'Coupon not found', 404);
    return successResponse(res, coupon);
  } catch (err) { next(err); }
});

router.patch('/:id', authenticate, authorize('manager'), async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!coupon) return errorResponse(res, 'Coupon not found', 404);
    return successResponse(res, coupon);
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, authorize('manager'), async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    return successResponse(res, null, 'Coupon deleted');
  } catch (err) { next(err); }
});

module.exports = router;
