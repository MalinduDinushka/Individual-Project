const User = require('../models/User');

const normalizeDistrictName = (value) => String(value || '').trim().toLowerCase()

exports.getProviderProfile = async (req, res) => {
  try {
    const provider = await User.findById(req.params.id).select('name email role phone avatar photos isVerified isActive businessInfo createdAt');

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

exports.getPackageSuggestions = async (req, res) => {
  try {
    const districts = String(req.query.districts || '')
      .split(',')
      .map((district) => district.trim())
      .filter(Boolean)

    if (districts.length === 0) {
      return res.json({ success: true, data: { suggestions: [] } })
    }

    const normalizedDistricts = districts.map(normalizeDistrictName)

    const providers = await User.find({
      role: 'provider',
      isActive: true,
      'businessInfo.travelPackages.0': { $exists: true }
    })
      .select('name avatar phone businessInfo')
      .lean()

    const suggestions = providers.flatMap((provider) => {
      const packages = Array.isArray(provider.businessInfo?.travelPackages) ? provider.businessInfo.travelPackages : []

      return packages
        .map((travelPackage, index) => {
          const packageDistricts = Array.isArray(travelPackage.includedDistricts)
            ? travelPackage.includedDistricts
            : []

          const matchedDistricts = packageDistricts.filter((district) =>
            normalizedDistricts.includes(normalizeDistrictName(district))
          )

          if (matchedDistricts.length === 0) return null

          return {
            id: `${provider._id}-${index}`,
            provider: {
              id: provider._id,
              name: provider.businessInfo?.businessName || provider.name,
              avatar: provider.avatar,
              phone: provider.phone
            },
            package: travelPackage,
            matchedDistricts
          }
        })
        .filter(Boolean)
    })

    suggestions.sort((a, b) => {
      const priceA = Number(a.package?.price?.amount || 0)
      const priceB = Number(b.package?.price?.amount || 0)
      return priceA - priceB
    })

    res.json({ success: true, data: { suggestions } })
  } catch (error) {
    console.error('Get package suggestions error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch travel package suggestions', error: error.message })
  }
}
