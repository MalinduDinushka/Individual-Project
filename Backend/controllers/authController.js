const User = require('../models/User');
const { validationResult } = require('express-validator');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const { createNotification } = require('../utils/notificationService');
const { getIo } = require('../socket');
const { validateEmail, validateName, validatePhone, validateProfileUpdatePayload, validateRegistrationPayload } = require('../utils/validation');

const parseTravelPackages = (travelPackages) => {
  if (!travelPackages) return undefined

  const parsePackageImages = (images) => {
    if (!images) return []
    const items = Array.isArray(images) ? images : [images]
    return items
      .flatMap((item) => {
        if (!item) return []

        // If item is a string that looks like JSON, try to parse it
        if (typeof item === 'string') {
          const trimmed = item.trim()
          if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
            try {
              const parsed = JSON.parse(trimmed)
              if (Array.isArray(parsed)) return parsed
              if (parsed && typeof parsed === 'object') return [parsed]
            } catch (e) {
              // not JSON, fallthrough to treat as single URL string
            }
          }
          const url = String(item || '').trim()
          return url ? [{ url }] : []
        }

        if (typeof item !== 'object') return []

        const url = String(item.url || item.src || '').trim()
        if (!url) return []

        const label = String(item.label || item.caption || '').trim()
        const type = String(item.type || '').trim()

        return [{
          url,
          ...(label ? { label } : {}),
          ...(type ? { type } : {})
        }]
      })
      .filter(Boolean)
  }

  const items = Array.isArray(travelPackages) ? travelPackages : []
  const normalized = items
    .map((item) => {
      if (!item || typeof item !== 'object') return null

      const serviceType = String(item.serviceType || '').trim()
      const title = String(item.title || '').trim()
      const description = String(item.description || '').trim()
      const includedDistricts = Array.isArray(item.includedDistricts)
        ? item.includedDistricts.map((district) => String(district || '').trim()).filter(Boolean)
        : String(item.includedDistricts || '')
            .split(',')
            .map((district) => district.trim())
            .filter(Boolean)
      const highlights = Array.isArray(item.highlights)
        ? item.highlights.map((highlight) => String(highlight || '').trim()).filter(Boolean)
        : String(item.highlights || '')
            .split(',')
            .map((highlight) => highlight.trim())
            .filter(Boolean)
      const foodImages = parsePackageImages(item.foodImages)
      const images = parsePackageImages(item.images)
      const details = item.details && typeof item.details === 'object' ? item.details : {}
      const amount = Number(item.price?.amount)
      const currency = String(item.price?.currency || 'USD').trim() || 'USD'

      if (!title && !description && includedDistricts.length === 0 && !Number.isFinite(amount) && !String(item.duration || '').trim() && highlights.length === 0 && images.length === 0 && foodImages.length === 0 && Object.keys(details).length === 0) {
        return null
      }

      return {
        serviceType: serviceType || undefined,
        title,
        description,
        includedDistricts,
        duration: String(item.duration || '').trim(),
        highlights,
        details,
        foodImages,
        images,
        price: Number.isFinite(amount) ? { amount, currency } : undefined
      }
    })
    .filter(Boolean)

  return normalized.length > 0 ? normalized : []
}

const parsePhotos = (photos) => {
  if (!photos) return undefined

  let items = photos

  if (typeof items === 'string') {
    const trimmed = items.trim()
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        items = JSON.parse(trimmed)
      } catch (error) {
        items = trimmed.split(',').map((value) => value.trim()).filter(Boolean)
      }
    } else {
      items = trimmed.split(',').map((value) => value.trim()).filter(Boolean)
    }
  }

  const normalizedItems = Array.isArray(items) ? items : [items]
  const normalized = normalizedItems
    .map((item) => {
      if (!item) return null

      if (typeof item === 'string') {
        const url = String(item || '').trim()
        return url ? { url } : null
      }

      if (typeof item !== 'object') return null

      const url = String(item.url || item.src || '').trim()
      if (!url) return null

      const label = String(item.label || item.caption || '').trim()
      const type = String(item.type || '').trim()

      return {
        url,
        ...(label ? { label } : {}),
        ...(type ? { type } : {})
      }
    })
    .filter(Boolean)

  return normalized.length > 0 ? normalized : []
}

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

    const { name, email, password, role, phone, gender, nic, passport, nationality, businessInfo, languages, photos, travelPackages } = req.body;

    const registrationValidation = validateRegistrationPayload(req.body, role);
    if (!registrationValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: registrationValidation.errors
      });
    }

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

      const nextTravelPackages = parseTravelPackages(travelPackages || businessInfo.travelPackages)
      if (nextTravelPackages) {
        userData.businessInfo.travelPackages = nextTravelPackages
      }
    }

    // Add languages and photos (optional)
    if (languages) {
      userData.languages = Array.isArray(languages) ? languages : String(languages).split(',').map(s => s.trim()).filter(Boolean)
    }

    const nextPhotos = parsePhotos(photos)
    if (nextPhotos && nextPhotos.length === 0) {
      nextPhotos.length = 0
    }

    const user = await User.create(userData);

    if (nextPhotos && nextPhotos.length > 0) {
      await User.collection.updateOne(
        { _id: user._id },
        { $set: { photos: nextPhotos } }
      );
    }

    // Fetch full user without password for response
    const finalUser = await User.findById(user._id).select('-password');

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: finalUser,
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

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

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

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
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
const { OAuth2Client } = require('google-auth-library')

