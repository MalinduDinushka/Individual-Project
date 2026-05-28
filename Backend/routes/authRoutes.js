const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register,
  login,
  googleAuth,
  googleExchange,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile
} = require('../controllers/authController');
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../controllers/authController');

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
// Exchange authorization code (server-side) for tokens and authenticate
router.post('/google-exchange', googleExchange);

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
// Upload avatar (multipart/form-data) - field name: avatar
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

// Public test upload route (no auth) to help debug upload issues
router.post('/avatar-public', upload.single('avatar'), uploadAvatar);

module.exports = router;
