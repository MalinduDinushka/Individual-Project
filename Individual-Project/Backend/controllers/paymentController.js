const { validationResult } = require('express-validator');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const TourRequest = require('../models/TourRequest');
const { createNotification } = require('../utils/notificationService');

const ADVANCE_PAYMENT_PERCENTAGE = Number(process.env.TOUR_ADVANCE_PAYMENT_PERCENTAGE || 20);

const getAdvanceAmount = (amount) => Math.max(1, Math.round(Number(amount || 0) * ADVANCE_PAYMENT_PERCENTAGE / 100));

const getPayHereBaseUrl = () => process.env.PAYHERE_SANDBOX === 'true'
  ? 'https://sandbox.payhere.lk/pay/checkout'
  : 'https://www.payhere.lk/pay/checkout';

const getPayHereConfig = () => {
  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
  const notifyUrl = process.env.PAYHERE_NOTIFY_URL || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/webhook`;
  const returnUrl = process.env.PAYHERE_RETURN_URL || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`;
  const cancelUrl = process.env.PAYHERE_CANCEL_URL || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`;

  if (!merchantId || !merchantSecret) {
    throw new Error('PayHere credentials are not configured in environment variables.');
  }

  return { merchantId, merchantSecret, notifyUrl, returnUrl, cancelUrl };
};

const buildPayHerePayload = (payment, user) => {
  const fullName = String(user.name || '').trim() || 'Tourist Guest';
  const [first_name, ...rest] = fullName.split(' ');
  const last_name = rest.length ? rest.join(' ') : 'Guest';
  const currency = payment.currency || 'LKR';
  const amount = Number(payment.amount || 0).toFixed(2);
  const userPhone = String(user.phone || '0000000000').replace(/[^0-9]/g, '') || '0000000000';
  const address = String(user.address || 'No Address').trim();
  const city = String(user.city || 'Colombo').trim();
  const country = String(user.country || 'Sri Lanka').trim();

  const { merchantId, merchantSecret, notifyUrl, returnUrl, cancelUrl } = getPayHereConfig();

  const appendParam = (url, key, value) => {
    if (!url) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
  };

  const returnUrlWithId = appendParam(returnUrl, 'paymentId', payment._id);
  const cancelUrlWithId = appendParam(cancelUrl, 'paymentId', payment._id);

  // --- GENERATE THE REQUIRED CHECKOUT INITIALIZATION HASH ---
  const hashedSecret = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase();

  const mainString = merchantId + payment.transactionId + amount + currency + hashedSecret;

  const finalHash = crypto
    .createHash('md5')
    .update(mainString)
    .digest('hex')
    .toUpperCase();
  // ---------------------------------------------------------

  return {
    merchant_id: merchantId,
    return_url: returnUrlWithId,
    cancel_url: cancelUrlWithId,
    notify_url: notifyUrl,
    order_id: payment.transactionId,
    items: payment.purpose === 'tour-request-advance' ? 'Tour Request Advance Payment' : 'Tour Booking Payment',
    currency,
    amount,
    hash: finalHash,
    first_name,
    last_name,
    email: user.email,
    phone: userPhone,
    address,
    city,
    country,
    custom_1: payment._id.toString(),
    custom_2: payment.purpose,
    custom_3: payment.booking ? payment.booking.toString() : '',
    custom_4: payment.tourRequest ? payment.tourRequest.toString() : ''
  };
};

const findOrCreatePendingPayment = async ({ touristId, providerId, amount, currency, purpose, bookingId, tourRequestId, metadata, paymentMethod = 'manual' }) => {
  return Payment.create({
    booking: bookingId,
    tourRequest: tourRequestId,
    tourist: touristId,
    provider: providerId,
    amount,
    currency: currency || 'LKR',
    paymentMethod: String(paymentMethod || 'manual').toLowerCase(),
    gateway: String(paymentMethod || 'manual').toLowerCase(),
    transactionId: `PM${crypto.randomBytes(12).toString('hex').toUpperCase()}`,
    status: 'pending',
    purpose,
    metadata
  });
};

const findPendingPayHerePayment = async ({ touristId, bookingId, tourRequestId }) => {
  const query = {
    tourist: touristId,
    gateway: 'payhere',
    paymentMethod: 'payhere',
    status: 'pending'
  };

  if (bookingId) query.booking = bookingId;
  if (tourRequestId) query.tourRequest = tourRequestId;

  return Payment.findOne(query);
};

exports.createPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { bookingId, paymentMethod, paymentDetails } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.tourist.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to pay for this booking' });
    }

    if (booking.pricing && booking.pricing.currency && String(booking.pricing.currency).toUpperCase() !== 'LKR') {
      return res.status(400).json({ success: false, message: 'Payments are only accepted in LKR (Sri Lankan Rupee)' });
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
        gateway: paymentMethod || 'manual'
      },
      paymentMethod
    });

    res.status(201).json({ success: true, message: 'Payment created', data: { payment } });
  } catch (error) {
    console.error('Create payment error:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message || 'Failed to process payment', error: error.message });
  }
};

exports.createAdvancePayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { tourRequestId, bidId, paymentMethod, paymentDetails } = req.body;

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

    const targetCurrency = tourRequest.advancePayment?.currency || tourRequest.budget?.currency || 'LKR';
    if (String(targetCurrency).toUpperCase() !== 'LKR') {
      return res.status(400).json({ success: false, message: 'Advance payments are only accepted in LKR (Sri Lankan Rupee)' });
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
        gateway: paymentMethod || 'manual'
      },
      paymentMethod
    });

    res.status(201).json({ success: true, message: 'Advance payment created', data: { payment } });
  } catch (error) {
    console.error('Create advance payment error:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message || 'Failed to process advance payment', error: error.message });
  }
};

exports.createPayHereCheckout = async (req, res) => {
  try {
    const { bookingId, tourRequestId } = req.body;

    if (!bookingId && !tourRequestId) {
      return res.status(400).json({ success: false, message: 'bookingId or tourRequestId is required' });
    }

    let payment = null;
    let booking = null;
    let tourRequest = null;

    if (bookingId) {
      booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }
      if (booking.tourist.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to pay for this booking' });
      }

      if (booking.pricing && booking.pricing.currency && String(booking.pricing.currency).toUpperCase() !== 'LKR') {
        return res.status(400).json({ success: false, message: 'Payments for bookings are only accepted in LKR' });
      }

      payment = await findPendingPayHerePayment({ touristId: req.user._id, bookingId, tourRequestId: null });
      if (!payment) {
        payment = await Payment.create({
          booking: booking._id,
          tourist: req.user._id,
          provider: booking.provider,
          amount: booking.pricing.totalAmount,
          currency: 'LKR',
          paymentMethod: 'payhere',
          gateway: 'payhere',
          transactionId: `PH${crypto.randomBytes(12).toString('hex').toUpperCase()}`,
          status: 'pending',
          purpose: 'booking',
          metadata: {
            bookingId: booking._id,
            gateway: 'payhere'
          }
        });
      }

      booking.paymentId = payment._id;
      await booking.save();
    }

    if (tourRequestId) {
      tourRequest = await TourRequest.findById(tourRequestId);
      if (!tourRequest) {
        return res.status(404).json({ success: false, message: 'Tour request not found' });
      }
      if (tourRequest.tourist.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to pay for this tour request' });
      }
      if (tourRequest.status !== 'awaiting-payment') {
        return res.status(400).json({ success: false, message: 'Advance payment is only available after a bid is approved' });
      }

      const trCurrency = tourRequest.advancePayment?.currency || tourRequest.budget?.currency || 'LKR';
      if (String(trCurrency).toUpperCase() !== 'LKR') {
        return res.status(400).json({ success: false, message: 'Advance payments are only accepted in LKR' });
      }

      const acceptedBid = tourRequest.bids.find((bid) => bid.status === 'accepted');
      if (!acceptedBid) {
        return res.status(400).json({ success: false, message: 'Accepted bid not found for this tour request' });
      }

      payment = await findPendingPayHerePayment({ touristId: req.user._id, bookingId: null, tourRequestId });
      if (!payment) {
        payment = await Payment.create({
          tourRequest: tourRequest._id,
          tourist: req.user._id,
          provider: acceptedBid.provider,
          amount: tourRequest.advancePayment?.amount || getAdvanceAmount(acceptedBid.proposedPrice),
          currency: tourRequest.advancePayment?.currency || tourRequest.budget?.currency || 'LKR',
          paymentMethod: 'payhere',
          gateway: 'payhere',
          transactionId: `PH${crypto.randomBytes(12).toString('hex').toUpperCase()}`,
          status: 'pending',
          purpose: 'tour-request-advance',
          metadata: {
            bidId: acceptedBid._id,
            advancePercentage: ADVANCE_PAYMENT_PERCENTAGE,
            proposedPrice: acceptedBid.proposedPrice,
            gateway: 'payhere'
          }
        });
      }

      tourRequest.advancePayment.paymentId = payment._id;
      await tourRequest.save();
    }

    const payload = buildPayHerePayload(payment, req.user);

    res.status(201).json({
      success: true,
      message: 'PayHere checkout created',
      data: {
        payment,
        payHereUrl: getPayHereBaseUrl(),
        payload
      }
    });
  } catch (error) {
    console.error('Create PayHere checkout error:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message || 'Failed to create PayHere checkout', error: error.message });
  }
};

exports.getPayHereConfigInfo = async (req, res) => {
  try {
    const { merchantId, notifyUrl, returnUrl, cancelUrl } = getPayHereConfig();
    res.json({
      success: true,
      data: {
        payHereSandbox: process.env.PAYHERE_SANDBOX === 'true',
        merchantId,
        notifyUrl,
        returnUrl,
        cancelUrl,
        payHereUrl: getPayHereBaseUrl()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.handlePayHereWebhook = async (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      status_code,
      payhere_amount,
      payhere_currency,
      md5sig,
      custom_1
    } = req.body;

    if (!merchant_id || !order_id || !status_code || !payhere_amount || !payhere_currency || !md5sig || !custom_1) {
      return res.status(400).json({ success: false, message: 'Invalid PayHere webhook payload' });
    }

    const { merchantId, merchantSecret } = getPayHereConfig();

    if (merchant_id !== merchantId) {
      return res.status(400).json({ success: false, message: 'Invalid PayHere merchant ID' });
    }

    const normalizedAmount = (payhere_amount === undefined || payhere_amount === null)
      ? '0.00'
      : (Number(String(payhere_amount).replace(/[^0-9.\-]/g, '')) || 0).toFixed(2);
    const normalizedCurrency = String(payhere_currency || '').trim().toUpperCase();
    const normalizedStatus = String(status_code || '').trim();

    const dataToHash = `${merchantId}${order_id}${normalizedAmount}${normalizedCurrency}${normalizedStatus}${crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase()}`;
    const expectedMd5 = crypto.createHash('md5').update(dataToHash, 'utf8').digest('hex').toUpperCase();

    if (expectedMd5 !== String(md5sig || '').toUpperCase()) {
      console.warn('PayHere signature mismatch', {
        receivedMd5: md5sig,
        expectedMd5,
        dataToHash
      });
      return res.status(400).json({ success: false, message: 'Invalid PayHere signature' });
    }

    const payment = await Payment.findById(custom_1);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const completed = String(status_code) === '2';
    payment.status = completed ? 'completed' : 'failed';
    payment.gateway = 'payhere';
    payment.paymentMethod = 'payhere';
    payment.gatewayOrderId = order_id;
    payment.gatewayStatusCode = String(status_code);
    payment.gatewaySignature = md5sig;
    payment.paymentDetails = {
      payherePaymentId: req.body.payment_id,
      payhereStatus: req.body.status,
      payhereStatusMessage: req.body.status_text,
      payhereAmount: payhere_amount,
      payhereCurrency: payhere_currency
    };
    await payment.save();

    if (payment.booking) {
      const booking = await Booking.findById(payment.booking);
      if (booking) {
        booking.paymentStatus = completed ? 'paid' : 'failed';
        if (completed && booking.status === 'pending') {
          booking.status = 'confirmed';
        }
        booking.paymentId = payment._id;
        await booking.save();
      }
    }

    if (payment.tourRequest) {
      const tourRequest = await TourRequest.findById(payment.tourRequest);
      if (tourRequest) {
        tourRequest.advancePayment.status = completed ? 'paid' : 'failed';
        tourRequest.advancePayment.paymentId = payment._id;
        if (completed && tourRequest.status === 'awaiting-payment') {
          tourRequest.status = 'in-progress';
        }
        await tourRequest.save();
      }
    }

    // Notify the tourist (non-blocking)
    try {
      const notifTitle = completed ? 'Payment received' : 'Payment failed';
      const notifMessage = completed ? 'Your payment was received and your trip is now in progress.' : 'Your payment failed. Please contact support.';
      await createNotification({ recipient: payment.tourist, type: 'payment-completed', title: notifTitle, message: notifMessage, actionUrl: '/tourist/trips' });
    } catch (nerr) {
      console.warn('Failed to create payment notification:', nerr);
    }

    res.json({ success: true, message: 'PayHere notification processed' });
  } catch (error) {
    console.error('PayHere webhook error:', error);
    res.status(500).json({ success: false, message: 'Failed to process PayHere webhook', error: error.message });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.tourist.toString() !== req.user._id.toString() && payment.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this payment' });
    }

    res.json({ success: true, data: { payment } });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment', error: error.message });
  }
};

exports.simulatePayHerePayment = async (req, res) => {
  try {
    if (String(process.env.PAYHERE_LOCAL_SIMULATE || 'false') !== 'true') {
      return res.status(403).json({ success: false, message: 'Simulation disabled' });
    }

    const { paymentId, statusCode = '2', payhereAmount, payhereCurrency } = req.body;
    if (!paymentId) return res.status(400).json({ success: false, message: 'paymentId is required' });

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    const completed = String(statusCode) === '2';
    payment.status = completed ? 'completed' : 'failed';
    payment.gateway = 'payhere';
    payment.paymentMethod = 'payhere';
    payment.gatewayOrderId = payment.transactionId;
    payment.gatewayStatusCode = String(statusCode);
    payment.gatewaySignature = 'SIMULATED';
    payment.paymentDetails = {
      payherePaymentId: `SIM_${Date.now()}`,
      payhereStatus: completed ? 'COMPLETED' : 'FAILED',
      payhereStatusMessage: completed ? 'Simulated success' : 'Simulated failure',
      payhereAmount: payhereAmount || payment.amount,
      payhereCurrency: payhereCurrency || payment.currency || 'LKR'
    };
    await payment.save();

    if (payment.booking) {
      const booking = await Booking.findById(payment.booking);
      if (booking) {
        booking.paymentStatus = completed ? 'paid' : 'failed';
        if (completed && booking.status === 'pending') booking.status = 'confirmed';
        booking.paymentId = payment._id;
        await booking.save();
      }
    }

    if (payment.tourRequest) {
      const tourRequest = await TourRequest.findById(payment.tourRequest);
      if (tourRequest) {
        tourRequest.advancePayment.status = completed ? 'paid' : 'failed';
        tourRequest.advancePayment.paymentId = payment._id;
        if (completed && tourRequest.status === 'awaiting-payment') tourRequest.status = 'in-progress';
        await tourRequest.save();
      }
    }

    res.json({ success: true, message: 'Simulated PayHere notification processed', data: { payment } });
  } catch (error) {
    console.error('Simulate PayHere error:', error);
    res.status(500).json({ success: false, message: 'Failed to simulate PayHere notification', error: error.message });
  }
};

// Dev-only: simulate PayHere by bookingId (convenience for manual testing)
exports.simulatePayHereByBooking = async (req, res) => {
  try {
    if (String(process.env.PAYHERE_LOCAL_SIMULATE || 'false') !== 'true') {
      return res.status(403).json({ success: false, message: 'Simulation disabled' });
    }

    const { bookingId, statusCode = '2', payhereAmount, payhereCurrency } = req.body;
    if (!bookingId) return res.status(400).json({ success: false, message: 'bookingId is required' });

    const payment = await Payment.findOne({ booking: bookingId, gateway: 'payhere' });
    if (!payment) return res.status(404).json({ success: false, message: 'Pending payhere payment not found for booking' });

    const completed = String(statusCode) === '2';
    payment.status = completed ? 'completed' : 'failed';
    payment.gateway = 'payhere';
    payment.paymentMethod = 'payhere';
    payment.gatewayOrderId = payment.transactionId;
    payment.gatewayStatusCode = String(statusCode);
    payment.gatewaySignature = 'SIMULATED_BY_BOOKING';
    payment.paymentDetails = {
      payherePaymentId: `SIM_${Date.now()}`,
      payhereStatus: completed ? 'COMPLETED' : 'FAILED',
      payhereStatusMessage: completed ? 'Simulated success' : 'Simulated failure',
      payhereAmount: payhereAmount || payment.amount,
      payhereCurrency: payhereCurrency || payment.currency || 'LKR'
    };
    await payment.save();

    const booking = await Booking.findById(bookingId);
    if (booking) {
      booking.paymentStatus = completed ? 'paid' : 'failed';
      if (completed && booking.status === 'pending') booking.status = 'confirmed';
      booking.paymentId = payment._id;
      await booking.save();
    }

    res.json({ success: true, message: 'Simulated PayHere by booking processed', data: { payment } });
  } catch (error) {
    console.error('Simulate PayHere by booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to simulate PayHere by booking', error: error.message });
  }
};