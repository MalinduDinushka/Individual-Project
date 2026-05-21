const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register,
  login,
  googleAuth,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['tourist', 'provider']).withMessage('Invalid role')
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  login
);

router.post('/google-auth', googleAuth);

router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Valid email is required')],
  forgotPassword
);

router.put(
  '/reset-password/:resetToken',
  [body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
  resetPassword
);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);

module.exports = router;
