const User = require('../models/User');

exports.getProviderProfile = async (req, res) => {
  try {
    const provider = await User.findById(req.params.id).select('name email role phone avatar isVerified isActive businessInfo createdAt');

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    if (provider.role !== 'provider') {
      return res.status(400).json({ success: false, message: 'User is not a provider' });
    }

    res.json({ success: true, data: { provider } });
  } catch (error) {
    console.error('Get provider profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch provider profile', error: error.message });
  }
};
