const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(authenticate);
router.post('/', ctrl.createOrder);
router.get('/', ctrl.getOrders);
router.get('/:id', ctrl.getOrder);
router.post('/:id/cancel', ctrl.cancelOrder);
router.patch('/:id/status', authorize('staff'), ctrl.updateOrderStatus);

module.exports = router;
