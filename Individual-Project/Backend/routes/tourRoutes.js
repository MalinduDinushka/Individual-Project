const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createTourRequest,
  getTourRequests,
  getTourRequestById,
  updateTourRequest,
  deleteTourRequest,
  submitBid,
  acceptBid,
  rejectBid
} = require('../controllers/tourController');

// Tourist routes
router.post('/', protect, authorize('tourist'), createTourRequest);
router.get('/my-requests', protect, authorize('tourist'), getTourRequests);
router.get('/:id', protect, getTourRequestById);
router.put('/:id', protect, authorize('tourist'), updateTourRequest);
router.delete('/:id', protect, authorize('tourist'), deleteTourRequest);
router.post('/:id/accept-bid/:bidId', protect, authorize('tourist'), acceptBid);
router.post('/:id/reject-bid/:bidId', protect, authorize('tourist'), rejectBid);

// Provider routes
router.get('/', protect, authorize('provider'), getTourRequests);
router.post('/:id/bid', protect, authorize('provider'), submitBid);

module.exports = router;
