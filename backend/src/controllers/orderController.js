const Order   = require('../models/Order');
const Cart    = require('../models/Cart');
const Product = require('../models/Product');
const Coupon  = require('../models/Coupon');
const User    = require('../models/User');
const Notification = require('../models/Notification');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const emailService = require('../services/emailService');

// POST /api/orders place order
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress: rawAddr, couponCode, notes } = req.body;

    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price discountPrice stock images hasVariants variants');

    if (!cart || cart.items.filter(i => !i.savedForLater).length === 0) {
      return errorResponse(res, 'Your cart is empty', 400);
    }

    const activeItems = cart.items.filter(i => !i.savedForLater);
    const orderItems = [];
    let subtotal = 0;
    let isPreOrder = false;

    for (const item of activeItems) {
      const product = item.product;
      const effectivePrice = product.discountPrice || product.price;

      // Detect pre-orders (out-of-stock items) don't block the order
      if (product.hasVariants) {
        const variant = product.variants.id(item.variantId);
        if (!variant) return errorResponse(res, `Variant not found for ${product.name}`, 400);
        if (variant.stock < item.quantity) isPreOrder = true;
      } else {
        if (product.stock < item.quantity) isPreOrder = true;
      }
      // Stock is NOT deducted here deducted when admin confirms payment

      const itemSubtotal = effectivePrice * item.quantity;
      orderItems.push({
        product:   product._id,
        variantId: item.variantId,
        variant:   item.variantName,
        name:      product.name,
        sku:       product.sku || '',
        image:     product.images?.[0]?.url || '',
        price:     effectivePrice,
        quantity:  item.quantity,
        subtotal:  itemSubtotal,
      });
      subtotal += itemSubtotal;
    }

    // Normalize shipping address (frontend sends firstName/lastName/address)
    const addr = rawAddr || {};
    const shippingAddress = {
      fullName:  addr.fullName || `${addr.firstName || ''} ${addr.lastName || ''}`.trim(),
      firstName: addr.firstName,
      lastName:  addr.lastName,
      phone:     addr.phone,
      street:    addr.street || addr.address,
      address:   addr.address || addr.street,
      city:      addr.city,
      region:    addr.region,
      country:   addr.country || 'Cameroon',
      notes:     addr.notes,
    };

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

    const shippingFee = subtotal >= 50000 ? 0 : 2000;
    const total = subtotal - discount + shippingFee;

    const order = await Order.create({
      customer:       req.user._id,
      items:          orderItems,
      shippingAddress,
      billingAddress: shippingAddress,
      pricing:        { subtotal, shippingFee, discount, total },
      coupon:         coupon?._id,
      couponCode,
      payment:        { method: 'manual', status: 'pending' },
      status:         'pending_payment',
      isPreOrder,
      notes,
      trackingHistory: [{
        status:  'pending_payment',
        message: isPreOrder
          ? 'Pre-order placed contact us to arrange payment'
          : 'Order placed contact us to arrange payment',
      }],
    });

    // Clear cart
    cart.items = cart.items.filter(i => i.savedForLater);
    cart.coupon = null;
    cart.couponCode = null;
    await cart.save();

    // Notify customer
    await Notification.create({
      recipient: req.user._id,
      type:      'order_placed',
      title:     isPreOrder ? 'Pre-order Placed!' : 'Order Placed!',
      message:   `Your ${isPreOrder ? 'pre-' : ''}order #${order.orderNumber} is awaiting payment. Contact us via WhatsApp or phone to confirm.`,
      data:      { orderId: order._id },
      link:      `/account/orders/${order._id}`,
    });

    // Notify all admin users
    const admins = await User.find({ role: { $in: ['admin', 'super_admin', 'manager'] } })
      .select('_id').lean();
    if (admins.length > 0) {
      await Notification.insertMany(admins.map(admin => ({
        recipient: admin._id,
        type:      'new_order',
        title:     `New ${isPreOrder ? 'Pre-' : ''}Order Received`,
        message:   `Order #${order.orderNumber} from ${shippingAddress.fullName} ${total.toLocaleString()} XAF`,
        data:      { orderId: order._id },
        link:      `/admin/orders/${order._id}`,
      })));
    }

    emailService.sendOrderConfirmationEmail(req.user, order).catch(console.error);

    const populated = await order.populate('customer', 'firstName lastName email phone');
    return successResponse(res, populated, 'Order placed successfully', 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/orders customer: own orders, admin: all
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

    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Order not found', 404);
    }

    return successResponse(res, order);
  } catch (err) { next(err); }
};

// PATCH /api/orders/:id/status (staff/admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber, carrier, message, location } = req.body;
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return errorResponse(res, 'Order not found', 404);

    // Deduct stock when admin confirms payment
    if (status === 'confirmed' && order.status === 'pending_payment') {
      for (const item of order.items) {
        const product = item.product;
        if (!product) continue;
        if (product.hasVariants && item.variantId) {
          const variant = product.variants.id(item.variantId);
          if (variant) variant.stock = Math.max(0, variant.stock - item.quantity);
        } else {
          product.stock = Math.max(0, product.stock - item.quantity);
        }
        await product.save();
        Product.findByIdAndUpdate(product._id, {
          $inc: { 'analytics.purchaseCount': item.quantity, 'analytics.revenue': item.subtotal },
        }).exec();
      }
      order.payment.status = 'paid';
      order.payment.paidAt = new Date();
    }

    order.status = status;
    if (trackingNumber) order.shipping.trackingNumber = trackingNumber;
    if (carrier) order.shipping.carrier = carrier;
    if (status === 'shipped') order.shipping.shippedAt = new Date();
    if (status === 'delivered') order.shipping.deliveredAt = new Date();
    order.processedBy = req.user._id;
    order.trackingHistory.push({
      status,
      message: message || `Order ${status.replace(/_/g, ' ')}`,
      location,
      timestamp: new Date(),
      updatedBy: req.user._id,
    });
    await order.save();

    const STATUS_MESSAGES = {
      confirmed:       'Your payment has been confirmed! We are preparing your order.',
      processing:      'Your order is being packed and prepared for shipment.',
      shipped:         'Your order has been shipped and is on its way!',
      out_for_delivery:'Your order is out for delivery today!',
      delivered:       'Your order has been delivered. Thank you for shopping with us!',
      cancelled:       'Your order has been cancelled.',
      refunded:        'Your refund has been processed.',
    };

    await Notification.create({
      recipient: order.customer,
      type:      `order_${status}`,
      title:     `Order ${status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}`,
      message:   message || STATUS_MESSAGES[status] || `Your order #${order.orderNumber} status: ${status}.`,
      data:      { orderId: order._id },
      link:      `/account/orders/${order._id}`,
    });

    return successResponse(res, order, 'Order status updated');
  } catch (err) { next(err); }
};

// PATCH /api/orders/:id/notes (staff/admin)
exports.updateOrderNotes = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { adminNotes: req.body.adminNotes },
      { new: true }
    );
    if (!order) return errorResponse(res, 'Order not found', 404);
    return successResponse(res, order, 'Notes updated');
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
      return errorResponse(res, 'Cannot cancel an order that has already shipped', 400);
    }

    const originalStatus = order.status;
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = req.body.reason || 'Customer request';

    // Only restore stock if it was already deducted (confirmed or later)
    if (['confirmed', 'processing'].includes(originalStatus)) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
    }

    order.trackingHistory.push({ status: 'cancelled', message: order.cancelReason });
    await order.save();

    return successResponse(res, order, 'Order cancelled');
  } catch (err) { next(err); }
};
