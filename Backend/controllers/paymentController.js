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
const PAYHERE_MERCHANT_SECRET_ENCODING = String(process.env.PAYHERE_MERCHANT_SECRET_ENCODING || 'plain').toLowerCase();
const resolvePayHereMerchantSecret = () => {
  const secret = process.env.PAYHERE_MERCHANT_SECRET || '';

  if (PAYHERE_MERCHANT_SECRET_ENCODING !== 'base64') {
    return secret;
  }

  try {
    return Buffer.from(secret, 'base64').toString('utf8');
  } catch (error) {
    console.warn('Failed to decode PAYHERE_MERCHANT_SECRET as base64. Falling back to the raw value.');
    return secret;
  }
};
const PAYHERE_MERCHANT_SECRET = resolvePayHereMerchantSecret();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const PAYHERE_RETURN_URL = process.env.PAYHERE_RETURN_URL || `${FRONTEND_URL}/tourist/trips`;
const PAYHERE_CANCEL_URL = process.env.PAYHERE_CANCEL_URL || `${FRONTEND_URL}/tourist/requests`;
const PAYHERE_NOTIFY_URL = process.env.PAYHERE_NOTIFY_URL || 'http://localhost:5000/api/payments/payhere/notify';
const PAYHERE_CHECKOUT_URL = process.env.PAYHERE_CHECKOUT_URL || 'https://sandbox.payhere.lk/pay/checkout';

// Auto-detect if running sandbox mode (test merchant ID)
const isSandboxMode = () => {
  return String(PAYHERE_MERCHANT_ID) === '1236017' || 
         String(PAYHERE_CHECKOUT_URL || '').includes('sandbox');
};

// Log PayHere config on startup for debugging (avoid logging secrets)
if (PAYHERE_MERCHANT_ID && PAYHERE_MERCHANT_SECRET) {
  console.log('✅ PayHere Configured:', {
    merchantId: PAYHERE_MERCHANT_ID,
    secretLength: PAYHERE_MERCHANT_SECRET.length,
    encoding: PAYHERE_MERCHANT_SECRET_ENCODING,
    sandbox: isSandboxMode(),
    checkoutUrl: PAYHERE_CHECKOUT_URL
  });
} else {
  console.warn('⚠️  PayHere Not Configured:', {
    hasMerchantId: !!PAYHERE_MERCHANT_ID,
    hasSecret: !!PAYHERE_MERCHANT_SECRET,
    encoding: PAYHERE_MERCHANT_SECRET_ENCODING
  });
}

const getAdvanceAmount = (amount) => Math.max(1, Math.round(Number(amount || 0) * ADVANCE_PAYMENT_PERCENTAGE / 100));

const upperMd5 = (value) => crypto.createHash('md5').update(String(value)).digest('hex').toUpperCase();

const formatAmount = (amount) => Number(amount || 0).toFixed(2);

const normalizePayHereValue = (value) => String(value || '').trim();

const generatePayHereHash = ({
  merchantId,
  orderId,
  amount,
  currency,
  merchantSecret
}) => {
  const mId = normalizePayHereValue(merchantId);
  const oId = normalizePayHereValue(orderId);
  const amt = parseFloat(amount).toFixed(2);
  const cur = normalizePayHereValue(currency).toUpperCase();
  const secret = normalizePayHereValue(merchantSecret);

  const secretHash = upperMd5(secret);

  const hashInput =
    `${mId}${oId}${amt}${cur}${secretHash}`;

  const hash = upperMd5(hashInput);

  return { hash, hashInput };
};

