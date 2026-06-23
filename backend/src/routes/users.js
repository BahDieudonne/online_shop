const router = require('express').Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

router.use(authenticate);

// Customer: update own profile
router.put('/profile', async (req, res, next) => {
  try {
    const { firstName, lastName, phone, avatar, notifications } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { firstName, lastName, phone, avatar, notifications }, { new: true, runValidators: true });
    return successResponse(res, user, 'Profile updated');
  } catch (err) { next(err); }
});

// Customer: manage addresses
router.post('/addresses', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.isDefault) user.addresses.forEach(a => { a.isDefault = false; });
    user.addresses.push(req.body);
    await user.save();
    return successResponse(res, user.addresses, 'Address added');
  } catch (err) { next(err); }
});

router.put('/addresses/:addressId', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return errorResponse(res, 'Address not found', 404);
    if (req.body.isDefault) user.addresses.forEach(a => { a.isDefault = false; });
    Object.assign(addr, req.body);
    await user.save();
    return successResponse(res, user.addresses);
  } catch (err) { next(err); }
});

router.delete('/addresses/:addressId', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId);
    await user.save();
    return successResponse(res, user.addresses);
  } catch (err) { next(err); }
});

// Admin: customers list with order stats
router.get('/admin/customers', authorize('manager'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sort = '-createdAt', search } = req.query;
    const query = { role: { $in: ['customer', 'super_admin', 'admin', 'manager', 'staff'] } };
    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName:  new RegExp(search, 'i') },
        { email:     new RegExp(search, 'i') },
        { phone:     new RegExp(search, 'i') },
      ];
    }
    const skip = (page - 1) * limit;

    // Get users + aggregate order stats in parallel
    const [users, total, orderStats] = await Promise.all([
      User.find(query).sort(sort).skip(skip).limit(Number(limit)).select('-password -refreshTokens'),
      User.countDocuments(query),
      Order.aggregate([
        { $group: {
          _id: '$customer',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$pricing.total' },
        }},
      ]),
    ]);

    // Merge order stats into user objects
    const statsMap = {};
    orderStats.forEach(s => { statsMap[s._id?.toString()] = s; });
    const data = users.map(u => {
      const stats = statsMap[u._id.toString()] || {};
      return { ...u.toObject(), orderCount: stats.orderCount || 0, totalSpent: stats.totalSpent || 0 };
    });

    return res.json({ success: true, data, total, totalPages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) { next(err); }
});

// Admin: export customers CSV
router.get('/admin/customers/export', authorize('manager'), async (req, res, next) => {
  try {
    const users = await User.find({}).select('firstName lastName email phone role createdAt').lean();
    const header = 'First Name,Last Name,Email,Phone,Role,Joined\n';
    const rows = users.map(u =>
      `${u.firstName},${u.lastName},${u.email},${u.phone || ''},${u.role},${u.createdAt?.toISOString().split('T')[0]}`
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
    res.send(header + rows);
  } catch (err) { next(err); }
});

// Admin routes
router.get('/', authorize('manager'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search, sort = '-createdAt' } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).sort(sort).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);
    return paginatedResponse(res, users, { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

router.get('/:id', authorize('staff'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 'User not found', 404);
    return successResponse(res, user);
  } catch (err) { next(err); }
});

router.patch('/:id/status', authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true });
    if (!user) return errorResponse(res, 'User not found', 404);
    return successResponse(res, user, `User ${req.body.isActive ? 'activated' : 'deactivated'}`);
  } catch (err) { next(err); }
});

module.exports = router;
