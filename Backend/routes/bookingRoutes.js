const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Placeholder controller
router.get('/', protect, (req, res) => {
  res.json({ message: 'Booking routes - To be implemented' });
});

router.post('/', protect, (req, res) => {
  res.json({ message: 'Create booking - To be implemented' });
});

module.exports = router;
