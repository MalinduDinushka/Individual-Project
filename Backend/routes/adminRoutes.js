const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllUsers,
  getVerifications,
  verifyProvider
} = require('../controllers/adminController');

// All admin routes require admin role
router.use(protect, authorize('admin'));

// Admin routes
router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/verifications', getVerifications);
router.put('/verify-provider/:id', verifyProvider);

module.exports = router;
