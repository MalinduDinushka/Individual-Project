const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Service type is required'],
    enum: ['villa', 'hotel', 'vehicle', 'guide', 'restaurant', 'safari', 'photographer', 'equipment', 'other']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  location: {
    address: String,
    city: String,
    province: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  pricing: {
    amount: {
      type: Number,
      required: [true, 'Price is required']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    unit: {
      type: String,
      enum: ['night', 'day', 'hour', 'trip', 'person', 'item'],
      default: 'day'
    }
  },
  capacity: {
    type: Number,
    default: 1
  },
  images: [{
    url: String,
    caption: String
  }],
  amenities: [String],
  availability: [{
    date: Date,
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for search and filtering
serviceSchema.index({ type: 1, isActive: 1, isVerified: 1 });
serviceSchema.index({ 'location.city': 1 });
serviceSchema.index({ 'pricing.amount': 1 });
serviceSchema.index({ rating: -1 });

module.exports = mongoose.model('Service', serviceSchema);
