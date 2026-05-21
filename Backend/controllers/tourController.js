const TourRequest = require('../models/TourRequest');

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
      .populate('bids.provider', 'name email businessInfo');

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
    tourRequest.status = 'in-progress';

    // Reject other bids
    tourRequest.bids.forEach(b => {
      if (b._id.toString() !== req.params.bidId) {
        b.status = 'rejected';
      }
    });

    await tourRequest.save();

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
