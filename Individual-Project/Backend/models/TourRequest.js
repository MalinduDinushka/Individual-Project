const mongoose = require('mongoose');

const tourRequestSchema = new mongoose.Schema({
  tourist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Tour title is required'],
    trim: true
  },
  destinations: [{
    type: String,
    required: true
  }],
  districts: [{
    type: String,
    trim: true
  }],
  locationPlan: [{
    district: {
      type: String,
      trim: true
    },
    locations: [{
      type: String,
      trim: true
    }]
  }],
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  travelers: {
    type: Number,
    required: [true, 'Number of travelers is required'],
    min: 1
  },
  visitorBreakdown: {
    male: {
      type: Number,
      default: 0,
      min: 0
    },
    female: {
      type: Number,
      default: 0,
      min: 0
    },
    kids: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  budget: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'LKR'
    }
  },
  preferences: {
    accommodation: String,
    transportation: String,
    activities: [String],
    servicesNeeded: [String],
    dietary: String,
    specialRequirements: String
  },
  status: {
    type: String,
    enum: ['open', 'awaiting-payment', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  bids: [{
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    proposedPrice: Number,
    itinerary: String,
    submittedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  }],
  selectedBid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  advancePayment: {
    status: {
      type: String,
      enum: ['not-required', 'pending', 'paid', 'failed'],
      default: 'not-required'
    },
    amount: {
      type: Number,
      default: 0
    },
      currency: {
        type: String,
        default: 'LKR'
      },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
tourRequestSchema.index({ tourist: 1, status: 1 });
tourRequestSchema.index({ destinations: 1, status: 1 });
tourRequestSchema.index({ startDate: 1 });

module.exports = mongoose.model('TourRequest', tourRequestSchema);
