const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateEmail, validatePassword } = require('../utils/validation');
const {
  register,
  login,
  googleAuth,
  googleExchange,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  verifyProvider,
  uploadVerificationDocument,
  requestVerification,
  getPendingVerifications,
  approveVerification,
  rejectVerification
} = require('../controllers/authController');
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../controllers/authController');

// Public routes
router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
    body('email').custom((value) => validateEmail(value)).withMessage('Please enter a valid email address'),
    body('password').custom((value) => validatePassword(value)).withMessage('Password must be at least 8 characters and include uppercase, lowercase, and a number'),
    body('role').isIn(['tourist', 'provider']).withMessage('Invalid role')
  ],
  register
);

router.post(
  '/login',
  [
    body('email').custom((value) => validateEmail(value)).withMessage('Please enter a valid email address'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  login
);

router.post('/google-auth', googleAuth);
// Exchange authorization code (server-side) for tokens and authenticate.
router.post('/google-exchange', googleExchange);

router.post(
  '/forgot-password',
  [body('email').custom((value) => validateEmail(value)).withMessage('Please enter a valid email address')],
  forgotPassword
);

router.put(
  '/reset-password/:resetToken',
  [body('password').custom((value) => validatePassword(value)).withMessage('Password must be at least 8 characters and include uppercase, lowercase, and a number')],
  resetPassword
);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
// Upload avatar (multipart/form-data) - field name: avatar
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

// Verification flow (user)
router.post('/verification-documents', protect, upload.single('document'), uploadVerificationDocument);
router.post('/request-verification', protect, requestVerification);

// Admin: verify provider (old endpoint)
router.put('/verify-provider/:id', protect, require('../middleware/auth').authorize('admin'), verifyProvider);

// Admin: verification requests
router.get('/verification-requests', protect, require('../middleware/auth').authorize('admin'), getPendingVerifications);
router.put('/verification-requests/:id/approve', protect, require('../middleware/auth').authorize('admin'), approveVerification);
router.put('/verification-requests/:id/reject', protect, require('../middleware/auth').authorize('admin'), rejectVerification);


// Public test upload route (no auth) to help debug upload issues
router.post('/avatar-public', upload.single('avatar'), uploadAvatar);

module.exports = router;
