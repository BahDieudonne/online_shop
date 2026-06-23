const router = require('express').Router();
const ctrl = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.post('/stripe/create-intent', ctrl.createStripeIntent);
router.post('/mtn-momo/initiate', ctrl.initiateMTNMomo);
router.post('/orange-money/initiate', ctrl.initiateOrangeMoney);
router.get('/verify/:referenceId', ctrl.verifyPayment);

module.exports = router;
