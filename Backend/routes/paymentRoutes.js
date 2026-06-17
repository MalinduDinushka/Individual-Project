const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { createPayment, createPayHereCheckoutData, payhereNotify, getPaymentStatus, getPayHereConfigStatus, payHereTestComputeHash, payHereValidateSecret } = require('../controllers/paymentController');
const { debugPayHereForPayment } = require('../controllers/paymentController');

router.get('/payhere/config', getPayHereConfigStatus);

// Test helpers: compute hash and validate secret
router.post('/payhere/test/hash', payHereTestComputeHash);
router.get('/payhere/test/validate-secret', payHereValidateSecret);

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

router.post('/payhere/notify', express.urlencoded({ extended: true }), payhereNotify);

router.get('/payhere/debug/:id', protect, debugPayHereForPayment);

router.get('/:id', protect, getPaymentStatus);

module.exports = router;
