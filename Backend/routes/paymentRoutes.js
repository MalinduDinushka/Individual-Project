const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { createPayment, createPayHereCheckoutData, payhereNotify, getPaymentStatus, getPayHereConfigStatus } = require('../controllers/paymentController');

router.get('/payhere/config', getPayHereConfigStatus);

router.post(
  '/',
  protect,
  [
    body('bookingId').isMongoId().withMessage('Valid bookingId is required'),
    body('paymentMethod').optional().isString()
  ],
  createPayment
);

router.post(
  '/payhere/checkout-data',
  protect,
  [
    body('paymentType').isIn(['booking', 'tour-request-advance']).withMessage('Valid paymentType is required')
  ],
  createPayHereCheckoutData
);

router.post('/payhere/notify', express.urlencoded({ extended: false }), payhereNotify);

router.get('/:id', protect, getPaymentStatus);

module.exports = router;
