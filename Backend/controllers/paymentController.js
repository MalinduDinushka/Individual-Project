const { validationResult } = require('express-validator');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// Create a payment (simulate processing)
exports.createPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { bookingId, paymentMethod, paymentDetails } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Only booking owner can create payment
    if (booking.tourist.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to pay for this booking' });
    }

    // Create a transaction id
    const transactionId = crypto.randomBytes(12).toString('hex');

    // Create payment record (pending -> processing -> completed)
    const payment = await Payment.create({
      booking: booking._id,
      tourist: req.user._id,
      provider: booking.provider,
      amount: booking.pricing.totalAmount,
      currency: booking.pricing.currency || 'USD',
      paymentMethod: paymentMethod || 'card',
      transactionId,
      status: 'processing',
      paymentDetails: paymentDetails || {}
    });

    // Simulate external gateway response (in production integrate Stripe/PayHere)
    payment.status = 'completed';
    payment.paymentDetails.receiptUrl = payment.paymentDetails.receiptUrl || null;
    await payment.save();

    // Update booking payment status
    booking.paymentStatus = 'paid';
    booking.paymentId = payment._id;
    booking.status = 'confirmed';
    await booking.save();

    res.status(201).json({ success: true, message: 'Payment completed', data: { payment } });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ success: false, message: 'Failed to process payment', error: error.message });
  }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    // Only involved parties can view
    if (payment.tourist.toString() !== req.user._id.toString() && payment.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this payment' });
    }

    res.json({ success: true, data: { payment } });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment', error: error.message });
  }
};
