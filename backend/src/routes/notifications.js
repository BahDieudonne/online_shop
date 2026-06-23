const router = require('express').Router();
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { successResponse } = require('../utils/apiResponse');

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const notifs = await Notification.find({ recipient: req.user._id }).sort('-createdAt').limit(50);
    const unread = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    return successResponse(res, { notifications: notifs, unread });
  } catch (err) { next(err); }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { isRead: true, readAt: new Date() });
    return successResponse(res, null, 'Marked as read');
  } catch (err) { next(err); }
});

router.patch('/read-all', async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
    return successResponse(res, null, 'All notifications marked as read');
  } catch (err) { next(err); }
});

module.exports = router;
