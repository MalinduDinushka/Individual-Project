const { validationResult } = require('express-validator');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const TourRequest = require('../models/TourRequest');
const User = require('../models/User');
const { createNotifications, createNotification } = require('../utils/notificationService')

const ADVANCE_PAYMENT_PERCENTAGE = Number(process.env.TOUR_ADVANCE_PAYMENT_PERCENTAGE || 20);
const DEFAULT_PAYMENT_GATEWAY = String(process.env.DEFAULT_PAYMENT_GATEWAY || 'payhere').toLowerCase();
const PAYHERE_MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID || '';
const PAYHERE_MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const PAYHERE_RETURN_URL = process.env.PAYHERE_RETURN_URL || `${FRONTEND_URL}/tourist/trips`;
const PAYHERE_CANCEL_URL = process.env.PAYHERE_CANCEL_URL || `${FRONTEND_URL}/tourist/requests`;
const PAYHERE_NOTIFY_URL = process.env.PAYHERE_NOTIFY_URL || 'http://localhost:5000/api/payments/payhere/notify';
const PAYHERE_CHECKOUT_URL = process.env.PAYHERE_CHECKOUT_URL || 'https://sandbox.payhere.lk/pay/checkout';

const getAdvanceAmount = (amount) => Math.max(1, Math.round(Number(amount || 0) * ADVANCE_PAYMENT_PERCENTAGE / 100));

const upperMd5 = (value) => crypto.createHash('md5').update(String(value)).digest('hex').toUpperCase();

const formatAmount = (amount) => Number(amount || 0).toFixed(2);

const generatePayHereHash = ({ merchantId, orderId, amount, currency, merchantSecret }) => {
  const mId = String(merchantId || '').trim();
  const oId = String(orderId || '').trim();
  const amt = formatAmount(amount);
  const cur = String(currency || '').trim().toUpperCase();
  const secretHash = upperMd5(String(merchantSecret || '').trim());

  const hashInput = `${mId}${oId}${amt}${cur}${secretHash}`;
  const result = crypto.createHash('md5').update(hashInput).digest('hex').toUpperCase();

  // Attach raw input for debugging (non-sensitive: merchant id and order id only)
  return { hash: result, hashInput };
};

const verifyPayHereSignature = (payload, merchantSecret) => {
  const signatureInput = `${payload.merchant_id}${payload.order_id}${payload.payhere_amount}${payload.payhere_currency}${payload.status_code}${upperMd5(merchantSecret)}`;
  const expected = crypto.createHash('md5').update(signatureInput).digest('hex').toUpperCase();
  return expected === String(payload.md5sig || '').toUpperCase();
};

const splitName = (name) => {
  const parts = String(name || 'TourMate User').trim().split(/\s+/).filter(Boolean);
  return {
    first_name: parts[0] || 'TourMate',
    last_name: parts.slice(1).join(' ') || 'User'
  };
};

const normalizeEmail = (email, fallbackId) => {
  const value = String(email || '').trim();
  if (value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return value;
  }

  return `tourmate+${String(fallbackId || 'user').replace(/[^a-zA-Z0-9]/g, '')}@example.com`;
};

const normalizePhone = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length >= 9) {
    return digits;
  }

  return '0770000000';
};

const buildCustomerFields = (user) => {
  const { first_name, last_name } = splitName(user?.name);

  return {
    first_name,
    last_name,
    email: normalizeEmail(user?.email, user?._id),
    phone: normalizePhone(user?.phone),
    address: String(user?.address || 'No address provided').trim() || 'No address provided',
    city: String(user?.city || 'Colombo').trim() || 'Colombo',
    country: user?.country || 'Sri Lanka'
  };
};

const ensurePayHereConfigured = () => {
  if (!PAYHERE_MERCHANT_ID || !PAYHERE_MERCHANT_SECRET) {
    const error = new Error('PayHere is not configured. Set PAYHERE_MERCHANT_ID and PAYHERE_MERCHANT_SECRET in the backend .env file.');
    error.statusCode = 400;
    throw error;
  }
};

