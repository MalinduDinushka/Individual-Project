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
      status: { $in: ['active', 'in-progress'] }
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

// @desc    Update user active status
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean'
      });
    }

    if (String(req.params.id) === String(req.user?._id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: await User.findById(user._id).select('-password')
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user?._id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// @desc    Get SOS alerts for admin management
// @route   GET /api/admin/sos
// @access  Private/Admin
exports.getSOSAlerts = async (req, res) => {
  try {
    const { status, priority, search } = req.query;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const alerts = await SOSAlert.find(query)
      .populate('tourist', 'name phone email avatar role')
      .populate('assignedTo', 'name email avatar role')
      .sort('-createdAt');

    const filteredAlerts = search
      ? alerts.filter((alert) => {
          const text = [
            alert.emergencyType,
            alert.description,
            alert.contactNumber,
            alert.location?.address,
            alert.tourist?.name,
            alert.tourist?.email
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          return text.includes(search.toLowerCase());
        })
      : alerts;

    res.json({
      success: true,
      count: filteredAlerts.length,
      data: filteredAlerts
    });
  } catch (error) {
    console.error('Admin SOS alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SOS alerts',
      error: error.message
    });
  }
};

// @desc    Update SOS alert status
// @route   PATCH /api/admin/sos/:id
// @access  Private/Admin
exports.updateSOSAlert = async (req, res) => {
  try {
    const { status, note } = req.body;

    const alert = await SOSAlert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'SOS alert not found'
      });
    }

    if (status) {
      alert.status = status;
      if (status === 'resolved') {
        alert.resolvedAt = new Date();
        alert.resolvedBy = req.user._id;
      } else {
        alert.resolvedAt = undefined;
        alert.resolvedBy = undefined;
      }
    }

    if (note && String(note).trim()) {
      alert.notes = alert.notes || [];
      alert.notes.push({
        admin: req.user._id,
        note: String(note).trim(),
        timestamp: new Date()
      });
    }

    await alert.save();

    const updatedAlert = await SOSAlert.findById(alert._id)
      .populate('tourist', 'name phone email avatar role')
      .populate('assignedTo', 'name email avatar role');

    try {
      const { getIo } = require('../socket');
      const io = getIo();
      if (io) {
        io.emit('sos:update', { sos: updatedAlert });
      }
    } catch (emitError) {
      console.warn('Failed to emit SOS update', emitError.message);
    }

    res.json({
      success: true,
      message: 'SOS alert updated successfully',
      data: updatedAlert
    });
  } catch (error) {
    console.error('Update SOS alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update SOS alert',
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