exports.googleAuth = async (req, res) => {
  try {
    console.log('googleAuth called with body keys:', Object.keys(req.body))
    // Accept either an idToken (credential) or legacy googleId/email payload
    const { idToken, googleId, email, name, avatar } = req.body

    let payload = null

    if (idToken) {
      const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID
      if (!clientId) {
        console.error('googleAuth: missing server GOOGLE_CLIENT_ID')
        return res.status(400).json({ success: false, message: 'Google client ID not configured on server' })
      }
      const client = new OAuth2Client(clientId)
      try {
        const ticket = await client.verifyIdToken({ idToken, audience: clientId })
        payload = ticket.getPayload()
        console.log('googleAuth: token payload sub=', payload?.sub, 'email=', payload?.email)
      } catch (verifyErr) {
        console.error('googleAuth: token verification failed', verifyErr && verifyErr.message)
        return res.status(400).json({ success: false, message: 'Invalid Google id token', error: verifyErr.message })
      }
    }

    // Fallback to provided fields
    const finalGoogleId = (payload && payload.sub) || googleId
    const finalEmail = (payload && payload.email) || email
    const finalName = (payload && payload.name) || name
    const finalAvatar = (payload && payload.picture) || avatar
    // Role must be supplied by client (tourist or provider); default to tourist
    const requestedRole = String(req.body.role || 'tourist').toLowerCase()
    const role = ['tourist', 'provider'].includes(requestedRole) ? requestedRole : 'tourist'

    if (!finalEmail) {
      return res.status(400).json({ success: false, message: 'Email is required from Google' })
    }

    // Find or create user
    let user = await User.findOne({ $or: [{ googleId: finalGoogleId }, { email: finalEmail }] })

    if (user) {
      // Prevent role switching on existing accounts via OAuth: if client requests a different role, reject
      if (role && user.role && user.role !== role) {
        return res.status(400).json({ success: false, message: 'Account role mismatch. Please login using your existing account or contact support to change your role.' })
      }

      // Update Google ID if provided and not set (use raw update to avoid validation errors on existing accounts)
      if (finalGoogleId && !user.googleId) {
        try {
          await User.collection.updateOne({ _id: user._id }, { $set: { googleId: finalGoogleId } })
          // reload user
          user = await User.findById(user._id)
        } catch (updateErr) {
          console.error('googleAuth: failed to update existing user googleId', updateErr && updateErr.message)
        }
      }
    } else {
      // Create new user from authorization-code exchange; insert raw doc to avoid strict validation
      const raw = {
        name: finalName || 'Google User',
        email: finalEmail,
        googleId: finalGoogleId,
        avatar: finalAvatar || undefined,
        isVerified: role === 'tourist',
        role,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      try {
        await User.collection.insertOne(raw)
      } catch (insertErr) {
        console.error('googleAuth: raw insert failed', insertErr && insertErr.message)
        return res.status(500).json({ success: false, message: 'Failed to create user' })
      }
      user = await User.findOne({ email: finalEmail })
    }

    const token = generateToken(user._id)
    const userResponse = user.toObject()
    delete userResponse.password

    res.json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user: userResponse,
        token
      }
    })
  } catch (error) {
    console.error('Google auth error:', error)
    res.status(500).json({ success: false, message: 'Google authentication failed', error: error.message })
  }
}

