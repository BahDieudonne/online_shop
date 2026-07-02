const router = require('express').Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public customers and the SettingsContext can fetch these without auth
router.get('/:key', getSettings);

// Admin only requires login + admin role
router.put('/:key', authenticate, isAdmin, updateSettings);

module.exports = router;
