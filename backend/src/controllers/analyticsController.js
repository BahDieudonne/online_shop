const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { successResponse } = require('../utils/apiResponse');

// GET /api/analytics/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '90d' ? 90 : period === '1y' ? 365 : 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Order schema uses 'payment.status' (nested), not top-level 'paymentStatus'
    // Order schema uses 'pricing.total', not top-level 'total'
    // Product schema uses 'deletedAt: null' for soft-delete, not 'isDeleted: false'
    const [
      totalRevenue, totalOrders, totalCustomers, totalProducts,
      revenueChart, ordersByStatus, topProducts, recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } },
      ]),

      Order.countDocuments({ createdAt: { $gte: startDate } }),
      User.countDocuments({ role: 'customer', createdAt: { $gte: startDate } }),
      Product.countDocuments({ status: 'published', deletedAt: null }),

      Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, 'payment.status': 'paid' } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$pricing.total' }, orders: { $sum: 1 },
        }},
        { $sort: { _id: 1 } },
      ]),

      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Product schema uses 'analytics.purchaseCount', not 'analytics.purchases'
      Product.find({ status: 'published', deletedAt: null })
        .sort('-analytics.purchaseCount')
        .select('name slug images price analytics')
        .limit(5).lean(),

      Order.find({ createdAt: { $gte: startDate } })
        .populate('customer', 'firstName lastName email')
        .sort('-createdAt').limit(10).lean(),

      Product.find({ stock: { $lte: 5, $gt: 0 }, status: 'published', deletedAt: null })
        .select('name stock lowStockThreshold sku').limit(10).lean(),
    ]);

    const revenue = totalRevenue[0]?.total || 0;
    const previousRevenue = await Order.aggregate([
      { $match: {
        createdAt: {
          $gte: new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000),
          $lt: startDate,
        },
        'payment.status': 'paid',
      }},
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]);
    const prevRevenue = previousRevenue[0]?.total || 0;
    const revenueGrowth = prevRevenue ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

    return successResponse(res, {
      summary: {
        revenue, revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        orders: totalOrders, newCustomers: totalCustomers, products: totalProducts,
      },
      revenueChart, ordersByStatus, topProducts, recentOrders, lowStockProducts,
    }, 'Dashboard data retrieved');
  } catch (err) { next(err); }
};

// GET /api/analytics/products/:id
exports.getProductAnalytics = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).select('name analytics');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const a = product.analytics;
    // 'purchaseCount' and 'addToCartCount' are the correct field names in the schema
    const conversionRate = a.views > 0
      ? ((a.purchaseCount / a.views) * 100).toFixed(2)
      : 0;
    const cartRate = a.views > 0
      ? ((a.addToCartCount / a.views) * 100).toFixed(2)
      : 0;

    return successResponse(res, {
      views: a.views,
      addToCartCount: a.addToCartCount,
      purchaseCount: a.purchaseCount,
      revenue: a.revenue,
      averageRating: a.averageRating,
      reviewCount: a.reviewCount,
      conversionRate,
      cartRate,
    });
  } catch (err) { next(err); }
};
