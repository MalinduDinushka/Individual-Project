const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  tourRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TourRequest'
  },
  tourist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  gateway: {
    type: String,
    default: 'payhere'
  },
  gatewayOrderId: {
    type: String
  },
  gatewayStatusCode: {
    type: String
  },
  gatewaySignature: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'payhere', 'card', 'bank-transfer'],
    required: true
  },
  purpose: {
    type: String,
    enum: ['booking', 'tour-request-advance'],
    default: 'booking'
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDetails: {
    cardLast4: String,
    cardBrand: String,
    receiptUrl: String
  },
  refund: {
    amount: Number,
    reason: String,
    refundedAt: Date,
    refundTransactionId: String
  },
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ booking: 1 });
paymentSchema.index({ tourRequest: 1 });
paymentSchema.index({ tourist: 1 });
paymentSchema.index({ provider: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
