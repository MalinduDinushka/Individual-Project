const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Placeholder controller
router.get('/', protect, (req, res) => {
  res.json({ message: 'Message routes - To be implemented' });
});

router.post('/', protect, (req, res) => {
  res.json({ message: 'Send message - To be implemented' });
});

module.exports = router;
