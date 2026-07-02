// controllers/productController.js
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const AuditLog = require('../models/AuditLog');

// GET /api/products public, with filtering/sorting/pagination
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1, limit = 20, sort = '-createdAt',
      category, subcategory, brand, status = 'published',
      minPrice, maxPrice, inStock, search, tags,
      isFeatured, isNewArrival, isBestSeller, isFlashSale,
    } = req.query;

    const filter = { deletedAt: null };

    // Public always gets published only; admin can pass other statuses
    if (req.user?.role && ['admin', 'super_admin', 'manager', 'staff'].includes(req.user.role)) {
      if (status) filter.status = status;
    } else {
      filter.status = 'published';
    }

    if (category) {
      // Accept either a MongoDB ObjectId or a slug
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.category = category;
      } else {
        const cat = await Category.findOne({ slug: category }).select('_id');
        if (cat) filter.category = cat._id;
        else filter.category = null; // no match → return empty
      }
    }
    if (subcategory) filter.subcategory = subcategory;
    if (brand) filter.brand = new RegExp(brand, 'i');
    if (isFeatured) filter.isFeatured = true;
    if (isNewArrival) filter.isNewArrival = true;
    if (isBestSeller) filter.isBestSeller = true;
    if (isFlashSale) filter.isFlashSale = true;
    if (inStock === 'true') filter.stock = { $gt: 0 };
    if (tags) filter.tags = { $in: tags.split(',') };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: {
        total, page: Number(page), limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

// GET /api/products/:id by ID or slug
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id, deletedAt: null }
      : { slug: id, deletedAt: null };

    const product = await Product.findOne(filter)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('createdBy', 'firstName lastName');

    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.status !== 'published' && !req.user?.role?.includes('admin')) {
      return res.status(403).json({ message: 'Product not available' });
    }

    // Increment view count (non-blocking)
    Product.findByIdAndUpdate(product._id, { $inc: { 'analytics.views': 1 } }).exec();

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};

// POST /api/products Admin only
exports.createProduct = async (req, res) => {
  try {
    const productData = { ...req.body, createdBy: req.user._id };

    // Auto-generate slug from name
    productData.slug = productData.name
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Ensure slug uniqueness
    let slug = productData.slug;
    let count = 0;
    while (await Product.findOne({ slug })) {
      count++;
      slug = `${productData.slug}-${count}`;
    }
    productData.slug = slug;

    const product = await Product.create(productData);

    await AuditLog.create({
      user: req.user._id, userEmail: req.user.email,
      action: 'PRODUCT_CREATED', resource: 'Product',
      resourceId: product._id, changes: { after: product.toObject() },
      ip: req.ip,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create product', error: err.message });
  }
};

// PUT /api/products/:id Admin only
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, deletedAt: null });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const before = product.toObject();
    Object.assign(product, req.body);
    product.updatedBy = req.user._id;
    await product.save();

    await AuditLog.create({
      user: req.user._id, userEmail: req.user.email,
      action: 'PRODUCT_UPDATED', resource: 'Product',
      resourceId: product._id, changes: { before, after: product.toObject() },
      ip: req.ip,
    });

    res.json(product);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update product', error: err.message });
  }
};

// DELETE /api/products/:id soft delete
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, deletedAt: null });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.deletedAt = new Date();
    product.status = 'archived';
    await product.save();

    await AuditLog.create({
      user: req.user._id, userEmail: req.user.email,
      action: 'PRODUCT_DELETED', resource: 'Product', resourceId: product._id,
      ip: req.ip, severity: 'warning',
    });

    res.json({ message: 'Product archived successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

// GET /api/products/search/autocomplete
exports.autocomplete = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);

    const products = await Product.find({
      status: 'published', deletedAt: null,
      $text: { $search: q },
    }).select('name images price discountPrice slug').limit(8).lean();

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Search failed' });
  }
};

// PATCH /api/products/:id/restore restore soft-deleted
exports.restoreProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, deletedAt: { $ne: null } },
      { deletedAt: null, status: 'draft' },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found in trash' });
    res.json({ message: 'Product restored', product });
  } catch (err) {
    res.status(500).json({ message: 'Failed to restore product' });
  }
};

// POST /api/products/bulk-import CSV/Excel import
exports.bulkImport = async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'No products to import' });
    }

    const results = { created: 0, errors: [] };
    for (const p of products) {
      try {
        p.createdBy = req.user._id;
        p.slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await Product.create(p);
        results.created++;
      } catch (e) {
        results.errors.push({ name: p.name, error: e.message });
      }
    }

    res.json({ message: `Imported ${results.created} products`, ...results });
  } catch (err) {
    res.status(500).json({ message: 'Bulk import failed' });
  }
};

// POST /api/products/:id/view track product view (fire-and-forget, no auth required)
exports.trackView = async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { $inc: { 'analytics.views': 1 } });
    res.json({ success: true });
  } catch {
    res.json({ success: true }); // never fail on tracking
  }
};
