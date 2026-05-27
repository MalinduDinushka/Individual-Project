const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getProviderProfile, getPackageSuggestions } = require('../controllers/userController');

router.get('/providers/:id', protect, getProviderProfile);
router.get('/package-suggestions', protect, getPackageSuggestions);

module.exports = router;
