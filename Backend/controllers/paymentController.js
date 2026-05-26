const { validationResult } = require('express-validator');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const TourRequest = require('../models/TourRequest');
const User = require('../models/User');

const ADVANCE_PAYMENT_PERCENTAGE = Number(process.env.TOUR_ADVANCE_PAYMENT_PERCENTAGE || 20);
const DEFAULT_PAYMENT_GATEWAY = String(process.env.DEFAULT_PAYMENT_GATEWAY || 'payhere').toLowerCase();
const PAYHERE_MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID || '';
const PAYHERE_MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET || '';
const PAYHERE_RETURN_URL = process.env.PAYHERE_RETURN_URL || 'http://localhost:3000/tourist/trips';
const PAYHERE_CANCEL_URL = process.env.PAYHERE_CANCEL_URL || 'http://localhost:3000/tourist/requests';
const PAYHERE_NOTIFY_URL = process.env.PAYHERE_NOTIFY_URL || 'http://localhost:5000/api/payments/payhere/notify';

const getAdvanceAmount = (amount) => Math.max(1, Math.round(Number(amount || 0) * ADVANCE_PAYMENT_PERCENTAGE / 100));

const upperMd5 = (value) => crypto.createHash('md5').update(String(value)).digest('hex').toUpperCase();

const formatAmount = (amount) => Number(amount || 0).toFixed(2);

const generatePayHereHash = ({ merchantId, orderId, amount, currency, merchantSecret }) => {
  const hashInput = `${merchantId}${orderId}${formatAmount(amount)}${currency}${upperMd5(merchantSecret)}`;
  return crypto.createHash('md5').update(hashInput).digest('hex').toUpperCase();
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

const buildCustomerFields = (user) => {
  const { first_name, last_name } = splitName(user?.name);

  return {
    first_name,
    last_name,
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
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
    hash: generatePayHereHash({
      merchantId: PAYHERE_MERCHANT_ID,
      orderId,
      amount: checkoutAmount,
      currency: checkoutCurrency,
      merchantSecret: PAYHERE_MERCHANT_SECRET
    }),
    ...buildCustomerFields(user),
    sandboxUrl: 'https://sandbox.payhere.lk/pay/checkout'
  };
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
    transactionId: `PH-${crypto.randomBytes(12).toString('hex')}`,
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
      returnUrl: PAYHERE_RETURN_URL,
      cancelUrl: PAYHERE_CANCEL_URL
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
    const payload = req.body;

    if (!verifyPayHereSignature(payload, PAYHERE_MERCHANT_SECRET)) {
      return res.status(400).send('Invalid signature');
    }

    const payment = await Payment.findOne({ transactionId: String(payload.order_id || '') });
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
        }
      }
    } else if (String(payload.status_code) === '0') {
      payment.status = 'pending';
    } else {
      payment.status = 'failed';
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