const createPayHereCheckoutPayload = ({ payment, items, amount, currency, user }) => {
  ensurePayHereConfigured();

  const orderId = payment.gatewayOrderId || payment.transactionId;
  const checkoutCurrency = currency || 'LKR';
  const checkoutAmount = formatAmount(amount);

  return {
    merchant_id: PAYHERE_MERCHANT_ID,
    return_url: PAYHERE_RETURN_URL,
    cancel_url: PAYHERE_CANCEL_URL,
    notify_url: PAYHERE_NOTIFY_URL,
    order_id: orderId,
    items: String(items || 'TourMate booking'),
    amount: checkoutAmount,
    currency: checkoutCurrency,
    // generatePayHereHash now returns { hash, hashInput }
    ...(() => {
      const g = generatePayHereHash({
        merchantId: PAYHERE_MERCHANT_ID,
        orderId,
        amount: checkoutAmount,
        currency: checkoutCurrency,
        merchantSecret: PAYHERE_MERCHANT_SECRET
      });
      return { hash: g.hash, _hashInput: g.hashInput };
    })(),
    ...buildCustomerFields(user),
    checkoutUrl: PAYHERE_CHECKOUT_URL
  };
};

// Debug helper: log checkout fields (temporary)
const debugLogCheckout = (checkout) => {
  try {
    console.log('PayHere checkout payload:');
    console.log({
      merchant_id: checkout.merchant_id,
      order_id: checkout.order_id,
      amount: checkout.amount,
      currency: checkout.currency,
      hash: checkout.hash,
      _hashInput: checkout._hashInput,
      checkoutUrl: checkout.checkoutUrl
    });
  } catch (e) {
    console.error('Failed to log checkout payload', e);
  }
};

// Debug endpoint: returns computed checkout data and hash input for a payment
exports.debugPayHereForPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    // Only involved users may access
    if (String(payment.tourist) !== String(req.user._id) && String(payment.provider) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const checkout = createPayHereCheckoutPayload({ payment, items: payment.metadata?.items || 'TourMate', amount: payment.amount, currency: payment.currency || 'LKR', user: req.user });

    return res.json({ success: true, data: { checkout } });
  } catch (error) {
    console.error('Debug PayHere error:', error);
    res.status(500).json({ success: false, message: 'Failed to compute debug checkout', error: error.message });
  }
};

const findOrCreatePendingPayment = async ({ touristId, providerId, amount, currency, purpose, bookingId, tourRequestId, metadata }) => {
  const existingPayment = await Payment.findOne({
    tourist: touristId,
    purpose,
    status: 'pending',
    ...(bookingId ? { booking: bookingId } : {}),
    ...(tourRequestId ? { tourRequest: tourRequestId } : {})
  }).sort('-createdAt');

  if (existingPayment) return existingPayment;

  return Payment.create({
    booking: bookingId,
    tourRequest: tourRequestId,
    tourist: touristId,
    provider: providerId,
    amount,
    currency,
    paymentMethod: 'payhere',
    gateway: 'payhere',
    transactionId: `PH${crypto.randomBytes(12).toString('hex').toUpperCase()}`,
    status: 'pending',
    purpose,
    metadata
  });
};

const normalizeGateway = (paymentMethod) => {
  const gateway = String(paymentMethod || DEFAULT_PAYMENT_GATEWAY || 'payhere').toLowerCase();
  if (['payhere', 'stripe', 'card', 'bank-transfer'].includes(gateway)) {
    return gateway;
  }

  return DEFAULT_PAYMENT_GATEWAY || 'payhere';
};

exports.getPayHereConfigStatus = async (req, res) => {
  res.json({
    success: true,
    data: {
      configured: Boolean(PAYHERE_MERCHANT_ID && PAYHERE_MERCHANT_SECRET),
      gateway: 'payhere',
      checkoutUrl: PAYHERE_CHECKOUT_URL,
      returnUrl: PAYHERE_RETURN_URL,
      cancelUrl: PAYHERE_CANCEL_URL,
      notifyUrl: PAYHERE_NOTIFY_URL
    }
  });
};

