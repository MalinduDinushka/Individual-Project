const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { createPayment, getPaymentStatus } = require('../controllers/paymentController');

router.post(
  '/',
  protect,
  [
    body('bookingId').isMongoId().withMessage('Valid bookingId is required'),
    body('paymentMethod').optional().isString()
  ],
  createPayment
);

router.get('/:id', protect, getPaymentStatus);

module.exports = router;
