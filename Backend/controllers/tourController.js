const TourRequest = require('../models/TourRequest');
const { createNotification, createNotifications } = require('../utils/notificationService')

const ADVANCE_PAYMENT_PERCENTAGE = Number(process.env.TOUR_ADVANCE_PAYMENT_PERCENTAGE || 20);

const getAdvanceAmount = (amount) => Math.max(1, Math.round(Number(amount || 0) * ADVANCE_PAYMENT_PERCENTAGE / 100));

// @desc    Create tour request
// @route   POST /api/tours
// @access  Private (Tourist)
exports.createTourRequest = async (req, res) => {
  try {
    const tourRequest = await TourRequest.create({
      tourist: req.user._id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      message: 'Tour request created successfully',
      data: { tourRequest }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create tour request',
      error: error.message
    });
  }
};

// @desc    Get tour requests
// @route   GET /api/tours
// @access  Private
exports.getTourRequests = async (req, res) => {
  try {
    let query = {};

    // For tourists, show only their requests
    if (req.user.role === 'tourist') {
      query.tourist = req.user._id;
    }

    // For providers, show open requests
    if (req.user.role === 'provider') {
      query.status = 'open';
    }

    const tourRequests = await TourRequest.find(query)
      .populate('tourist', 'name email avatar')
      .populate('bids.provider', 'name businessInfo.businessName businessInfo.rating')
      .populate('selectedBid', 'name email businessInfo')
      .sort('-createdAt');

    res.json({
      success: true,
      data: { tourRequests, count: tourRequests.length }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tour requests',
      error: error.message
    });
  }
};

// @desc    Get tour request by ID
// @route   GET /api/tours/:id
// @access  Private
exports.getTourRequestById = async (req, res) => {
  try {
    const tourRequest = await TourRequest.findById(req.params.id)
      .populate('tourist', 'name email phone avatar')
      .populate('bids.provider', 'name email businessInfo')
      .populate('selectedBid', 'name email businessInfo');

    if (!tourRequest) {
      return res.status(404).json({
        success: false,
        message: 'Tour request not found'
      });
    }

    res.json({
      success: true,
      data: { tourRequest }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tour request',
      error: error.message
    });
  }
};

// @desc    Update tour request
// @route   PUT /api/tours/:id
// @access  Private (Tourist - owner only)
exports.updateTourRequest = async (req, res) => {
  try {
    let tourRequest = await TourRequest.findById(req.params.id);

    if (!tourRequest) {
      return res.status(404).json({
        success: false,
        message: 'Tour request not found'
      });
    }

    // Check ownership
    if (tourRequest.tourist.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this tour request'
      });
    }

    tourRequest = await TourRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Tour request updated successfully',
      data: { tourRequest }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update tour request',
      error: error.message
    });
  }
};

// @desc    Delete tour request
// @route   DELETE /api/tours/:id
// @access  Private (Tourist - owner only)
exports.deleteTourRequest = async (req, res) => {
  try {
    const tourRequest = await TourRequest.findById(req.params.id);

    if (!tourRequest) {
      return res.status(404).json({
        success: false,
        message: 'Tour request not found'
      });
    }

    // Check ownership
    if (tourRequest.tourist.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this tour request'
      });
    }

    await tourRequest.deleteOne();

    res.json({
      success: true,
      message: 'Tour request deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete tour request',
      error: error.message
    });
  }
};

