const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  getConversations,
  getBookingMessages,
  getRequestMessages,
  sendBookingMessage,
  sendRequestMessage
} = require('../controllers/messageController');

router.get('/conversations', protect, getConversations);

router.get('/bookings/:bookingId', protect, getBookingMessages);

router.get('/requests/:requestId/providers/:providerId', protect, getRequestMessages);

router.post(
  '/bookings/:bookingId',
  protect,
  [body('message').trim().notEmpty().withMessage('Message is required')],
  sendBookingMessage
);

router.post(
  '/requests/:requestId/providers/:providerId',
  protect,
  [body('message').trim().notEmpty().withMessage('Message is required')],
  sendRequestMessage
);

module.exports = router;
