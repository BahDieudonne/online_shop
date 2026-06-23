const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price discountPrice stock images hasVariants variants');
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

exports.getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    return successResponse(res, cart);
  } catch (err) { next(err); }
};

exports.addItem = async (req, res, next) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product || product.deletedAt || product.status !== 'published') {
      return errorResponse(res, 'Product not available', 404);
    }

    let price = product.discountPrice || product.price;
    let variantName = null;

    if (product.hasVariants && variantId) {
      const variant = product.variants.id(variantId);
      if (!variant) return errorResponse(res, 'Variant not found', 404);
      if (variant.stock < quantity) return errorResponse(res, 'Insufficient stock', 400);
      price = variant.discountPrice || variant.price;
      variantName = variant.name;
    } else if (product.stock < quantity) {
      return errorResponse(res, 'Insufficient stock', 400);
    }

    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find(i =>
      i.product._id?.toString() === productId &&
      (i.variantId?.toString() === variantId || (!i.variantId && !variantId))
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ product: productId, variantId, variantName, quantity, price });
    }

    await cart.save();
    Product.findByIdAndUpdate(productId, { $inc: { 'analytics.addToCartCount': 1 } }).exec();

    const populated = await Cart.findById(cart._id).populate('items.product', 'name price discountPrice stock images');
    return successResponse(res, populated, 'Item added to cart');
  } catch (err) { next(err); }
};

exports.updateItem = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.id(req.params.itemId);
    if (!item) return errorResponse(res, 'Item not found', 404);
    item.quantity = req.body.quantity;
    await cart.save();
    return successResponse(res, cart);
  } catch (err) { next(err); }
};

exports.removeItem = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = cart.items.filter(i => i._id.toString() !== req.params.itemId);
    await cart.save();
    return successResponse(res, cart, 'Item removed');
  } catch (err) { next(err); }
};

exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: null, couponDiscount: 0 });
    return successResponse(res, null, 'Cart cleared');
  } catch (err) { next(err); }
};

exports.applyCoupon = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    const coupon = await Coupon.findOne({ code: req.body.code.toUpperCase() });

    if (!coupon || !coupon.isValid) return errorResponse(res, 'Invalid or expired coupon', 400);
    if (coupon.usedBy.includes(req.user._id)) return errorResponse(res, 'You have already used this coupon', 400);
    if (cart.subtotal < coupon.minOrderAmount) {
      return errorResponse(res, `Minimum order amount is ${coupon.minOrderAmount} XAF`, 400);
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = Math.min(cart.subtotal * (coupon.value / 100), coupon.maxDiscount || Infinity);
    } else if (coupon.type === 'fixed') {
      discount = Math.min(coupon.value, cart.subtotal);
    }

    cart.coupon = coupon._id;
    cart.couponCode = coupon.code;
    cart.couponDiscount = discount;
    await cart.save();

    return successResponse(res, { discount, couponCode: coupon.code }, 'Coupon applied');
  } catch (err) { next(err); }
};
