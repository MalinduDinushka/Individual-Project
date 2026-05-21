const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Placeholder controller - will be implemented
router.get('/', protect, (req, res) => {
  res.json({ message: 'User routes - To be implemented' });
});

module.exports = router;
