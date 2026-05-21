const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Placeholder controller
router.post('/', protect, (req, res) => {
  res.json({ message: 'Payment routes - To be implemented' });
});

module.exports = router;
