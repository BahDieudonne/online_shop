const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const Order = require('../models/Order');

// Public order tracking by order number (no auth required)
router.get('/track/:orderNumber', optionalAuth, async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .select('orderNumber status trackingHistory shipping pricing createdAt')
      .lean();
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.json({ success: true, data: order });
  } catch (err) { next(err); }
});

router.use(authenticate);
router.post('/', ctrl.createOrder);
router.get('/', ctrl.getOrders);
router.get('/:id', ctrl.getOrder);
router.post('/:id/cancel', ctrl.cancelOrder);
router.patch('/:id/status', authorize('staff'), ctrl.updateOrderStatus);
router.patch('/:id/notes', authorize('staff'), ctrl.updateOrderNotes);

module.exports = router;
