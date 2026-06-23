const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const mobileMoneyService = require('../services/mobileMoneyService');

// POST /api/payments/stripe/create-intent
exports.createStripeIntent = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order || order.customer.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Order not found', 404);
    }

    // Order schema stores total inside 'pricing' sub-document
    const amount = order.pricing.total;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency: 'xaf',
      metadata: { orderId: order._id.toString(), orderNumber: order.orderNumber },
    });

    // Payment schema uses 'transactionId', not 'stripePaymentIntentId'
    await Payment.create({
      order: order._id, customer: req.user._id,
      amount, currency: 'XAF', method: 'stripe',
      transactionId: paymentIntent.id,
    });

    return successResponse(res, { clientSecret: paymentIntent.client_secret });
  } catch (err) { next(err); }
};

// POST /api/payments/mtn-momo/initiate
exports.initiateMTNMomo = async (req, res, next) => {
  try {
    const { orderId, phoneNumber } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return errorResponse(res, 'Order not found', 404);

    const amount = order.pricing.total;

    const result = await mobileMoneyService.initiateMTNPayment({
      amount,
      currency: 'XAF',
      phoneNumber,
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
    });

    // Payment schema uses 'transactionId', not 'gatewayTransactionId'
    await Payment.create({
      order: order._id, customer: req.user._id,
      amount, currency: 'XAF', method: 'mtn_momo',
      transactionId: result.referenceId,
      mobileNumber: phoneNumber,
      status: 'processing',
    });

    // Order schema uses nested 'payment.status', not top-level 'paymentStatus'
    order.payment.status = 'pending';
    await order.save();

    return successResponse(res, { referenceId: result.referenceId, message: 'Payment request sent to your phone' });
  } catch (err) { next(err); }
};

// POST /api/payments/orange-money/initiate
exports.initiateOrangeMoney = async (req, res, next) => {
  try {
    const { orderId, phoneNumber } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return errorResponse(res, 'Order not found', 404);

    const amount = order.pricing.total;

    const result = await mobileMoneyService.initiateOrangePayment({
      amount, currency: 'XAF',
      phoneNumber, orderId: order._id.toString(),
    });

    await Payment.create({
      order: order._id, customer: req.user._id,
      amount, currency: 'XAF', method: 'orange_money',
      transactionId: result.payToken,
      mobileNumber: phoneNumber, status: 'processing',
    });

    return successResponse(res, { paymentUrl: result.paymentUrl, payToken: result.payToken });
  } catch (err) { next(err); }
};

// GET /api/payments/verify/:referenceId
exports.verifyPayment = async (req, res, next) => {
  try {
    // Payment schema uses 'transactionId', not 'gatewayTransactionId'
    const payment = await Payment.findOne({ transactionId: req.params.referenceId });
    if (!payment) return errorResponse(res, 'Payment not found', 404);

    let verified = false;
    if (payment.method === 'mtn_momo') {
      const status = await mobileMoneyService.checkMTNStatus(req.params.referenceId);
      verified = status === 'SUCCESSFUL';
    } else if (payment.method === 'orange_money') {
      const status = await mobileMoneyService.checkOrangeStatus(req.params.referenceId);
      verified = status === 'SUCCESS';
    }

    if (verified) {
      payment.status = 'completed';
      payment.completedAt = new Date();
      await payment.save();
      // Order schema uses nested 'payment.status', not top-level 'paymentStatus'
      await Order.findByIdAndUpdate(payment.order, {
        'payment.status': 'paid',
        'payment.paidAt': new Date(),
        status: 'confirmed',
      });
    }

    return successResponse(res, { verified, payment });
  } catch (err) { next(err); }
};

// Stripe Webhook
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return res.status(400).send('Webhook signature verification failed');
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    // Payment schema uses 'transactionId' and stores charge in 'metadata'
    await Payment.findOneAndUpdate(
      { transactionId: pi.id },
      { status: 'completed', completedAt: new Date(), metadata: { chargeId: pi.latest_charge } }
    );
    await Order.findByIdAndUpdate(pi.metadata.orderId, {
      'payment.status': 'paid',
      'payment.paidAt': new Date(),
      'payment.transactionId': pi.id,
      status: 'confirmed',
    });
  } else if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object;
    await Payment.findOneAndUpdate(
      { transactionId: pi.id },
      { status: 'failed', gatewayResponse: pi.last_payment_error }
    );
    await Order.findByIdAndUpdate(pi.metadata.orderId, { 'payment.status': 'failed' });
  }

  res.json({ received: true });
};