// @desc    Exchange authorization code from Google (server-side)
// @route   POST /api/auth/google-exchange
// @access  Public
exports.googleExchange = async (req, res) => {
  try {
    const { code, redirectUri } = req.body

    if (!code) return res.status(400).json({ success: false, message: 'Authorization code is required' })

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return res.status(400).json({ success: false, message: 'Server Google client credentials not configured' })
    }

    const redirect = redirectUri || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/callback`

    const client = new OAuth2Client(clientId, clientSecret, redirect)
    // exchange code for tokens
    const { tokens } = await client.getToken(code)
    if (!tokens || !tokens.id_token) {
      return res.status(400).json({ success: false, message: 'Failed to obtain id_token from Google' })
    }

    // verify id token
    const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: clientId })
    const payload = ticket.getPayload()

    const finalGoogleId = payload && payload.sub
    const finalEmail = payload && payload.email
    const finalName = payload && payload.name
    const finalAvatar = payload && payload.picture

    if (!finalEmail) {
      return res.status(400).json({ success: false, message: 'Email is required from Google' })
    }

    const requestedRole = String(req.body.role || 'tourist').toLowerCase()
    const role = ['tourist', 'provider'].includes(requestedRole) ? requestedRole : 'tourist'

    // Find or create user
    let user = await User.findOne({ $or: [{ googleId: finalGoogleId }, { email: finalEmail }] })

    if (user) {
      // Prevent role switching via OAuth
      if (role && user.role && user.role !== role) {
        return res.status(400).json({ success: false, message: 'Account role mismatch. Please login using your existing account or contact support to change your role.' })
      }

      if (finalGoogleId && !user.googleId) {
        try {
          await User.collection.updateOne({ _id: user._id }, { $set: { googleId: finalGoogleId } })
          user = await User.findById(user._id)
        } catch (updateErr) {
          console.error('googleExchange: failed to update existing user googleId', updateErr && updateErr.message)
        }
      }
    } else {
      user = await User.create({
        name: finalName || 'Google User',
        email: finalEmail,
        googleId: finalGoogleId,
        avatar: finalAvatar || undefined,
        isVerified: role === 'tourist',
        role,
        nationality: 'local'
      })
    }

    const token = generateToken(user._id)
    const userResponse = user.toObject()
    delete userResponse.password

    res.json({
      success: true,
      message: 'Google exchange successful',
      data: {
        user: userResponse,
        token
      }
    })
  } catch (error) {
    console.error('Google exchange error:', error)
    res.status(500).json({ success: false, message: 'Google exchange failed', error: error.message })
  }
}

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

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

// @desc    Verify provider account (admin only)
// @route   PUT /api/auth/verify-provider/:id
// @access  Private (admin)
exports.verifyProvider = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role !== 'provider') return res.status(400).json({ success: false, message: 'User is not a provider' });

    user.isVerified = true;
    // Optionally update any provider documents status here
    await user.save();

    res.json({ success: true, message: 'Provider account verified', data: { user: { id: user._id, isVerified: user.isVerified } } });
  } catch (error) {
    console.error('Verify provider error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify provider', error: error.message });
  }
};

// @desc    Upload verification document (tourist or provider)
// @route   POST /api/auth/verification-documents
// @access  Private
exports.uploadVerificationDocument = async (req, res) => {
  try {
    const { documentType } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    if (!documentType || !['passport', 'nic', 'business_registration', 'tax_id'].includes(documentType)) {
      return res.status(400).json({ success: false, message: 'Invalid documentType' });
    }

    // Validate document type matches user role
    if (req.user.role === 'tourist' && documentType !== 'passport') {
      return res.status(400).json({ success: false, message: 'Tourists must upload passport documents' });
    }
    if (req.user.role === 'provider' && documentType !== 'nic') {
      return res.status(400).json({ success: false, message: 'Providers must upload NIC documents' });
    }

    let documentUrl = '';

    // Try to upload to Cloudinary if configured
    if (useCloudinary) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'tourmate/verifications',
          resource_type: 'auto',
          public_id: `${req.user._id}_${documentType}_${Date.now()}`
        });
        documentUrl = result.secure_url;
        // Remove temp file
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      } catch (cloudinaryErr) {
        console.error('Cloudinary upload failed, using local path', cloudinaryErr);
        documentUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      }
    } else {
      // Ensure file on disk has proper extension so browser can preview inline
      try {
        const ext = path.extname(file.originalname) || '';
        if (ext && !file.filename.endsWith(ext)) {
          const newName = file.filename + ext;
          const newPath = path.join(path.dirname(file.path), newName);
          fs.renameSync(file.path, newPath);
          documentUrl = `${req.protocol}://${req.get('host')}/uploads/${newName}`;
        } else {
          documentUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
        }
      } catch (renameErr) {
        console.error('Failed to rename uploaded file to include extension', renameErr);
        documentUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      }
    }

    // Find or add document to user's verificationDocuments
    const user = await User.findById(req.user._id);
    const existingDocIndex = user.verificationDocuments.findIndex(d => d.documentType === documentType);

    if (existingDocIndex >= 0) {
      user.verificationDocuments[existingDocIndex] = {
        documentType,
        url: documentUrl,
        status: 'pending',
        uploadedAt: new Date()
      };
    } else {
      user.verificationDocuments.push({
        documentType,
        url: documentUrl,
        status: 'pending',
        uploadedAt: new Date()
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: { document: { documentType, url: documentUrl, status: 'pending' } }
    });
  } catch (error) {
    console.error('Upload verification document error:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: 'Failed to upload document', error: error.message });
  }
};

