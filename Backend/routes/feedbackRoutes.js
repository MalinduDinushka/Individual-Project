const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const feedbackController = require('../controllers/feedbackController');

router.post('/', protect, feedbackController.createFeedback);
router.get('/service/:serviceId', feedbackController.getServiceFeedback);
router.get('/booking/:bookingId', protect, feedbackController.getBookingFeedback);

module.exports = router;
