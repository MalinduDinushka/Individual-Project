const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking
} = require('../controllers/bookingController');

// Create booking
router.post(
  '/',
  protect,
  [
    body('service').notEmpty().withMessage('Service ID is required'),
    body('bookingDate.startDate').isISO8601().withMessage('Valid start date required'),
    body('bookingDate.endDate').isISO8601().withMessage('Valid end date required'),
    body('numberOfPeople').optional().isInt({ min: 1 }).withMessage('Number of people must be at least 1')
  ],
  createBooking
);

// Get my bookings
router.get('/my-bookings', protect, getMyBookings);

// Get booking by id
router.get('/:id', protect, getBookingById);

// Cancel booking
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
