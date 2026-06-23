const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const emailService = require('../services/emailService');

// POST /api/orders — place order
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, billingAddress, paymentMethod, couponCode, notes } = req.body;

    // Cart schema uses 'user' field, not 'customer'
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price discountPrice stock images hasVariants variants');

    if (!cart || cart.items.filter(i => !i.savedForLater).length === 0) {
      return errorResponse(res, 'Your cart is empty', 400);
    }

    const activeItems = cart.items.filter(i => !i.savedForLater);

    // Build order items & validate stock
    const orderItems = [];
    let subtotal = 0;

    for (const item of activeItems) {
      const product = item.product;
      const effectivePrice = product.discountPrice || product.price;

      if (product.hasVariants) {
        const variant = product.variants.id(item.variantId);
        if (!variant || variant.stock < item.quantity) {
          return errorResponse(res, `Insufficient stock for ${product.name}`, 400);
        }
        variant.stock -= item.quantity;
      } else {
        if (product.stock < item.quantity) {
          return errorResponse(res, `Insufficient stock for ${product.name}`, 400);
        }
        product.stock -= item.quantity;
      }
      await product.save();

      const itemSubtotal = effectivePrice * item.quantity;
      orderItems.push({
        product: product._id,
        variantId: item.variantId,
        variant: item.variantName,   // schema 'variant' field is the display name string
        name: product.name,
        sku: product.sku || '',
        image: product.images?.[0]?.url || '',
        price: effectivePrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,      // schema uses 'subtotal', not 'total'
      });
      subtotal += itemSubtotal;

      // Update analytics — schema field is 'purchaseCount', not 'purchases'
      Product.findByIdAndUpdate(product._id, {
        $inc: { 'analytics.purchaseCount': item.quantity, 'analytics.revenue': itemSubtotal },
      }).exec();
    }

    // Apply coupon
    let discount = 0;
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon && coupon.isValid) {
        if (coupon.type === 'percentage') {
          discount = Math.min(subtotal * (coupon.value / 100), coupon.maxDiscount || Infinity);
        } else if (coupon.type === 'fixed') {
          discount = Math.min(coupon.value, subtotal);
        }
        coupon.usageCount += 1;
        coupon.usedBy.push(req.user._id);
        await coupon.save();
      }
    }

    const shippingFee = subtotal >= 50000 ? 0 : 2000; // Free shipping over 50,000 XAF
    const total = subtotal - discount + shippingFee;

    // Order schema uses nested 'pricing' and 'payment' objects, and 'trackingHistory'
    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      pricing: { subtotal, shippingFee, discount, total },
      coupon: coupon?._id,
      couponCode,
      payment: { method: paymentMethod },
      notes,
      trackingHistory: [{ status: 'pending', message: 'Order placed' }],
    });

    // Clear cart
    cart.items = cart.items.filter(i => i.savedForLater);
    cart.coupon = null;
    cart.couponCode = null;
    await cart.save();

    // Notify customer
    await Notification.create({
      recipient: req.user._id,
      type: 'order_placed',
      title: 'Order Placed!',
      message: `Your order #${order.orderNumber} has been placed successfully.`,
      data: { orderId: order._id },
      link: `/orders/${order._id}`,
    });

    // Send confirmation email
    emailService.sendOrderConfirmationEmail(req.user, order).catch(console.error);

    const populated = await order.populate('customer', 'firstName lastName email phone');
    return successResponse(res, populated, 'Order placed successfully', 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/orders — customer: own orders, admin: all
exports.getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, sort = '-createdAt' } = req.query;
    const query = {};

    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    }
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('customer', 'firstName lastName email phone')
        .sort(sort).skip(skip).limit(Number(limit)).lean(),
      Order.countDocuments(query),
    ]);

    return paginatedResponse(res, orders, {
      page: Number(page), limit: Number(limit), total,
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) { next(err); }
};

// GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone')
      .populate('items.product', 'name slug images');

    if (!order) return errorResponse(res, 'Order not found', 404);

    // Customers can only see their own orders
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Order not found', 404);
    }

    return successResponse(res, order);
  } catch (err) { next(err); }
};

// PATCH /api/orders/:id/status (admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber, carrier, message, location } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return errorResponse(res, 'Order not found', 404);

    order.status = status;
    // These fields live in the nested 'shipping' sub-document
    if (trackingNumber) order.shipping.trackingNumber = trackingNumber;
    if (carrier) order.shipping.carrier = carrier;
    if (status === 'shipped') order.shipping.shippedAt = new Date();
    if (status === 'delivered') order.shipping.deliveredAt = new Date();
    order.processedBy = req.user._id;
    // Schema uses 'trackingHistory', not 'trackingEvents'
    order.trackingHistory.push({
      status,
      message: message || `Order ${status}`,
      location,
      timestamp: new Date(),
    });
    await order.save();

    // Notify customer
    await Notification.create({
      recipient: order.customer,
      type: `order_${status}`,
      title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: message || `Your order #${order.orderNumber} is now ${status}.`,
      data: { orderId: order._id },
      link: `/orders/${order._id}`,
    });

    return successResponse(res, order, 'Order status updated');
  } catch (err) { next(err); }
};

// POST /api/orders/:id/cancel
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return errorResponse(res, 'Order not found', 404);

    if (req.user.role === 'customer' && order.customer.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized', 403);
    }
    if (['shipped', 'out_for_delivery', 'delivered'].includes(order.status)) {
      return errorResponse(res, 'Cannot cancel order in current status', 400);
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = req.body.reason || 'Customer request';

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    // Schema uses 'trackingHistory', not 'trackingEvents'
    order.trackingHistory.push({ status: 'cancelled', message: order.cancelReason });
    await order.save();

    return successResponse(res, order, 'Order cancelled');
  } catch (err) { next(err); }
};
