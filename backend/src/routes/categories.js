const router = require('express').Router();
const Category = require('../models/Category');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { successResponse, errorResponse } = require('../utils/apiResponse');

router.get('/', async (req, res, next) => {
  try {
    const { tree, admin } = req.query;
    // Admin or tree view: return only root categories with nested children
    if (tree || admin) {
      const roots = await Category.find({ parent: null })
        .populate({ path: 'children', populate: { path: 'children' } })
        .sort('order');
      return successResponse(res, roots);
    }
    // Public flat list: active only
    const cats = await Category.find({ isActive: true, parent: null })
      .populate({ path: 'children', match: { isActive: true } })
      .sort('order');
    return successResponse(res, cats);
  } catch (err) { next(err); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const cat = await Category.findOne({ slug: req.params.slug, isActive: true }).populate('children');
    if (!cat) return errorResponse(res, 'Category not found', 404);
    return successResponse(res, cat);
  } catch (err) { next(err); }
});

router.post('/', authenticate, authorize('manager'), async (req, res, next) => {
  try {
    const cat = await Category.create(req.body);
    return successResponse(res, cat, 'Category created', 201);
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, authorize('manager'), async (req, res, next) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat) return errorResponse(res, 'Category not found', 404);
    return successResponse(res, cat, 'Category updated');
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    return successResponse(res, null, 'Category deleted');
  } catch (err) { next(err); }
});

module.exports = router;