// Create a payment (simulate processing)
exports.createPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { bookingId, paymentMethod, paymentDetails } = req.body;
    const gateway = normalizeGateway(paymentMethod);

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Only booking owner can create payment
    if (booking.tourist.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to pay for this booking' });
    }

    const payment = await findOrCreatePendingPayment({
      touristId: req.user._id,
      providerId: booking.provider,
      amount: booking.pricing.totalAmount,
      currency: 'LKR',
      purpose: 'booking',
      bookingId: booking._id,
      metadata: {
        bookingId: booking._id,
        paymentDetails: paymentDetails || {},
        gateway
      }
    });

    const checkout = createPayHereCheckoutPayload({
      payment,
      items: booking.serviceSnapshot?.name || booking.service || 'TourMate booking',
      amount: booking.pricing.totalAmount,
      currency: 'LKR',
      user: req.user
    });

      // Log checkout for debugging
      try { debugLogCheckout(checkout); } catch (e) {}

    payment.gatewayOrderId = checkout.order_id;
    payment.paymentDetails = {
      ...(payment.paymentDetails || {}),
      gateway,
      checkout
    };
    await payment.save();

    res.status(201).json({
      success: true,
      message: 'PayHere checkout created',
      data: {
        payment,
        checkout,
        gateway: 'payhere'
      }
    });
  } catch (error) {
    console.error('Create payment error:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message || 'Failed to process payment', error: error.message });
  }
};

// Create an advance payment for an accepted tour request bid
exports.createAdvancePayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { tourRequestId, bidId, paymentMethod, paymentDetails } = req.body;
    const gateway = normalizeGateway(paymentMethod);

    const tourRequest = await TourRequest.findById(tourRequestId);
    if (!tourRequest) return res.status(404).json({ success: false, message: 'Tour request not found' });

    if (tourRequest.tourist.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to pay for this tour request' });
    }

    if (tourRequest.status !== 'awaiting-payment') {
      return res.status(400).json({ success: false, message: 'Advance payment is only available after a bid is approved' });
    }

    const bid = tourRequest.bids.id(bidId);
    if (!bid || bid.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Accepted bid not found for this tour request' });
    }

    const amount = tourRequest.advancePayment?.amount || getAdvanceAmount(bid.proposedPrice);

    const payment = await findOrCreatePendingPayment({
      touristId: req.user._id,
      providerId: bid.provider,
      amount,
      currency: 'LKR',
      purpose: 'tour-request-advance',
      tourRequestId: tourRequest._id,
      metadata: {
        bidId,
        advancePercentage: ADVANCE_PAYMENT_PERCENTAGE,
        proposedPrice: bid.proposedPrice,
        paymentDetails: paymentDetails || {},
        gateway
      }
    });

    const checkout = createPayHereCheckoutPayload({
      payment,
      items: `Advance payment for ${tourRequest.title}`,
      amount,
      currency: 'LKR',
      user: req.user
    });

      // Log checkout for debugging
      try { debugLogCheckout(checkout); } catch (e) {}
    payment.gatewayOrderId = checkout.order_id;
    payment.paymentDetails = {
      ...(payment.paymentDetails || {}),
      gateway,
      checkout
    };
    await payment.save();

    res.status(201).json({
      success: true,
      message: 'PayHere checkout created',
      data: {
        payment,
        tourRequest,
        checkout,
        gateway: 'payhere'
      }
    });
  } catch (error) {
    console.error('Create advance payment error:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message || 'Failed to process advance payment', error: error.message });
  }
};

exports.createPayHereCheckoutData = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { paymentType, bookingId, tourRequestId, bidId } = req.body;

    ensurePayHereConfigured();

    if (paymentType === 'booking') {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      if (booking.tourist.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to pay for this booking' });
      }

      const payment = await findOrCreatePendingPayment({
        touristId: req.user._id,
        providerId: booking.provider,
        amount: booking.pricing.totalAmount,
        currency: 'LKR',
        purpose: 'booking',
        bookingId: booking._id,
        metadata: { bookingId: booking._id, gateway: 'payhere' }
      });

      const checkout = createPayHereCheckoutPayload({
        payment,
        items: booking.serviceSnapshot?.name || booking.service || 'TourMate booking',
        amount: booking.pricing.totalAmount,
        currency: 'LKR',
        user: req.user
      });

      payment.gatewayOrderId = checkout.order_id;
      payment.paymentDetails = { ...(payment.paymentDetails || {}), gateway: 'payhere', checkout };
      await payment.save();

      return res.status(201).json({ success: true, data: { checkout, payment } });
    }

    if (paymentType === 'tour-request-advance') {
      const tourRequest = await TourRequest.findById(tourRequestId);
      if (!tourRequest) {
        return res.status(404).json({ success: false, message: 'Tour request not found' });
      }

      if (tourRequest.tourist.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to pay for this tour request' });
      }

      if (tourRequest.status !== 'awaiting-payment') {
        return res.status(400).json({ success: false, message: 'Advance payment is only available after a bid is approved' });
      }

      const bid = tourRequest.bids.id(bidId);
      if (!bid || bid.status !== 'accepted') {
        return res.status(400).json({ success: false, message: 'Accepted bid not found for this tour request' });
      }

      const amount = tourRequest.advancePayment?.amount || getAdvanceAmount(bid.proposedPrice);
      const payment = await findOrCreatePendingPayment({
        touristId: req.user._id,
        providerId: bid.provider,
        amount,
        currency: 'LKR',
        purpose: 'tour-request-advance',
        tourRequestId: tourRequest._id,
        metadata: { tourRequestId: tourRequest._id, bidId, gateway: 'payhere' }
      });

      const checkout = createPayHereCheckoutPayload({
        payment,
        items: `Advance payment for ${tourRequest.title}`,
        amount,
        currency: 'LKR',
        user: req.user
      });

      payment.gatewayOrderId = checkout.order_id;
      payment.paymentDetails = { ...(payment.paymentDetails || {}), gateway: 'payhere', checkout };
      await payment.save();

      return res.status(201).json({ success: true, data: { checkout, payment, tourRequestId: tourRequest._id } });
    }

    return res.status(400).json({ success: false, message: 'Invalid paymentType' });
  } catch (error) {
    console.error('Create PayHere checkout error:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message || 'Failed to create PayHere checkout', error: error.message });
  }
};

