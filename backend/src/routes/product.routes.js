const router = require('express').Router();
const { authenticate, isAdmin, isStaff, optionalAuth } = require('../middleware/auth');
const {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, autocomplete, restoreProduct, bulkImport,
} = require('../controllers/productController');
const Product = require('../models/Product');

router.get('/', optionalAuth, getProducts);
router.get('/search/autocomplete', autocomplete);

// Admin inventory must be before /:id to avoid being caught by the param route
router.get('/admin/inventory', authenticate, isStaff, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, stockFilter = 'all', search } = req.query;
    const query = {};
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { brand: new RegExp(search, 'i') }];
    if (stockFilter === 'out') query.stock = 0;
    else if (stockFilter === 'low') query.stock = { $gt: 0, $lte: 10 };
    else if (stockFilter === 'ok') query.stock = { $gt: 10 };
    const skip = (page - 1) * limit;
    const [products, total, allStats] = await Promise.all([
      Product.find(query).select('name slug brand price stock images category').populate('category', 'name').sort('stock').skip(skip).limit(Number(limit)),
      Product.countDocuments(query),
      Product.aggregate([{ $group: { _id: null,
        total: { $sum: 1 },
        out: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } },
        low: { $sum: { $cond: [{ $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', 10] }] }, 1, 0] } },
        value: { $sum: { $multiply: ['$price', '$stock'] } },
      }}]),
    ]);
    const summary = allStats[0] || { total: 0, out: 0, low: 0, value: 0 };
    res.json({ success: true, data: products, total, totalPages: Math.ceil(total / limit), summary });
  } catch (err) { next(err); }
});

router.get('/admin/inventory/export', authenticate, isAdmin, async (req, res, next) => {
  try {
    const products = await Product.find({}).select('name brand price stock').lean();
    const header = 'Name,Brand,Price,Stock\n';
    const rows = products.map(p => `"${p.name}","${p.brand || ''}",${p.price},${p.stock}`).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory.csv');
    res.send(header + rows);
  } catch (err) { next(err); }
});

router.patch('/:id/stock', authenticate, isStaff, async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined || isNaN(quantity)) return res.status(400).json({ message: 'quantity is required' });
    const product = await Product.findByIdAndUpdate(req.params.id, { stock: Number(quantity) }, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
});

router.get('/:id', optionalAuth, getProduct);

// Track product view (increments analytics.views)
router.post('/:id/view', optionalAuth, async (req, res, next) => {
  try {
    const Product = require('../models/Product');
    await Product.findByIdAndUpdate(req.params.id, { $inc: { 'analytics.views': 1 } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.post('/', authenticate, isAdmin, createProduct);
router.put('/:id', authenticate, isAdmin, updateProduct);
router.delete('/:id', authenticate, isAdmin, deleteProduct);
router.patch('/:id/restore', authenticate, isAdmin, restoreProduct);
router.post('/bulk-import', authenticate, isAdmin, bulkImport);

module.exports = router;
