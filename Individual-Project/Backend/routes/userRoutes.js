const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getProviderProfile, getPackageSuggestions } = require('../controllers/userController');

// Public provider profile endpoint so tourists (unauthenticated users)
// can view provider business info and travel packages without logging in.
router.get('/providers/:id', getProviderProfile);
router.get('/package-suggestions', protect, getPackageSuggestions);

module.exports = router;
