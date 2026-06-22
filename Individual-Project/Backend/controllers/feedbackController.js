const Feedback = require('../models/Feedback');
const Booking = require('../models/Booking');
const Service = require('../models/Service');

exports.createFeedback = async (req, res) => {
  try {
    const { bookingId, serviceId, providerId, rating, comment, categories = {} } = req.body;

    if (!bookingId || !serviceId || !providerId || !rating) {
      return res.status(400).json({ success: false, message: 'bookingId, serviceId, providerId and rating are required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Only the booking tourist can leave feedback and only after completion
    if (String(booking.tourist) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Only the booking owner can leave feedback' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Feedback can be left only after the booking is completed' });
    }

    const existing = await Feedback.findOne({ booking: bookingId, tourist: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Feedback for this booking already submitted' });

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    const feedback = await Feedback.create({
      booking: bookingId,
      tourist: req.user._id,
      service: serviceId,
      provider: providerId,
      rating,
      comment,
      categories
    });

    res.status(201).json({ success: true, message: 'Feedback submitted', data: { feedback } });
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit feedback', error: error.message });
  }
};

exports.getServiceFeedback = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const feedbacks = await Feedback.find({ service: serviceId }).populate('tourist', 'name avatar').sort('-createdAt').lean();

    const count = feedbacks.length;
    const avg = count === 0 ? 0 : (feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / count).toFixed(2);

    res.json({ success: true, data: { feedbacks, count, averageRating: Number(avg) } });
  } catch (error) {
    console.error('Get service feedback error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch feedback', error: error.message });
  }
};

exports.getBookingFeedback = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const feedback = await Feedback.findOne({ booking: bookingId, tourist: req.user._id }).lean();
    res.json({ success: true, data: { feedback } });
  } catch (error) {
    console.error('Get booking feedback error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch booking feedback', error: error.message });
  }
};
