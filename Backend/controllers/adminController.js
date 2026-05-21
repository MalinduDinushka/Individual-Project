const User = require('../models/User');
const Booking = require('../models/Booking');
const SOSAlert = require('../models/SOSAlert');
const TourRequest = require('../models/TourRequest');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();
    
    // Get active providers (verified providers)
    const activeProviders = await User.countDocuments({ 
      role: 'provider', 
      isVerified: true 
    });
    
    // Get all providers for verification percentage
    const allProviders = await User.countDocuments({ role: 'provider' });
    const verifiedPercent = allProviders > 0 
      ? Math.round((activeProviders / allProviders) * 100) 
      : 0;

    // Get users from last week for growth calculation
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const usersGrowth = await User.countDocuments({
      createdAt: { $gte: lastWeek }
    });

    // Get total bookings for current month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const totalBookings = await Booking.countDocuments({
      createdAt: { $gte: currentMonth }
    });

    // Get active SOS alerts
    const activeSOS = await SOSAlert.countDocuments({ 
      status: { $in: ['pending', 'in-progress'] }
    });

    // Get daily bookings for last 7 days
    const bookingsData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await Booking.countDocuments({
        createdAt: { 
          $gte: date, 
          $lt: nextDate 
        }
      });

      bookingsData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        bookings: count
      });
    }

    // Get daily registrations for last 7 days
    const registrationsData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const providers = await User.countDocuments({
        role: 'provider',
        createdAt: { 
          $gte: date, 
          $lt: nextDate 
        }
      });

      const tourists = await User.countDocuments({
        role: 'tourist',
        createdAt: { 
          $gte: date, 
          $lt: nextDate 
        }
      });

      registrationsData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        providers,
        tourists
      });
    }

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          usersGrowth,
          activeProviders,
          verifiedPercent,
          totalBookings,
          activeSOS
        },
        bookingsData,
        registrationsData
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { role, verified, active, search } = req.query;
    
    let query = {};
    
    if (role) query.role = role;
    if (verified !== undefined) query.isVerified = verified === 'true';
    if (active !== undefined) query.isActive = active === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt');

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// @desc    Get pending verifications
// @route   GET /api/admin/verifications
// @access  Private/Admin
exports.getVerifications = async (req, res) => {
  try {
    const providers = await User.find({
      role: 'provider',
      $or: [
        { isVerified: false },
        { 'businessInfo.documents.status': 'pending' }
      ]
    }).select('-password').sort('-createdAt');

    const verifications = providers.map(provider => {
      const hasDocuments = provider.businessInfo?.documents?.length > 0;
      const hasPendingDocs = provider.businessInfo?.documents?.some(
        doc => doc.status === 'pending'
      );
      
      return {
        id: provider._id,
        providerName: provider.name,
        email: provider.email,
        type: provider.businessInfo?.serviceType || 'Not specified',
        location: provider.businessInfo?.location || 'Not specified',
        documents: hasDocuments ? 'Complete' : 'Pending',
        status: hasDocuments && !hasPendingDocs ? 'complete' : 'pending',
        submitted: getRelativeTime(provider.createdAt),
        createdAt: provider.createdAt,
        businessInfo: provider.businessInfo
      };
    });

    res.json({
      success: true,
      count: verifications.length,
      data: verifications
    });
  } catch (error) {
    console.error('Get verifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch verifications',
      error: error.message
    });
  }
};

// @desc    Verify or reject provider
// @route   PUT /api/admin/verify-provider/:id
// @access  Private/Admin
exports.verifyProvider = async (req, res) => {
  try {
    const { action, reason } = req.body; // action: 'approve' or 'reject'
    
    const provider = await User.findOne({ 
      _id: req.params.id, 
      role: 'provider' 
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    if (action === 'approve') {
      provider.isVerified = true;
      
      // Mark all documents as approved
      if (provider.businessInfo && provider.businessInfo.documents) {
        provider.businessInfo.documents.forEach(doc => {
          doc.status = 'approved';
        });
      }
      
      await provider.save();

      res.json({
        success: true,
        message: 'Provider verified successfully',
        data: provider
      });
    } else if (action === 'reject') {
      provider.isVerified = false;
      
      // Mark all documents as rejected
      if (provider.businessInfo && provider.businessInfo.documents) {
        provider.businessInfo.documents.forEach(doc => {
          doc.status = 'rejected';
        });
      }
      
      await provider.save();

      res.json({
        success: true,
        message: 'Provider verification rejected',
        data: provider
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid action. Use "approve" or "reject"'
      });
    }
  } catch (error) {
    console.error('Verify provider error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify provider',
      error: error.message
    });
  }
};

// Helper function to get relative time
function getRelativeTime(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }
}

module.exports = exports;
