const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const {
  register, login, refresh, logout,
  forgotPassword, resetPassword,
} = require('../controllers/authController');

router.post('/register', [
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
], validate, register);

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], validate, login);

router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', [body('email').isEmail()], validate, forgotPassword);
router.patch('/reset-password/:token', [
  body('password').isLength({ min: 8 }),
], validate, resetPassword);

module.exports = router;