// @desc    Request verification (tourist or provider submits for admin review)
// @route   POST /api/auth/request-verification
// @access  Private
exports.requestVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Check if user has uploaded required documents
    const requiredType = user.role === 'tourist' ? 'passport' : 'nic';
    const hasRequiredDoc = user.verificationDocuments.some(d => d.documentType === requiredType && d.url);

    if (!hasRequiredDoc) {
      return res.status(400).json({ success: false, message: `Please upload your ${requiredType} first` });
    }

    // Mark as pending verification
    user.verificationStatus = 'pending';
    user.verificationRequestedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Verification request submitted. Admin will review your documents.',
      data: { verificationStatus: user.verificationStatus, requestedAt: user.verificationRequestedAt }
    });
  } catch (error) {
    console.error('Request verification error:', error);
    res.status(500).json({ success: false, message: 'Failed to request verification', error: error.message });
  }
};

// @desc    Get pending verifications (admin only)
// @route   GET /api/admin/verification-requests
// @access  Private (admin)
exports.getPendingVerifications = async (req, res) => {
  try {
    const pending = await User.find({ verificationStatus: 'pending' })
      .select('_id name email role verificationStatus verificationRequestedAt verificationDocuments')
      .sort({ verificationRequestedAt: -1 });

    // Ensure verification document URLs are absolute so frontend opens backend files
    const hostPrefix = `${req.protocol}://${req.get('host')}`;
    const transformed = pending.map((u) => {
      const obj = u.toObject ? u.toObject() : u;
      if (Array.isArray(obj.verificationDocuments)) {
        obj.verificationDocuments = obj.verificationDocuments.map((doc) => {
          if (!doc || !doc.url) return doc;
          const url = String(doc.url || '');
          if (url.startsWith('http://') || url.startsWith('https://')) return doc;
          if (url.startsWith('/')) {
            return { ...doc, url: hostPrefix + url };
          }
          // If it's a relative filename (no leading slash), assume uploads path
          if (!url.startsWith('http')) {
            return { ...doc, url: hostPrefix + '/uploads/' + url };
          }
          return doc;
        });
      }

      return obj;
    });

    res.json({ success: true, data: { pending: transformed, total: transformed.length } });
  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pending verifications', error: error.message });
  }
};

