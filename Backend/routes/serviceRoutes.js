const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Placeholder controller
router.get('/', (req, res) => {
  res.json({ message: 'Service routes - To be implemented' });
});

router.post('/', protect, authorize('provider'), (req, res) => {
  res.json({ message: 'Create service - To be implemented' });
});

module.exports = router;
