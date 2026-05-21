const { validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');

// Create a booking
exports.createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { service: serviceId, serviceDetails, bookingDate, numberOfPeople = 1, specialRequests, tourRequest } = req.body;

    let service = await Service.findById(serviceId);
    let provider = null;
    let serviceSnapshot = null;

    // If service is not found in DB, fall back to provided serviceDetails (demo data)
    if (!service && serviceDetails) {
      service = serviceDetails;
      // try to find any provider in DB as a fallback
      provider = await User.findOne({ role: 'provider' }).select('_id');
      provider = provider ? provider._id : null;
      serviceSnapshot = {
        name: serviceDetails.name,
        type: serviceDetails.type,
        description: serviceDetails.description,
        pricing: serviceDetails.pricing,
        image: Array.isArray(serviceDetails.images) ? (serviceDetails.images[0]?.url || serviceDetails.images[0]) : undefined
      };
    }

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Calculate base amount based on service pricing and booking dates
    let units = 1;
    const unitType = service.pricing?.unit || 'day';
    if (bookingDate && bookingDate.startDate && bookingDate.endDate) {
      const start = new Date(bookingDate.startDate);
      const end = new Date(bookingDate.endDate);
      const msPerDay = 1000 * 60 * 60 * 24;
      const diffDays = Math.max(1, Math.ceil((end - start) / msPerDay));
      if (['night', 'day'].includes(unitType)) units = diffDays;
    }

    if (unitType === 'person') {
      units = numberOfPeople;
    }

    const baseAmount = (service.pricing.amount || 0) * units;
    const serviceFee = Math.round(baseAmount * 0.05 * 100) / 100; // 5%
    const tax = Math.round(baseAmount * 0.1 * 100) / 100; // 10%
    const totalAmount = Math.round((baseAmount + serviceFee + tax) * 100) / 100;

    const booking = await Booking.create({
      tourist: req.user._id,
      service: String(service._id || serviceId),
      serviceSnapshot: serviceSnapshot || {
        name: service.name,
        type: service.type,
        description: service.description,
        pricing: service.pricing,
        image: Array.isArray(service.images) ? (service.images[0]?.url || service.images[0]) : undefined
      },
      provider: service.provider || provider || undefined,
      tourRequest: tourRequest || undefined,
      bookingDate,
      numberOfPeople,
      pricing: {
        baseAmount,
        serviceFee,
        tax,
        totalAmount,
        currency: service.pricing.currency || 'USD'
      },
      specialRequests
    });

    res.status(201).json({ success: true, message: 'Booking created', data: { booking } });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to create booking', error: error.message });
  }
};

// Get bookings for current user (tourist or provider)
exports.getMyBookings = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'tourist') query.tourist = req.user._id;
    if (req.user.role === 'provider') query.provider = req.user._id;

    const bookings = await Booking.find(query)
      .populate('service', 'name pricing')
      .populate('tourist', 'name email')
      .populate('provider', 'name email')
      .sort('-createdAt');

    res.json({ success: true, data: { bookings, count: bookings.length } });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings', error: error.message });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service')
      .populate('tourist', 'name email')
      .populate('provider', 'name email');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Authorization: tourist or provider or admin
    if (req.user.role === 'tourist' && booking.tourist._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (req.user.role === 'provider' && booking.provider._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: { booking } });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch booking', error: error.message });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Allow tourist (owner) or provider to cancel
    if (req.user.role === 'tourist' && booking.tourist.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || 'Cancelled by user';
    booking.cancelledBy = req.user._id;
    booking.cancelledAt = new Date();

    await booking.save();

    res.json({ success: true, message: 'Booking cancelled', data: { booking } });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel booking', error: error.message });
  }
};