// @desc    Approve user verification (admin only)
// @route   PUT /api/admin/verification-requests/:id/approve
// @access  Private (admin)
exports.approveVerification = async (req, res) => {
  try {
    const { notes } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.verificationStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending verifications can be approved' });
    }

    user.verificationStatus = 'verified';
    user.isVerified = true;
    user.verificationReviewedAt = new Date();
    user.verificationReviewer = req.user._id;
    user.verificationNotes = notes || 'Approved by admin';

    // Mark all documents as approved
    user.verificationDocuments.forEach(doc => {
      doc.status = 'approved';
      doc.reviewedAt = new Date();
      doc.reviewedBy = req.user._id;
    });

    await user.save();

    // Create a notification for the user
    try {
      await createNotification({
        recipient: user._id,
        title: 'Verification Approved',
        message: 'Your account verification has been approved by an admin',
        actionUrl: '/profile',
        metadata: { verificationStatus: user.verificationStatus }
      });
    } catch (notifErr) {
      console.error('Failed to create verification notification:', notifErr);
    }

    // Emit socket event directly as well
    try {
      const io = getIo();
      if (io) {
        io.to(String(user._id)).emit('verification:updated', {
          userId: String(user._id),
          verificationStatus: user.verificationStatus,
          isVerified: user.isVerified
        });
      }
    } catch (emitErr) {
      console.error('Failed to emit verification update via socket:', emitErr);
    }

    res.json({
      success: true,
      message: 'User verification approved',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          verificationStatus: user.verificationStatus,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Approve verification error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve verification', error: error.message });
  }
};

// @desc    Reject user verification (admin only)
// @route   PUT /api/admin/verification-requests/:id/reject
// @access  Private (admin)
exports.rejectVerification = async (req, res) => {
  try {
    const { notes } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.verificationStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending verifications can be rejected' });
    }

    user.verificationStatus = 'rejected';
    user.isVerified = false;
    user.verificationReviewedAt = new Date();
    user.verificationReviewer = req.user._id;
    user.verificationNotes = notes || 'Rejected by admin';

    // Mark documents as rejected
    user.verificationDocuments.forEach(doc => {
      doc.status = 'rejected';
      doc.reviewedAt = new Date();
      doc.reviewedBy = req.user._id;
      doc.notes = notes || 'Document rejected';
    });

    await user.save();

    // Notify user
    try {
      await createNotification({
        recipient: user._id,
        title: 'Verification Rejected',
        message: 'Your account verification was rejected by an admin',
        actionUrl: '/profile',
        metadata: { verificationStatus: user.verificationStatus }
      });
    } catch (notifErr) {
      console.error('Failed to create rejection notification:', notifErr);
    }

    // Emit socket event
    try {
      const io = getIo();
      if (io) {
        io.to(String(user._id)).emit('verification:updated', {
          userId: String(user._id),
          verificationStatus: user.verificationStatus,
          isVerified: user.isVerified
        });
      }
    } catch (emitErr) {
      console.error('Failed to emit verification rejection via socket:', emitErr);
    }

    res.json({
      success: true,
      message: 'User verification rejected',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          verificationStatus: user.verificationStatus,
          isVerified: user.isVerified,
          verificationNotes: user.verificationNotes
        }
      }
    });
  } catch (error) {
    console.error('Reject verification error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject verification', error: error.message });
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
    // Debug: log incoming request context for troubleshooting
    try {
      console.log('UpdateProfile called by user:', req.user?._id, 'role:', req.user?.role);
      console.log('UpdateProfile payload:', JSON.stringify(req.body).slice(0, 2000));
    } catch (logErr) {
      console.warn('Failed to stringify update-profile payload for logging', logErr);
    }
    const fieldsToUpdate = {};

    const profileValidation = validateProfileUpdatePayload(req.body, req.user.role);
    if (!profileValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: profileValidation.errors
      });
    }

    if (req.body.name !== undefined) {
      fieldsToUpdate.name = req.body.name;
    }

    if (req.body.phone !== undefined) {
      fieldsToUpdate.phone = req.body.phone;
    }

    if (req.body.avatar !== undefined) {
      fieldsToUpdate.avatar = req.body.avatar;
    }

    // Update role-specific fields
    if (req.user.role === 'tourist' && req.body.preferences) {
      fieldsToUpdate.preferences = req.body.preferences;
    }

    // allow updating languages and photos
    if (req.body.languages !== undefined) {
      fieldsToUpdate.languages = Array.isArray(req.body.languages) ? req.body.languages : String(req.body.languages).split(',').map(s => s.trim()).filter(Boolean)
    }

    const nextPhotos = parsePhotos(req.body.photos)

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

      const nextTravelPackages = parseTravelPackages(req.body.travelPackages || req.body.businessInfo.travelPackages)
      if (nextTravelPackages) {
        fieldsToUpdate.businessInfo.travelPackages = nextTravelPackages
      }
    }

    if (req.user.role === 'provider' && !req.body.businessInfo && req.body.travelPackages) {
      fieldsToUpdate.businessInfo = {
        ...req.user.businessInfo,
        travelPackages: parseTravelPackages(req.body.travelPackages) || []
      }
    }

    if (req.body.gender !== undefined) {
      fieldsToUpdate.gender = req.body.gender;
    }

    // Use document load + save to ensure proper casting of nested subdocuments
    let user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If businessInfo.travelPackages present in payload, normalize it first
    if (fieldsToUpdate.businessInfo && Array.isArray(fieldsToUpdate.businessInfo.travelPackages)) {
      const normalizePkg = (pkg) => {
        const next = { ...(pkg || {}) }

        next.serviceType = String(next.serviceType || '').trim() || undefined

        // includedDistricts -> array of ids/codes
        if (Array.isArray(next.includedDistricts)) {
          next.includedDistricts = next.includedDistricts.map((d) => String(d || '').trim()).filter(Boolean)
        } else if (typeof next.includedDistricts === 'string') {
          next.includedDistricts = next.includedDistricts.split(',').map((d) => d.trim()).filter(Boolean)
        } else {
          next.includedDistricts = []
        }

        // duration -> string
        next.duration = String(next.duration || '').trim()

        // highlights -> array
        if (Array.isArray(next.highlights)) {
          next.highlights = next.highlights.map((h) => String(h || '').trim()).filter(Boolean)
        } else if (typeof next.highlights === 'string') {
          next.highlights = next.highlights.split(',').map((h) => h.trim()).filter(Boolean)
        } else {
          next.highlights = []
        }

        // foodImages -> normalize to array of image objects
        let foodImages = next.foodImages || []
        if (typeof foodImages === 'string') {
          const t = foodImages.trim()
          if (t.startsWith('[') || t.startsWith('{')) {
            try { foodImages = JSON.parse(t) } catch (e) { foodImages = [t] }
          } else {
            foodImages = [t]
          }
        }
        if (!Array.isArray(foodImages)) foodImages = [foodImages]
        next.foodImages = foodImages.map((img) => {
          if (!img) return null
          if (typeof img === 'string') return { url: String(img).trim() }
          if (typeof img === 'object') {
            const url = String(img.url || img.src || '').trim()
            if (!url) return null
            return { url, label: String(img.label || img.caption || '').trim() || undefined, type: String(img.type || '').trim() || undefined }
          }
          return null
        }).filter(Boolean)

        // images -> normalize to array of objects {url,label,type}
        let imgs = next.images || []
        if (typeof imgs === 'string') {
          const t = imgs.trim()
          if (t.startsWith('[') || t.startsWith('{')) {
            try { imgs = JSON.parse(t) } catch (e) { imgs = [t] }
          } else {
            imgs = [t]
          }
        }
        if (!Array.isArray(imgs)) imgs = [imgs]
        next.images = imgs.map((img) => {
          if (!img) return null
          if (typeof img === 'string') return { url: String(img).trim() }
          if (typeof img === 'object') {
            const url = String(img.url || img.src || '').trim()
            if (!url) return null
            return { url, label: String(img.label || img.caption || '').trim() || undefined, type: String(img.type || '').trim() || undefined }
          }
          return null
        }).filter(Boolean)

        // price.amount -> number
        if (next.price && next.price.amount !== undefined) {
          const n = Number(next.price.amount)
          next.price.amount = Number.isFinite(n) ? n : undefined
          next.price.currency = String(next.price.currency || 'USD').trim() || 'USD'
        }

        // details -> keep as plain object if provided
        if (!next.details || typeof next.details !== 'object' || Array.isArray(next.details)) {
          next.details = {}
        }

        return next
      }

      try {
        fieldsToUpdate.businessInfo.travelPackages = fieldsToUpdate.businessInfo.travelPackages.map(normalizePkg)
      } catch (e) {
        console.warn('Failed to normalize incoming travelPackages', e)
      }
    }

    // Apply top-level updates
    for (const key of Object.keys(fieldsToUpdate)) {
      if (key === 'businessInfo' && typeof fieldsToUpdate.businessInfo === 'object') {
        user.businessInfo = {
          ...(user.businessInfo || {}),
          ...fieldsToUpdate.businessInfo
        };
      } else {
        user[key] = fieldsToUpdate[key];
      }
    }

    await user.save();

    if (nextPhotos && nextPhotos.length > 0) {
      await User.collection.updateOne(
        { _id: req.user._id },
        { $set: { photos: nextPhotos } }
      )
    }

    const finalUser = await User.findById(req.user._id).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: finalUser }
    });
  } catch (error) {
    console.error('Update profile error:', error);

    // Handle mongoose validation errors explicitly to return 400
    if (error && error.name === 'ValidationError') {
      const errors = Object.values(error.errors || {}).map(err => ({ field: err.path, message: err.message }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Log stack for debugging in development
    if (error && error.stack) {
      console.error(error.stack);
    }

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
      try {
        const ext = path.extname(req.file.originalname) || '';
        if (ext && !req.file.filename.endsWith(ext)) {
          const newName = req.file.filename + ext;
          const newPath = path.join(path.dirname(req.file.path), newName);
          fs.renameSync(req.file.path, newPath);
          avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${newName}`;
        } else {
          avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }
      } catch (renameErr) {
        console.error('Failed to rename avatar uploaded file to include extension', renameErr);
        avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      }
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
