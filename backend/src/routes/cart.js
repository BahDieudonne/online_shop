const router = require('express').Router();
const ctrl = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', ctrl.getCart);
router.post('/items', ctrl.addItem);
router.put('/items/:itemId', ctrl.updateItem);
router.delete('/items/:itemId', ctrl.removeItem);
router.delete('/', ctrl.clearCart);
router.post('/coupon', ctrl.applyCoupon);

module.exports = router;
