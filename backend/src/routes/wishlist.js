const router = require('express').Router();
const Wishlist = require('../models/Wishlist');
const { authenticate } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/apiResponse');

router.use(authenticate);

// Wishlist schema uses 'user' field, not 'customer'
router.get('/', async (req, res, next) => {
  try {
    let wl = await Wishlist.findOne({ user: req.user._id }).populate('items.product', 'name slug images price discountPrice stock');
    if (!wl) wl = { items: [] };
    return successResponse(res, wl);
  } catch (err) { next(err); }
});

router.post('/items', async (req, res, next) => {
  try {
    let wl = await Wishlist.findOne({ user: req.user._id });
    if (!wl) wl = await Wishlist.create({ user: req.user._id, items: [] });
    const exists = wl.items.find(i => i.product.toString() === req.body.productId);
    if (!exists) wl.items.push({ product: req.body.productId });
    await wl.save();
    return successResponse(res, wl, 'Added to wishlist');
  } catch (err) { next(err); }
});

router.delete('/items/:productId', async (req, res, next) => {
  try {
    const wl = await Wishlist.findOne({ user: req.user._id });
    if (wl) {
      wl.items = wl.items.filter(i => i.product.toString() !== req.params.productId);
      await wl.save();
    }
    return successResponse(res, null, 'Removed from wishlist');
  } catch (err) { next(err); }
});

module.exports = router;
