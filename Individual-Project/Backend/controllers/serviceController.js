const Service = require('../models/Service');

// Sample fallback services (used when DB is empty or for frontend demo IDs 1/2/3)
const sampleServices = [
  {
    _id: '1',
    name: 'Beachfront Villa - Mirissa',
    type: 'villa',
    description: 'A beautiful beachfront villa with private pool and sea views.',
    pricing: { amount: 120, currency: 'USD', unit: 'night' },
    images: ['https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200']
  },
  {
    _id: '2',
    name: 'Luxury Safari Experience',
    type: 'safari',
    description: 'Guided jeep safari through the national park with expert naturalists.',
    pricing: { amount: 85, currency: 'USD', unit: 'day' },
    images: ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200']
  },
  {
    _id: '3',
    name: 'Cultural Heritage Tour',
    type: 'guide',
    description: 'Explore UNESCO heritage sites with an experienced local guide.',
    pricing: { amount: 60, currency: 'USD', unit: 'day' },
    images: ['/cultural-heritage.webp']
  }
];

// Get all services (with simple pagination)
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).limit(50).populate('provider', 'name businessInfo isVerified verificationStatus');

    if (!services || services.length === 0) {
      return res.json({ success: true, data: { services: sampleServices, count: sampleServices.length } });
    }

    res.json({ success: true, data: { services, count: services.length } });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch services', error: error.message });
  }
};

// Get service by ID
exports.getServiceById = async (req, res) => {
  try {
    const id = req.params.id;

    // Return sample if id matches a sample id
    const sample = sampleServices.find(s => s._id === id);
    if (sample) {
      return res.json({ success: true, data: { service: sample } });
    }

    const service = await Service.findById(id).populate('provider', 'name businessInfo isVerified verificationStatus');
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    res.json({ success: true, data: { service } });
  } catch (error) {
    console.error('Get service by id error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch service', error: error.message });
  }
};

// Create service (provider)
exports.createService = async (req, res) => {
  try {
    // Verify provider is verified before allowing service creation
    if (req.user.role !== 'provider') {
      return res.status(403).json({ success: false, message: 'Only providers can create services' });
    }
    if (!req.user.isVerified || req.user.verificationStatus !== 'verified') {
      return res.status(403).json({ success: false, message: 'Your account must be verified before creating services. Please submit your NIC for verification.' });
    }

    const payload = { ...req.body, provider: req.user._id };
    const service = await Service.create(payload);
    res.status(201).json({ success: true, message: 'Service created', data: { service } });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ success: false, message: 'Failed to create service', error: error.message });
  }
};
