const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { createPayment, createAdvancePayment, getPaymentStatus, createPayHereCheckout, handlePayHereWebhook, getPayHereConfigInfo, simulatePayHerePayment, simulatePayHereByBooking } = require('../controllers/paymentController');

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
  '/advance',
  protect,
  [
    body('tourRequestId').isMongoId().withMessage('Valid tourRequestId is required'),
    body('bidId').isMongoId().withMessage('Valid bidId is required'),
    body('paymentMethod').optional().isString()
  ],
  createAdvancePayment
);

router.get('/debug', getPayHereConfigInfo);
router.post('/checkout', protect, createPayHereCheckout);
router.post('/webhook', handlePayHereWebhook);
// Dev-only simulation endpoint (enabled via PAYHERE_LOCAL_SIMULATE=true)
if (process.env.PAYHERE_LOCAL_SIMULATE === 'true') {
  router.post('/simulate', simulatePayHerePayment);
  router.post('/simulate-by-booking', simulatePayHereByBooking);
} else {
  router.post('/simulate', protect, simulatePayHerePayment);
  router.post('/simulate-by-booking', protect, simulatePayHereByBooking);
}
router.get('/:id', protect, getPaymentStatus);

module.exports = router;
