const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tourist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: String,
    required: true
  },
  serviceSnapshot: {
    name: String,
    type: String,
    description: String,
    pricing: {
      amount: Number,
      currency: String,
      unit: String
    },
    image: String
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // provider may be null for demo/sample services; handled in controller
  },
  tourRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TourRequest'
  },
  bookingDate: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  numberOfPeople: {
    type: Number,
    required: true,
    min: 1
  },
  pricing: {
    baseAmount: {
      type: Number,
      required: true
    },
    serviceFee: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'LKR'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  specialRequests: String,
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ tourist: 1, status: 1 });
bookingSchema.index({ provider: 1, status: 1 });
bookingSchema.index({ service: 1 });
bookingSchema.index({ 'bookingDate.startDate': 1 });

module.exports = mongoose.model('Booking', bookingSchema);
