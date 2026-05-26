const User = require('../models/User');
const { validationResult } = require('express-validator');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Only enable Cloudinary if credentials look valid (not placeholder values)
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || ''
const cloudKey = process.env.CLOUDINARY_API_KEY || ''
const cloudSecret = process.env.CLOUDINARY_API_SECRET || ''
const useCloudinary = Boolean(
  cloudName && cloudKey && cloudSecret &&
    !cloudName.includes('your') && !cloudKey.includes('your') && !cloudSecret.includes('your') &&
    !cloudName.includes('demo')
)

if (useCloudinary) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: cloudKey,
    api_secret: cloudSecret
  });
}

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, password, role, phone, gender, nic, passport, nationality, businessInfo } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const userData = {
      name,
      email,
      password,
      role,
      phone,
      gender
    };

    // Add nationality for tourists
    if (role === 'tourist') {
      userData.nationality = nationality;
      if (nationality === 'local') {
        userData.nic = nic;
      } else if (nationality === 'foreign') {
        userData.passport = passport;
      }
    }

    // Add NIC for providers
    if (role === 'provider') {
      userData.nic = nic;
    }

    // Add business info for providers
    if (role === 'provider' && businessInfo) {
      const selectedServiceTypes = Array.isArray(businessInfo.serviceTypes)
        ? businessInfo.serviceTypes.filter(Boolean)
        : businessInfo.serviceType
          ? [businessInfo.serviceType]
          : [];

      userData.businessInfo = businessInfo;
      userData.businessInfo.serviceTypes = selectedServiceTypes;
      userData.businessInfo.serviceType = businessInfo.serviceType || selectedServiceTypes[0] || 'other';
      if (businessInfo.serviceDetails) {
        userData.businessInfo.serviceDetails = businessInfo.serviceDetails;
      }
    }

    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user and include password for verification
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isVerified: user.isVerified
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// @desc    Google OAuth authentication
// @route   POST /api/auth/google-auth
// @access  Public
exports.googleAuth = async (req, res) => {
  try {
    const { googleId, email, name, avatar } = req.body;

    // Find or create user
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        avatar: avatar || undefined,
        isVerified: true,
        role: 'tourist'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        },
        token
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed',
      error: error.message
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save();

    // In production, send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    res.json({
      success: true,
      message: 'Password reset link sent to email',
      resetUrl // Remove this in production
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process forgot password request',
      error: error.message
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password reset successful',
      data: { token }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user data',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      avatar: req.body.avatar
    };

    // Update role-specific fields
    if (req.user.role === 'tourist' && req.body.preferences) {
      fieldsToUpdate.preferences = req.body.preferences;
    }

    if (req.user.role === 'provider' && req.body.businessInfo) {
      const nextServiceTypes = Array.isArray(req.body.businessInfo.serviceTypes)
        ? req.body.businessInfo.serviceTypes.filter(Boolean)
        : req.body.businessInfo.serviceType
          ? [req.body.businessInfo.serviceType]
          : [];

      fieldsToUpdate.businessInfo = {
        ...req.user.businessInfo,
        ...req.body.businessInfo,
        serviceTypes: nextServiceTypes,
        serviceType: req.body.businessInfo.serviceType || nextServiceTypes[0] || req.user.businessInfo?.serviceType || 'other',
        serviceDetails: req.body.businessInfo.serviceDetails || req.user.businessInfo?.serviceDetails || {}
      };
    }

    if (req.user.role === 'provider' && req.body.gender) {
      fieldsToUpdate.gender = req.body.gender;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// @desc    Upload avatar image
// @route   POST /api/auth/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // If Cloudinary is configured, upload there; otherwise serve from local uploads
    let avatarUrl = null;

    if (useCloudinary) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'tourmate/avatars',
        use_filename: true,
        unique_filename: false
      });
      avatarUrl = result.secure_url;
      // remove local file
      fs.unlink(req.file.path, () => {})
    } else {
      // fallback: expose local uploads path (ensure static hosting configured)
      avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    if (req.user && req.user._id) {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { avatar: avatarUrl },
        { new: true, runValidators: true }
      ).select('-password');

      res.json({ success: true, message: 'Avatar uploaded', data: { user } });
    } else {
      // If no authenticated user (public test route), just return the avatar URL
      res.json({ success: true, message: 'Avatar uploaded', data: { avatar: avatarUrl } });
    }
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload avatar', error: error.message });
  }
}
