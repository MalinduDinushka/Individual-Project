const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Placeholder controller
router.post('/', protect, authorize('tourist'), (req, res) => {
  res.json({ message: 'Create SOS alert - To be implemented' });
});

router.get('/', protect, authorize('admin'), (req, res) => {
  res.json({ message: 'Get SOS alerts - To be implemented' });
});

module.exports = router;