exports.payhereNotify = async (req, res) => {
  try {
    if (!PAYHERE_MERCHANT_SECRET) {
      return res.status(503).send('PayHere is not configured');
    }

    const payload = req.body;

    if (!verifyPayHereSignature(payload, PAYHERE_MERCHANT_SECRET)) {
      return res.status(400).send('Invalid signature');
    }

    const orderId = String(payload.order_id || '');
    const payment = await Payment.findOne({
      $or: [{ gatewayOrderId: orderId }, { transactionId: orderId }]
    });
    if (!payment) {
      return res.status(404).send('Payment not found');
    }

    payment.gateway = 'payhere';
    payment.gatewayOrderId = String(payload.order_id || '');
    payment.gatewayStatusCode = String(payload.status_code || '');
    payment.gatewaySignature = String(payload.md5sig || '');
    payment.paymentDetails = {
      ...(payment.paymentDetails || {}),
      payhere: payload
    };

    if (String(payload.status_code) === '2') {
      payment.status = 'completed';

      if (payment.booking) {
        const booking = await Booking.findById(payment.booking);
        if (booking) {
          booking.paymentStatus = 'paid';
          booking.paymentId = payment._id;
          booking.status = 'confirmed';
          await booking.save();

          await createNotifications([payment.tourist, payment.provider].filter(Boolean), {
            sender: payment.provider,
            type: 'payment-completed',
            title: 'Payment completed',
            message: `Payment for booking ${booking._id} has been completed successfully.`,
            actionUrl: '/tourist/trips',
            metadata: { bookingId: booking._id, paymentId: payment._id }
          })
        }
      }

      if (payment.tourRequest) {
        const tourRequest = await TourRequest.findById(payment.tourRequest);
        if (tourRequest) {
          tourRequest.advancePayment = {
            status: 'paid',
            amount: payment.amount,
            currency: payment.currency,
            paymentId: payment._id
          };
          tourRequest.status = 'in-progress';
          await tourRequest.save();

          await createNotifications([payment.tourist, payment.provider].filter(Boolean), {
            sender: payment.provider,
            type: 'payment-completed',
            title: 'Advance payment completed',
            message: `Advance payment for "${tourRequest.title}" has been completed successfully.`,
            actionUrl: '/tourist/requests',
            metadata: { tourRequestId: tourRequest._id, paymentId: payment._id }
          })
        }
      }
    } else if (String(payload.status_code) === '0') {
      payment.status = 'pending';
    } else {
      payment.status = 'failed';

      await createNotification({
        recipient: payment.tourist,
        sender: payment.provider,
        type: 'payment-failed',
        title: 'Payment failed',
        message: 'Your payment could not be completed. Please try again or use a different method.',
        actionUrl: payment.booking ? '/tourist/trips' : '/tourist/requests',
        metadata: { paymentId: payment._id }
      })
    }

    await payment.save();
    return res.status(200).send('OK');
  } catch (error) {
    console.error('PayHere notify error:', error);
    return res.status(500).send('Server error');
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
