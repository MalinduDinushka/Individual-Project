const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllUsers,
  getVerifications,
  verifyProvider,
  updateUserStatus,
  deleteUser,
  getSOSAlerts,
  updateSOSAlert
} = require('../controllers/adminController');

// All admin routes require admin role
router.use(protect, authorize('admin'));

// Admin routes
router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/verifications', getVerifications);
router.put('/verify-provider/:id', verifyProvider);
router.get('/sos', getSOSAlerts);
router.patch('/sos/:id', updateSOSAlert);

module.exports = router;
