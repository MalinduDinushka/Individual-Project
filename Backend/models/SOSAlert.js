const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema({
  tourist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    },
    address: String
  },
  emergencyType: {
    type: String,
    enum: ['medical', 'accident', 'theft', 'lost', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'in-progress', 'resolved', 'false-alarm'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'high'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: [{
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
sosAlertSchema.index({ tourist: 1, status: 1 });
sosAlertSchema.index({ status: 1, priority: -1 });
sosAlertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SOSAlert', sosAlertSchema);
