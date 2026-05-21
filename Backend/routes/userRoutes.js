const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getProviderProfile } = require('../controllers/userController');

router.get('/providers/:id', protect, getProviderProfile);

module.exports = router;