// @desc    Submit bid for tour request
// @route   POST /api/tours/:id/bid
// @access  Private (Provider)
exports.submitBid = async (req, res) => {
  try {
    const tourRequest = await TourRequest.findById(req.params.id);

    if (!tourRequest) {
      return res.status(404).json({
        success: false,
        message: 'Tour request not found'
      });
    }

    if (tourRequest.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This tour request is not open for bids'
      });
    }

    // Check if provider already submitted a bid
    const existingBid = tourRequest.bids.find(
      bid => bid.provider.toString() === req.user._id.toString()
    );

    if (existingBid) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a bid for this tour request'
      });
    }

    const bid = {
      provider: req.user._id,
      message: req.body.message,
      proposedPrice: req.body.proposedPrice,
      itinerary: req.body.itinerary
    };

    tourRequest.bids.push(bid);
    await tourRequest.save();

    await createNotification({
      recipient: tourRequest.tourist,
      sender: req.user._id,
      type: 'bid-submitted',
      title: 'New bid received',
      message: `${req.user.name || 'A provider'} submitted a bid for your tour request "${tourRequest.title}".`,
      actionUrl: '/tourist/requests',
      metadata: { tourRequestId: tourRequest._id, bidProviderId: req.user._id }
    })

    res.status(201).json({
      success: true,
      message: 'Bid submitted successfully',
      data: { tourRequest }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit bid',
      error: error.message
    });
  }
};

// @desc    Accept bid
// @route   POST /api/tours/:id/accept-bid/:bidId
// @access  Private (Tourist - owner only)
exports.acceptBid = async (req, res) => {
  try {
    const tourRequest = await TourRequest.findById(req.params.id);

    if (!tourRequest) {
      return res.status(404).json({
        success: false,
        message: 'Tour request not found'
      });
    }

    // Check ownership
    if (tourRequest.tourist.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept bids for this tour request'
      });
    }

    if (tourRequest.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Only open requests can accept a bid'
      });
    }

    const bid = tourRequest.bids.id(req.params.bidId);

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    // Update bid status
    bid.status = 'accepted';
    tourRequest.selectedBid = bid.provider;
    tourRequest.status = 'awaiting-payment';
    tourRequest.advancePayment = {
      status: 'pending',
      amount: getAdvanceAmount(bid.proposedPrice),
      currency: tourRequest.budget?.currency || 'USD'
    };

    // Reject other bids
    tourRequest.bids.forEach(b => {
      if (b._id.toString() !== req.params.bidId) {
        b.status = 'rejected';
      }
    });

    await tourRequest.save();

    await createNotification({
      recipient: bid.provider,
      sender: req.user._id,
      type: 'bid-accepted',
      title: 'Your bid was accepted',
      message: `Your bid for "${tourRequest.title}" was accepted. Advance payment is now available.`,
      actionUrl: '/provider',
      metadata: { tourRequestId: tourRequest._id, bidId: bid._id }
    })

    const rejectedRecipients = tourRequest.bids
      .filter((b) => b._id.toString() !== req.params.bidId && b.provider)
      .map((b) => b.provider)

    if (rejectedRecipients.length > 0) {
      await createNotifications(rejectedRecipients, {
        sender: req.user._id,
        type: 'bid-rejected',
        title: 'Bid not selected',
        message: `A different bid was selected for "${tourRequest.title}".`,
        actionUrl: '/provider',
        metadata: { tourRequestId: tourRequest._id }
      })
    }

    res.json({
      success: true,
      message: 'Bid accepted successfully',
      data: { tourRequest }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to accept bid',
      error: error.message
    });
  }
};

// @desc    Reject bid
// @route   POST /api/tours/:id/reject-bid/:bidId
// @access  Private (Tourist - owner only)
exports.rejectBid = async (req, res) => {
  try {
    const tourRequest = await TourRequest.findById(req.params.id);

    if (!tourRequest) {
      return res.status(404).json({
        success: false,
        message: 'Tour request not found'
      });
    }

    if (tourRequest.tourist.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject bids for this tour request'
      });
    }

    const bid = tourRequest.bids.id(req.params.bidId);

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    if (bid.status === 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Accepted bids cannot be rejected'
      });
    }

    bid.status = 'rejected';

    await tourRequest.save();

    await createNotification({
      recipient: bid.provider,
      sender: req.user._id,
      type: 'bid-rejected',
      title: 'Bid rejected',
      message: `Your bid for "${tourRequest.title}" was rejected by the traveler.`,
      actionUrl: '/provider',
      metadata: { tourRequestId: tourRequest._id, bidId: bid._id }
    })

    res.json({
      success: true,
      message: 'Bid rejected successfully',
      data: { tourRequest }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject bid',
      error: error.message
    });
  }
};
