const router = require('express').Router();
const ctrl = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(authenticate, authorize('staff'));
router.get('/dashboard', ctrl.getDashboard);
router.get('/products/:id', ctrl.getProductAnalytics);

module.exports = router;
