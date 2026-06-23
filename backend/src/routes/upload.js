const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const storageService = require('../services/storageService');
const multer = require('multer');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, and WEBP images are allowed'));
    }
    cb(null, true);
  },
});

router.post('/image', authenticate, authorize('staff'), upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'No file uploaded', 400);
    const result = await storageService.uploadFile(req.file);
    return successResponse(res, result, 'Image uploaded');
  } catch (err) { next(err); }
});

router.post('/images', authenticate, authorize('staff'), upload.array('images', 10), async (req, res, next) => {
  try {
    if (!req.files?.length) return errorResponse(res, 'No files uploaded', 400);
    const results = await Promise.all(req.files.map(f => storageService.uploadFile(f)));
    return successResponse(res, results, 'Images uploaded');
  } catch (err) { next(err); }
});

router.delete('/image', authenticate, authorize('staff'), async (req, res, next) => {
  try {
    await storageService.deleteFile(req.body.publicId);
    return successResponse(res, null, 'Image deleted');
  } catch (err) { next(err); }
});

module.exports = router;
