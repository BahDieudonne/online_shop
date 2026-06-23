const router = require('express').Router();
const { register, login, logout, refreshToken, forgotPassword, resetPassword, getMe, updatePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', authenticate, logout);
router.post('/refresh', refreshToken);
router.post('/forgot-password', authLimiter, forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/me', authenticate, getMe);
router.put('/update-password', authenticate, updatePassword);

module.exports = router;
