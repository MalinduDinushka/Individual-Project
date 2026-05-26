const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password not required for Google OAuth users
    },
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['tourist', 'provider', 'admin'],
    default: 'tourist'
  },
  phone: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'non-binary', 'other', 'prefer-not-to-say']
  },
  nationality: {
    type: String,
    enum: ['local', 'foreign'],
    required: function() {
      return this.role === 'tourist';
    }
  },
  nic: {
    type: String,
    required: function() {
      return this.role === 'provider' || (this.role === 'tourist' && this.nationality === 'local');
    },
    trim: true,
    match: [/^([0-9]{9}[vVxX]|[0-9]{12})$/, 'Please provide a valid NIC number']
  },
  passport: {
    type: String,
    required: function() {
      return this.role === 'tourist' && this.nationality === 'foreign';
    },
    trim: true
  },
  avatar: {
    type: String,
    default: 'https://res.cloudinary.com/demo/image/upload/avatar-default.png'
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Tourist-specific fields
  preferences: {
    destinations: [String],
    interests: [String],
    budgetRange: {
      min: Number,
      max: Number
    }
  },
  // Provider-specific fields
  businessInfo: {
    businessName: String,
    description: String,
    serviceType: {
      type: String,
      enum: ['hotel', 'vehicle', 'guide', 'restaurant', 'photographer', 'equipment', 'other']
    },
    serviceTypes: [{
      type: String,
      enum: ['hotel', 'vehicle', 'guide', 'restaurant', 'photographer', 'equipment', 'other']
    }],
    serviceDetails: mongoose.Schema.Types.Mixed,
    location: String,
    documents: [{
      name: String,
      url: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      }
    }],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