const verifyPayHereSignature = (payload, merchantSecret) => {
  const mId = normalizePayHereValue(payload.merchant_id);
  const oId = normalizePayHereValue(payload.order_id);

  // PayHere may send amount/currency under different field names depending on flow
  const rawAmount = payload.payhere_amount || payload.amount || payload.payhereAmount || '';
  const payhereAmount = Number(parseFloat(String(rawAmount || '') || 0)).toFixed(2);

  const rawCurrency = payload.payhere_currency || payload.currency || payload.payhereCurrency || 'LKR';
  const payhereCurrency = normalizePayHereValue(rawCurrency).toUpperCase();

  const statusCode = normalizePayHereValue(payload.status_code || payload.status || '');

  const secretHash = upperMd5(normalizePayHereValue(merchantSecret));
  const signatureInput = `${mId}${oId}${payhereAmount}${payhereCurrency}${statusCode}${secretHash}`;
  const expected = upperMd5(signatureInput);

  const receivedRaw = payload.md5sig || payload.MD5sig || payload.md5_sig || payload.signature || '';
  const received = String(receivedRaw).toUpperCase();

  console.log('PayHere Notify Signature Debug:', {
    signatureInput: `${mId}${oId}${payhereAmount}${payhereCurrency}${statusCode}*****`,
    expected,
    received
  });

  return expected === received;
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

  const orderId = payment.transactionId;
  const checkoutCurrency = normalizePayHereValue(currency || 'LKR').toUpperCase();
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
    console.log('\n' + '='.repeat(60));
    console.log('🔍 PayHere Checkout Payload Debug');
    console.log('='.repeat(60));
    console.log('Merchant ID:', checkout.merchant_id);
    console.log('Order ID:', checkout.order_id);
    console.log('Amount:', checkout.amount);
    console.log('Currency:', checkout.currency);
    console.log('Hash:', checkout.hash);
    console.log('Hash Input:', checkout._hashInput);
    console.log('Customer Email:', checkout.email);
    console.log('Customer Phone:', checkout.phone);
    console.log('Items:', checkout.items);
    console.log('Checkout URL:', checkout.checkoutUrl);
    console.log('Return URL:', checkout.return_url);
    console.log('Notify URL:', checkout.notify_url);
    console.log('='.repeat(60) + '\n');
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

// PayHere Test Helper Endpoint: compute hash for given parameters (for testing)
exports.payHereTestComputeHash = async (req, res) => {
  try {
    const { orderId, amount, currency = 'LKR' } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ success: false, message: 'orderId and amount are required' });
    }

    if (!PAYHERE_MERCHANT_ID || !PAYHERE_MERCHANT_SECRET) {
      return res.status(503).json({ success: false, message: 'PayHere not configured' });
    }

    const { hash, hashInput } = generatePayHereHash({
      merchantId: PAYHERE_MERCHANT_ID,
      orderId,
      amount: formatAmount(amount),
      currency: normalizePayHereValue(currency).toUpperCase(),
      merchantSecret: PAYHERE_MERCHANT_SECRET
    });

    return res.json({
      success: true,
      data: {
        hash,
        hashInput,
        sandbox: isSandboxMode(),
        merchantId: PAYHERE_MERCHANT_ID,
        orderId,
        amount: formatAmount(amount),
        currency: normalizePayHereValue(currency).toUpperCase()
      }
    });
  } catch (error) {
    console.error('PayHere test hash computation error:', error);
    res.status(500).json({ success: false, message: 'Failed to compute hash', error: error.message });
  }
};

// PayHere Validate Secret Endpoint: test merchant secret validity
exports.payHereValidateSecret = async (req, res) => {
  try {
    if (!PAYHERE_MERCHANT_ID) {
      return res.status(400).json({ 
        success: false, 
        message: 'PAYHERE_MERCHANT_ID not set' 
      });
    }

    if (!PAYHERE_MERCHANT_SECRET) {
      return res.status(400).json({ 
        success: false, 
        message: 'PAYHERE_MERCHANT_SECRET not set' 
      });
    }

    // Test hash with known values
    const testOrderId = 'TEST_VALIDATION_' + Date.now();
    const testAmount = '100.00';
    const testCurrency = 'LKR';

    const { hash, hashInput } = generatePayHereHash({
      merchantId: PAYHERE_MERCHANT_ID,
      orderId: testOrderId,
      amount: testAmount,
      currency: testCurrency,
      merchantSecret: PAYHERE_MERCHANT_SECRET
    });

    const secretMd5 = upperMd5(PAYHERE_MERCHANT_SECRET);

    return res.json({
      success: true,
      configured: true,
      data: {
        merchantId: PAYHERE_MERCHANT_ID,
        secretLength: PAYHERE_MERCHANT_SECRET.length,
        secretEncoding: PAYHERE_MERCHANT_SECRET_ENCODING,
        secretMD5: secretMd5,
        testHash: {
          orderId: testOrderId,
          amount: testAmount,
          currency: testCurrency,
          hash,
          hashInput
        },
        sandbox: isSandboxMode(),
        instructions: 'Verify this hash matches PayHere test result at https://sandbox.payhere.lk'
      }
    });
  } catch (error) {
    console.error('PayHere validate secret error:', error);
    res.status(500).json({ success: false, message: 'Failed to validate secret', error: error.message });
  }
};

