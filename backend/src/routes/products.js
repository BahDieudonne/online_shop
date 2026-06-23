const router = require('express').Router();
const ctrl = require('../controllers/productController');
const Product = require('../models/Product');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { auditLog } = require('../middleware/auditLogger');

// Public
router.get('/', ctrl.getProducts);
router.get('/featured', ctrl.getFeaturedProducts);
router.get('/new-arrivals', ctrl.getNewArrivals);
router.get('/best-sellers', ctrl.getBestSellers);
router.post('/:id/view', ctrl.trackView);
router.get('/:id/related', ctrl.getRelatedProducts);
router.get('/:slug', ctrl.getProduct);

// Admin: inventory list
router.get('/admin/inventory', authenticate, authorize('staff'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, stockFilter = 'all', search } = req.query;
    const query = { deletedAt: null };
    if (search) query.$or = [
      { name: new RegExp(search, 'i') },
      { brand: new RegExp(search, 'i') },
    ];
    if (stockFilter === 'out') query.stock = 0;
    else if (stockFilter === 'low') query.stock = { $gt: 0, $lte: 10 };
    else if (stockFilter === 'ok') query.stock = { $gt: 10 };

    const skip = (page - 1) * limit;
    const [products, total, allStats] = await Promise.all([
      Product.find(query).select('name slug brand price stock images category').populate('category', 'name').sort('stock').skip(skip).limit(Number(limit)),
      Product.countDocuments(query),
      Product.aggregate([
        { $match: { deletedAt: null } },
        { $group: {
          _id: null,
          total: { $sum: 1 },
          out: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } },
          low: { $sum: { $cond: [{ $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', 10] }] }, 1, 0] } },
          value: { $sum: { $multiply: ['$price', '$stock'] } },
        }},
      ]),
    ]);

    const summary = allStats[0] || { total: 0, out: 0, low: 0, value: 0 };
    res.json({ success: true, data: products, total, totalPages: Math.ceil(total / limit), summary });
  } catch (err) { next(err); }
});

// Admin: inventory CSV export
router.get('/admin/inventory/export', authenticate, authorize('manager'), async (req, res, next) => {
  try {
    const products = await Product.find({ deletedAt: null }).select('name brand price stock').lean();
    const header = 'Name,Brand,Price,Stock\n';
    const rows = products.map(p => `"${p.name}","${p.brand || ''}",${p.price},${p.stock}`).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory.csv');
    res.send(header + rows);
  } catch (err) { next(err); }
});

// Admin: update stock
router.patch('/:id/stock', authenticate, authorize('staff'), async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined || isNaN(quantity)) return res.status(400).json({ message: 'quantity is required' });
    const product = await Product.findByIdAndUpdate(req.params.id, { stock: Number(quantity) }, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
});

// Admin
router.get('/admin/all', authenticate, authorize('staff'), ctrl.adminGetProducts);
router.post('/', authenticate, authorize('staff'), auditLog('create_product'), ctrl.createProduct);
router.post('/bulk-import', authenticate, authorize('manager'), ctrl.bulkImport);
router.put('/:id', authenticate, authorize('staff'), auditLog('update_product'), ctrl.updateProduct);
router.delete('/:id', authenticate, authorize('manager'), auditLog('delete_product'), ctrl.deleteProduct);
router.put('/:id/restore', authenticate, authorize('manager'), ctrl.restoreProduct);
router.delete('/:id/permanent', authenticate, authorize('super_admin'), ctrl.permanentDeleteProduct);

module.exports = router;