const findOrCreatePendingPayment = async ({ touristId, providerId, amount, currency, purpose, bookingId, tourRequestId, metadata }) => {
  // Always create a fresh pending payment for a new checkout attempt.
  // Reusing an old pending payment can cause PayHere to reject the request if the previous order_id was invalid.
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
  const configured = Boolean(PAYHERE_MERCHANT_ID && PAYHERE_MERCHANT_SECRET);
  res.json({
    success: true,
    data: {
      configured,
      gateway: 'payhere',
      checkoutUrl: PAYHERE_CHECKOUT_URL,
      returnUrl: PAYHERE_RETURN_URL,
      cancelUrl: PAYHERE_CANCEL_URL,
      notifyUrl: PAYHERE_NOTIFY_URL,
      merchantId: PAYHERE_MERCHANT_ID,
      merchantSecretEncoding: PAYHERE_MERCHANT_SECRET_ENCODING,
      sandbox: isSandboxMode(),
      testCardNumber: isSandboxMode() ? '4111111111111111' : null,
      testCardExpiry: isSandboxMode() ? 'Any future date' : null,
      testCardCVV: isSandboxMode() ? 'Any 3 digits' : null
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
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { paymentType, bookingId, tourRequestId, bidId } = req.body;

    console.log('📥 createPayHereCheckoutData called:', {
      paymentType,
      bookingId,
      tourRequestId,
      bidId,
      userId: req.user?._id
    });

    ensurePayHereConfigured();

    if (paymentType === 'booking') {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        console.log('❌ Booking not found:', bookingId);
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      if (booking.tourist.toString() !== req.user._id.toString()) {
        console.log('❌ User not authorized to pay for booking');
        return res.status(403).json({ success: false, message: 'Not authorized to pay for this booking' });
      }

      console.log('✅ Booking found, creating payment...');
      const payment = await findOrCreatePendingPayment({
        touristId: req.user._id,
        providerId: booking.provider,
        amount: booking.pricing.totalAmount,
        currency: 'LKR',
        purpose: 'booking',
        bookingId: booking._id,
        metadata: { bookingId: booking._id, gateway: 'payhere' }
      });

      console.log('✅ Payment created:', payment._id);
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

      console.log('✅ Checkout payload created and saved');
      debugLogCheckout(checkout);

      return res.status(201).json({ success: true, data: { checkout, payment } });
    }

    if (paymentType === 'tour-request-advance') {
      const tourRequest = await TourRequest.findById(tourRequestId);
      if (!tourRequest) {
        console.log('❌ Tour request not found:', tourRequestId);
        return res.status(404).json({ success: false, message: 'Tour request not found' });
      }

      if (tourRequest.tourist.toString() !== req.user._id.toString()) {
        console.log('❌ User not authorized to pay for tour request');
        return res.status(403).json({ success: false, message: 'Not authorized to pay for this tour request' });
      }

      if (tourRequest.status !== 'awaiting-payment') {
        console.log('❌ Tour request not in awaiting-payment status:', tourRequest.status);
        return res.status(400).json({ success: false, message: 'Advance payment is only available after a bid is approved' });
      }

      const bid = tourRequest.bids.id(bidId);
      if (!bid || bid.status !== 'accepted') {
        console.log('❌ Accepted bid not found');
        return res.status(400).json({ success: false, message: 'Accepted bid not found for this tour request' });
      }

      const amount = tourRequest.advancePayment?.amount || getAdvanceAmount(bid.proposedPrice);
      console.log('✅ Tour request found, creating advance payment...');
      const payment = await findOrCreatePendingPayment({
        touristId: req.user._id,
        providerId: bid.provider,
        amount,
        currency: 'LKR',
        purpose: 'tour-request-advance',
        tourRequestId: tourRequest._id,
        metadata: { tourRequestId: tourRequest._id, bidId, gateway: 'payhere' }
      });

      console.log('✅ Advance payment created:', payment._id);
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

      console.log('✅ Checkout payload created and saved');
      debugLogCheckout(checkout);

      return res.status(201).json({ success: true, data: { checkout, payment, tourRequestId: tourRequest._id } });
    }

    console.log('❌ Invalid paymentType:', paymentType);
    return res.status(400).json({ success: false, message: 'Invalid paymentType' });
  } catch (error) {
    console.error('❌ Create PayHere checkout error:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message || 'Failed to create PayHere checkout', error: error.message });
  }
};

exports.payhereNotify = async (req, res) => {
  try {
    if (!PAYHERE_MERCHANT_SECRET) {
      console.error('PayHere notify: merchant secret not configured');
      return res.status(503).send('PayHere is not configured');
    }

    const payload = req.body;

    // Log incoming webhook for debugging
    console.log('PayHere webhook received:', {
      orderId: payload.order_id,
      status: payload.status_code,
      amount: payload.payhere_amount || payload.amount,
      timestamp: new Date().toISOString()
    });

    if (!verifyPayHereSignature(payload, PAYHERE_MERCHANT_SECRET)) {
      console.warn('PayHere notify: signature verification failed', {
        orderId: payload.order_id,
        md5sig: String(payload.md5sig || '').substring(0, 16) + '...'
      });
      return res.status(400).send('Invalid signature');
    }

    console.log('PayHere notify: signature verified successfully');

    const orderId = String(payload.order_id || '');
    const payment = await Payment.findOne({
      $or: [{ gatewayOrderId: orderId }, { transactionId: orderId }]
    });
    if (!payment) {
      console.warn('PayHere notify: payment record not found', { orderId });
      return res.status(404).send('Payment not found');
    }

    console.log('PayHere notify: payment record found', {
      paymentId: payment._id,
      orderId,
      currentStatus: payment.status
    });

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
      console.log('PayHere notify: payment completed', { paymentId: payment._id });

      if (payment.booking) {
        try {
          const booking = await Booking.findById(payment.booking);
          if (booking) {
            booking.paymentStatus = 'paid';
            booking.paymentId = payment._id;
            booking.status = 'confirmed';
            await booking.save();
            console.log('PayHere notify: booking confirmed', { bookingId: booking._id });

            await createNotifications([payment.tourist, payment.provider].filter(Boolean), {
              sender: payment.provider,
              type: 'payment-completed',
              title: 'Payment completed',
              message: `Payment for booking ${booking._id} has been completed successfully.`,
              actionUrl: '/tourist/trips',
              metadata: { bookingId: booking._id, paymentId: payment._id }
            })
          }
        } catch (err) {
          console.error('PayHere notify: error processing booking', err);
        }
      }

      if (payment.tourRequest) {
        try {
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
            console.log('PayHere notify: tour request marked in-progress', { tourRequestId: tourRequest._id });

            await createNotifications([payment.tourist, payment.provider].filter(Boolean), {
              sender: payment.provider,
              type: 'payment-completed',
              title: 'Advance payment completed',
              message: `Advance payment for "${tourRequest.title}" has been completed successfully.`,
              actionUrl: '/tourist/requests',
              metadata: { tourRequestId: tourRequest._id, paymentId: payment._id }
            })
          }
        } catch (err) {
          console.error('PayHere notify: error processing tour request', err);
        }
      }
    } else if (String(payload.status_code) === '0') {
      payment.status = 'pending';
      console.log('PayHere notify: payment pending', { paymentId: payment._id });
    } else {
      payment.status = 'failed';
      console.warn('PayHere notify: payment failed', { paymentId: payment._id, statusCode: payload.status_code });

      try {
        await createNotification({
          recipient: payment.tourist,
          sender: payment.provider,
          type: 'payment-failed',
          title: 'Payment failed',
          message: 'Your payment could not be completed. Please try again or use a different method.',
          actionUrl: payment.booking ? '/tourist/trips' : '/tourist/requests',
          metadata: { paymentId: payment._id }
        })
      } catch (err) {
        console.error('PayHere notify: error sending failure notification', err);
      }
    }

    await payment.save();
    console.log('PayHere notify: payment saved successfully', { paymentId: payment._id, status: payment.status });
    return res.status(200).send('OK');
  } catch (error) {
    console.error('PayHere notify error:', error);
    // Return 200 OK even on error (PayHere will retry if not OK)
    return res.status(200).send('Error processed - retry if needed');
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
