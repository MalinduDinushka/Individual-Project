import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { FaMapMarkerAlt, FaGoogle } from 'react-icons/fa'
import GoogleSignIn from '../components/GoogleSignIn'
import { authAPI } from '../api'
import { useAuthStore } from '../store/authStore'

const languageOptions = [
  'English',
  'Sinhala',
  'Tamil',
  'Hindi',
  'Mandarin Chinese',
  'Spanish',
  'French',
  'Arabic',
  'Portuguese',
  'Russian',
  'German',
  'Japanese',
  'Korean',
  'Italian',
  'Turkish',
  'Thai',
  'Vietnamese'
]

const providerServiceOptions = [
  { value: 'guide', label: 'Guide', hint: 'Tours, local knowledge, interpretation' },
  { value: 'vehicle', label: 'Vehicle', hint: 'Transport, transfers, rentals' },
  { value: 'hotel', label: 'Hotel / Guest house', hint: 'Rooms and stays' },
  { value: 'restaurant', label: 'Restaurant', hint: 'Dining and meal service' },
  { value: 'photographer', label: 'Photographer', hint: 'Photos and video' },
  { value: 'equipment', label: 'Equipment rental', hint: 'Gear and tools' },
  { value: 'other', label: 'Other', hint: 'Any other tourism service' }
]

const createDefaultServiceDetails = () => ({
  guide: {
    canTakePhotos: false,
    languages: '',
    specialties: ''
  },
  vehicle: {
    vehicleTypes: '',
    capacity: '',
    driverIncluded: true
  },
  hotel: {
    roomCount: '',
    roomTypes: ''
  },
  restaurant: {
    cuisines: '',
    dietaryOptions: ''
  },
  photographer: {
    coverage: '',
    equipment: ''
  },
  equipment: {
    items: '',
    delivery: ''
  },
  other: {
    notes: ''
  }
})

const providerPhotoBuckets = [
  { key: 'profile', label: 'Profile / brand photo', hint: 'Your logo, face, or main business cover image.' },
  { key: 'guide', label: 'Guide photos', hint: 'Guide portraits, tour shots, or team photos.' },
  { key: 'vehicle', label: 'Vehicle photos', hint: 'Exterior, interior, seats, and luggage space.' },
  { key: 'hotel', label: 'Hotel / guest house photos', hint: 'Rooms, lobby, exterior, and facilities.' },
  { key: 'restaurant', label: 'Restaurant photos', hint: 'Dining area, dishes, ambience, and menu visuals.' },
  { key: 'photographer', label: 'Photographer portfolio', hint: 'Sample work, camera setup, and service highlights.' },
  { key: 'equipment', label: 'Equipment photos', hint: 'Items, gear, condition, and delivery setup.' },
  { key: 'other', label: 'Other business photos', hint: 'Any remaining images that support your listing.' }
]

const buildGoogleMapsEmbedUrl = (location) => {
  const query = String(location || '').trim()
  if (!query) return ''
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
}

const formatValidationField = (field) => {
  if (!field) return 'Registration'

  return String(field)
    .replace(/^businessInfo\./, 'business info ')
    .replace(/^business\./, 'business ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[._]/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase())
}

const RegisterPage = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore(state => state.setAuth)
  const [activeTab, setActiveTab] = useState('tourist')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    gender: '',
    nationality: 'local',
    nic: '',
    passport: '',
    languages: [],
    otherLanguages: '',
    businessInfo: {
      businessName: '',
      serviceType: '',
      serviceTypes: [],
      serviceDetails: createDefaultServiceDetails(),
      description: ''
    }
  })
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [photoGroups, setPhotoGroups] = useState({
    profile: [],
    guide: [],
    vehicle: [],
    hotel: [],
    restaurant: [],
    photographer: [],
    equipment: [],
    other: []
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    if (validationErrors.length > 0) setValidationErrors([])
    
    if (name.startsWith('business')) {
      const fieldName = name.replace('business.', '')
      setFormData({
        ...formData,
        businessInfo: {
          ...formData.businessInfo,
          [fieldName]: value
        }
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handlePhotoSelect = (e, bucketKey = 'other') => {
    const files = Array.from(e.target.files || [])
    if (validationErrors.length > 0) setValidationErrors([])
    setPhotoGroups((current) => ({
      ...current,
      [bucketKey]: files
    }))
  }

  const uploadPhotos = async () => {
    const hasFiles = Object.values(photoGroups).some((files) => files.length > 0)
    if (!hasFiles) return []
    setUploadingPhotos(true)
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const uploaded = []
    try {
      for (const [bucketKey, files] of Object.entries(photoGroups)) {
        for (const file of files) {
          const form = new FormData()
          form.append('avatar', file)
          const res = await fetch(base + '/auth/avatar-public', {
            method: 'POST',
            body: form
          })
          const json = await res.json().catch(() => ({}))
          if (res.ok && json.data && json.data.avatar) {
            uploaded.push({ url: json.data.avatar, label: file.name, type: bucketKey })
          }
        }
      }
    } catch (err) {
      console.error('Photo upload error', err)
    } finally {
      setUploadingPhotos(false)
    }
    return uploaded
  }

  const handleBusinessToggle = (serviceType) => {
    setFormData((current) => {
      const selected = current.businessInfo.serviceTypes || []
      const nextTypes = selected.includes(serviceType)
        ? selected.filter((item) => item !== serviceType)
        : [...selected, serviceType]

      return {
        ...current,
        businessInfo: {
          ...current.businessInfo,
          serviceTypes: nextTypes,
          serviceType: nextTypes[0] || '',
          serviceDetails: {
            ...current.businessInfo.serviceDetails,
            [serviceType]: current.businessInfo.serviceDetails?.[serviceType] || createDefaultServiceDetails()[serviceType]
          }
        }
      }
    })
  }

  const handleServiceDetailChange = (serviceType, field, value) => {
    setFormData((current) => ({
      ...current,
      businessInfo: {
        ...current.businessInfo,
        serviceDetails: {
          ...current.businessInfo.serviceDetails,
          [serviceType]: {
            ...(current.businessInfo.serviceDetails?.[serviceType] || {}),
            [field]: value
          }
        }
      }
    }))
  }

  const handleLanguageToggle = (language) => {
    setFormData((current) => {
      const selected = current.languages || []
      const nextLanguages = selected.includes(language)
        ? selected.filter((item) => item !== language)
        : [...selected, language]

      return {
        ...current,
        languages: nextLanguages
      }
    })
  }

  const handleOtherLanguagesChange = (e) => {
    setFormData((current) => ({
      ...current,
      otherLanguages: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationErrors([])

    if (formData.password !== formData.confirmPassword) {
      setValidationErrors([{ field: 'confirmPassword', message: 'Passwords do not match' }])
      toast.error('Fix the highlighted registration error')
      return
    }

    setLoading(true)

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: activeTab
      }

      const selectedLanguages = Array.isArray(formData.languages) ? formData.languages : []
      const otherLanguages = String(formData.otherLanguages || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
      const allLanguages = [...selectedLanguages, ...otherLanguages]
      if (allLanguages.length > 0) {
        payload.languages = Array.from(new Set(allLanguages))
      }

      // Upload photos first if any selected
      const hasAnyPhotos = Object.values(photoGroups).some((files) => files.length > 0)
      if (hasAnyPhotos) {
        const uploaded = await uploadPhotos()
        if (uploaded.length > 0) payload.photos = uploaded
      }

      // Add tourist-specific fields
      if (activeTab === 'tourist') {
        payload.nationality = formData.nationality
        if (formData.nationality === 'local') {
          payload.nic = formData.nic
        } else {
          payload.passport = formData.passport
        }
      }

      // Add provider-specific fields
      if (activeTab === 'provider') {
        if (formData.businessInfo.serviceTypes.length === 0) {
          toast.error('Select at least one service type')
          setLoading(false)
          return
        }

        payload.nic = formData.nic
        payload.gender = formData.gender
        payload.businessInfo = {
          ...formData.businessInfo,
          serviceType: formData.businessInfo.serviceType || formData.businessInfo.serviceTypes[0] || '',
          serviceTypes: formData.businessInfo.serviceTypes,
          serviceDetails: formData.businessInfo.serviceDetails
        }
      }

      const response = await authAPI.register(payload)
      const { user, token } = response.data.data

      setAuth(user, token)
      setValidationErrors([])
      toast.success('Registration successful!')

      // Redirect based on role
      if (user.role === 'tourist') navigate('/tourist')
      else if (user.role === 'provider') navigate('/provider')
    } catch (error) {
      const apiErrors = Array.isArray(error.response?.data?.errors) ? error.response.data.errors : []
      if (apiErrors.length > 0) {
        setValidationErrors(apiErrors)
      } else {
        setValidationErrors([{ field: 'registration', message: error.response?.data?.message || 'Registration failed' }])
      }
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell py-10 px-4">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-gradient-to-br from-primary to-primary-dark p-3 rounded-2xl shadow-lg shadow-primary/20">
            <FaMapMarkerAlt className="text-white text-2xl" />
          </div>
          <div className="ml-3 text-center">
            <h1 className="text-3xl font-extrabold text-slate-900">TourMate</h1>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Create your premium account</p>
          </div>
        </div>

        {/* Role Tabs */}
        <div className="premium-panel-soft flex items-center gap-1 p-1.5 mb-8 max-w-lg mx-auto">
          <button
            onClick={() => setActiveTab('tourist')}
            className={`flex-1 inline-flex items-center justify-center py-3.5 px-4 rounded-2xl font-semibold transition text-center ${
              activeTab === 'tourist'
                ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/15'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            I am a Tourist
          </button>
          <button
            onClick={() => setActiveTab('provider')}
            className={`flex-1 inline-flex items-center justify-center py-3.5 px-4 rounded-2xl font-semibold transition text-center ${
              activeTab === 'provider'
                ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/15'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            I am a Service Provider
          </button>
        </div>

        {/* Registration Form */}
        <div className="premium-panel p-8 md:p-10 lg:p-12">
          <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Create Your Account</h2>
          <p className="text-slate-500 mb-8">Start your journey with a streamlined premium experience.</p>

          {validationErrors.length > 0 && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-sm">
              <div className="font-semibold">Please fix the following errors</div>
              <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                {validationErrors.map((errorItem, index) => (
                  <li key={`${errorItem.field || 'error'}-${index}`}>
                    <span className="font-medium">{formatValidationField(errorItem.field)}:</span> {errorItem.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+94 77 123 4567"
                  className="input"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Languages</label>
                <p className="text-sm text-slate-500 mb-4">
                  Select the languages you speak. If yours is not listed, add it in the other field.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {languageOptions.map((language) => {
                    const isSelected = (formData.languages || []).includes(language)
                    return (
                      <button
                        key={language}
                        type="button"
                        onClick={() => handleLanguageToggle(language)}
                        className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-left transition-all duration-200 ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {language}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Other languages not listed
                  </label>
                  <input
                    type="text"
                    name="otherLanguages"
                    value={formData.otherLanguages}
                    onChange={handleOtherLanguagesChange}
                    placeholder="Write any other language, separated by commas if needed"
                    className="input"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Example: Korean, Dutch, Swahili.
                  </p>
                </div>
              </div>

              {activeTab === 'provider' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                  <p className="mt-1 text-xs text-slate-500">Useful for guests who prefer a male or female guide or photographer.</p>
                </div>
              )}

              {/* Tourist nationality selection */}
              {activeTab === 'tourist' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nationality *
                  </label>
                  <select
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="local">Local (Sri Lankan)</option>
                    <option value="foreign">Foreign</option>
                  </select>
                </div>
              )}

              {/* NIC for local tourists and all providers */}
              {((activeTab === 'tourist' && formData.nationality === 'local') || activeTab === 'provider') && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    NIC Number *
                  </label>
                  <input
                    type="text"
                    name="nic"
                    value={formData.nic}
                    onChange={handleChange}
                    placeholder="123456789V or 200012345678"
                    className="input"
                    required
                  />
                </div>
              )}

              {/* Passport for foreign tourists */}
              {activeTab === 'tourist' && formData.nationality === 'foreign' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Passport Number *
                  </label>
                  <input
                    type="text"
                    name="passport"
                    value={formData.passport}
                    onChange={handleChange}
                    placeholder="N1234567"
                    className="input"
                    required
                  />
                </div>
              )}

              {/* Provider-specific fields */}
              {activeTab === 'provider' && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      name="business.businessName"
                      value={formData.businessInfo.businessName}
                      onChange={handleChange}
                      placeholder="Your Business Name"
                      className="input"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Business Location
                    </label>
                    <input
                      name="business.location"
                      value={formData.businessInfo.location || ''}
                      onChange={handleChange}
                      placeholder="Paste a Google Maps link or type the address/place name"
                      className="input"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      For restaurants and guest houses, add your exact Google Maps location so tourists can find you easily.
                    </p>
                  </div>

                  {formData.businessInfo.location && (
                    <div className="md:col-span-2 rounded-3xl border border-slate-200 overflow-hidden bg-slate-50 shadow-sm">
                      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 bg-white/80">
                        <div>
                          <p className="font-semibold text-slate-800">Map preview</p>
                          <p className="text-xs text-slate-500">Preview based on the location you entered</p>
                        </div>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.businessInfo.location)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-primary hover:text-primary-dark"
                        >
                          Open in Google Maps
                        </a>
                      </div>
                      <iframe
                        title="Business location preview"
                        src={buildGoogleMapsEmbedUrl(formData.businessInfo.location)}
                        className="h-64 w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  )}

                  <div className="md:col-span-2 space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">
                      Service Types *
                    </label>
                    <p className="text-sm text-slate-500">
                      Select every service your business offers. You can choose more than one, for example a guide who also takes photos.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {providerServiceOptions.map((service) => {
                        const selected = formData.businessInfo.serviceTypes.includes(service.value)
                        return (
                          <button
                            key={service.value}
                            type="button"
                            onClick={() => handleBusinessToggle(service.value)}
                              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selected ? 'bg-gradient-to-r from-primary to-primary-dark text-white border-primary shadow-lg shadow-primary/15' : 'bg-white text-slate-700 border-slate-200 hover:border-primary hover:text-primary'}`}
                          >
                            {service.label}
                          </button>
                        )
                      })}
                    </div>

                    {formData.businessInfo.serviceTypes.length === 0 && (
                      <p className="text-sm text-rose-600">Choose at least one service type.</p>
                    )}
                  </div>

                  {formData.businessInfo.serviceTypes.includes('guide') && (
                    <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 space-y-4 shadow-sm">
                      <div>
                        <h3 className="font-semibold text-slate-800">Guide details</h3>
                        <p className="text-sm text-slate-500">Add the guide-specific skills and language support you offer.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="space-y-2">
                          <span className="text-sm font-semibold text-slate-700">Languages</span>
                          <input
                            type="text"
                            value={formData.businessInfo.serviceDetails.guide.languages}
                            onChange={(e) => handleServiceDetailChange('guide', 'languages', e.target.value)}
                            placeholder="English, Sinhala, Tamil"
                            className="input"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-semibold text-slate-700">Specialties</span>
                          <input
                            type="text"
                            value={formData.businessInfo.serviceDetails.guide.specialties}
                            onChange={(e) => handleServiceDetailChange('guide', 'specialties', e.target.value)}
                            placeholder="Culture, wildlife, city tours"
                            className="input"
                          />
                        </label>
                        <label className="flex items-center gap-3 md:col-span-2 rounded-xl bg-white border px-4 py-3 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={Boolean(formData.businessInfo.serviceDetails.guide.canTakePhotos)}
                            onChange={(e) => handleServiceDetailChange('guide', 'canTakePhotos', e.target.checked)}
                            className="checkbox checkbox-primary"
                          />
                          Can take photos for travelers
                        </label>
                      </div>
                    </div>
                  )}

                  {formData.businessInfo.serviceTypes.includes('vehicle') && (
                    <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 space-y-4 shadow-sm">
                      <div>
                        <h3 className="font-semibold text-slate-800">Vehicle service details</h3>
                        <p className="text-sm text-slate-500">Tell travelers what kind of vehicle service you provide.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="space-y-2">
                          <span className="text-sm font-semibold text-slate-700">Vehicle types</span>
                          <input
                            type="text"
                            value={formData.businessInfo.serviceDetails.vehicle.vehicleTypes}
                            onChange={(e) => handleServiceDetailChange('vehicle', 'vehicleTypes', e.target.value)}
                            placeholder="Car, van, bus, tuk-tuk"
                            className="input"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-semibold text-slate-700">Passenger capacity</span>
                          <input
                            type="number"
                            min="1"
                            value={formData.businessInfo.serviceDetails.vehicle.capacity}
                            onChange={(e) => handleServiceDetailChange('vehicle', 'capacity', e.target.value)}
                            placeholder="6"
                            className="input"
                          />
                        </label>
                        <label className="flex items-center gap-3 md:col-span-2 rounded-xl bg-white border px-4 py-3 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={Boolean(formData.businessInfo.serviceDetails.vehicle.driverIncluded)}
                            onChange={(e) => handleServiceDetailChange('vehicle', 'driverIncluded', e.target.checked)}
                            className="checkbox checkbox-primary"
                          />
                          Driver included
                        </label>
                      </div>
                    </div>
                  )}

                  {formData.businessInfo.serviceTypes.includes('hotel') && (
                    <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 space-y-4 shadow-sm">
                      <div>
                        <h3 className="font-semibold text-slate-800">Hotel / guest house details</h3>
                        <p className="text-sm text-slate-500">Help travelers understand your stay capacity.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="space-y-2">
                          <span className="text-sm font-semibold text-slate-700">Number of rooms</span>
                          <input
                            type="number"
                            min="0"
                            value={formData.businessInfo.serviceDetails.hotel.roomCount}
                            onChange={(e) => handleServiceDetailChange('hotel', 'roomCount', e.target.value)}
                            className="input"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-semibold text-slate-700">Room types</span>
                          <input
                            type="text"
                            value={formData.businessInfo.serviceDetails.hotel.roomTypes}
                            onChange={(e) => handleServiceDetailChange('hotel', 'roomTypes', e.target.value)}
                            placeholder="Single, double, family"
                            className="input"
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {formData.businessInfo.serviceTypes.includes('restaurant') && (
                    <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 space-y-4 shadow-sm">
                      <div>
                        <h3 className="font-semibold text-slate-800">Restaurant details</h3>
                        <p className="text-sm text-slate-500">Add cuisine styles and dietary support.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="space-y-2">
                          <span className="text-sm font-semibold text-slate-700">Cuisine styles</span>
                          <input
                            type="text"
                            value={formData.businessInfo.serviceDetails.restaurant.cuisines}
                            onChange={(e) => handleServiceDetailChange('restaurant', 'cuisines', e.target.value)}
                            placeholder="Sri Lankan, seafood, Chinese"
                            className="input"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-semibold text-slate-700">Dietary options</span>
                          <input
                            type="text"
                            value={formData.businessInfo.serviceDetails.restaurant.dietaryOptions}
                            onChange={(e) => handleServiceDetailChange('restaurant', 'dietaryOptions', e.target.value)}
                            placeholder="Halal, vegetarian, vegan"
                            className="input"
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {formData.businessInfo.serviceTypes.includes('photographer') && (
                    <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 space-y-4 shadow-sm">
                      <div>
                        <h3 className="font-semibold text-slate-800">Photography details</h3>
                        <p className="text-sm text-slate-500">Tell travelers what kind of photo coverage you offer.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="space-y-2">
                          <span className="text-sm font-semibold text-slate-700">Coverage</span>
                          <input
                            type="text"
                            value={formData.businessInfo.serviceDetails.photographer.coverage}
                            onChange={(e) => handleServiceDetailChange('photographer', 'coverage', e.target.value)}
                            placeholder="Events, portraits, travel"
                            className="input"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-semibold text-slate-700">Equipment</span>
                          <input
                            type="text"
                            value={formData.businessInfo.serviceDetails.photographer.equipment}
                            onChange={(e) => handleServiceDetailChange('photographer', 'equipment', e.target.value)}
                            placeholder="DSLR, drone, lighting"
                            className="input"
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {formData.businessInfo.serviceTypes.includes('equipment') && (
                    <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 space-y-4 shadow-sm">
                      <div>
                        <h3 className="font-semibold text-slate-800">Equipment rental details</h3>
                        <p className="text-sm text-slate-500">List the gear you can supply and how you handle delivery.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="space-y-2">
                          <span className="text-sm font-semibold text-slate-700">Items</span>
                          <input
                            type="text"
                            value={formData.businessInfo.serviceDetails.equipment.items}
                            onChange={(e) => handleServiceDetailChange('equipment', 'items', e.target.value)}
                            placeholder="Tents, cameras, bikes"
                            className="input"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-semibold text-slate-700">Delivery</span>
                          <input
                            type="text"
                            value={formData.businessInfo.serviceDetails.equipment.delivery}
                            onChange={(e) => handleServiceDetailChange('equipment', 'delivery', e.target.value)}
                            placeholder="Pickup, delivery, pickup points"
                            className="input"
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {formData.businessInfo.serviceTypes.includes('other') && (
                    <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 space-y-4 shadow-sm">
                      <div>
                        <h3 className="font-semibold text-slate-800">Other service details</h3>
                        <p className="text-sm text-slate-500">Describe any extra tourism service you provide.</p>
                      </div>
                      <label className="space-y-2 block">
                        <span className="text-sm font-semibold text-slate-700">Notes</span>
                        <textarea
                          value={formData.businessInfo.serviceDetails.other.notes}
                          onChange={(e) => handleServiceDetailChange('other', 'notes', e.target.value)}
                          placeholder="Describe your service, availability, coverage, and any special notes"
                          rows="3"
                          className="input"
                        />
                      </label>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Business Description
                    </label>
                    <textarea
                      name="business.description"
                      value={formData.businessInfo.description}
                      onChange={handleChange}
                      placeholder="Tell us about your services..."
                      className="input"
                      rows="3"
                    ></textarea>
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 md:p-6 shadow-sm space-y-5">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Photos by category</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Add photos separately so the account looks organized, for example vehicle photos for transport providers or room photos for hotels.
                    </p>
                  </div>

                  {activeTab === 'provider' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {providerPhotoBuckets.map((bucket) => {
                        const isRelevant = bucket.key === 'profile'
                          || bucket.key === 'other'
                          || (formData.businessInfo.serviceTypes || []).includes(bucket.key)

                        if (!isRelevant) return null

                        const selectedCount = photoGroups[bucket.key]?.length || 0

                        return (
                          <label key={bucket.key} className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-primary/30 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <span className="block text-sm font-semibold text-slate-800">{bucket.label}</span>
                                <p className="text-xs text-slate-500 mt-1">{bucket.hint}</p>
                              </div>
                              {selectedCount > 0 && (
                                <span className="badge bg-primary/10 text-primary">{selectedCount} selected</span>
                              )}
                            </div>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handlePhotoSelect(e, bucket.key)}
                              className="mt-4 w-full text-sm"
                            />
                          </label>
                        )
                      })}
                    </div>
                  ) : (
                    <label className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-primary/30 transition-colors">
                      <span className="block text-sm font-semibold text-slate-800">Profile photos</span>
                      <p className="text-xs text-slate-500 mt-1">Optional profile or identity images for your account.</p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handlePhotoSelect(e, 'profile')}
                        className="mt-4 w-full text-sm"
                      />
                    </label>
                  )}

                  <p className="text-xs text-slate-500">
                    Photos will be saved with a category tag such as vehicle, hotel, guide, or other so they stay organized in the profile.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-4 text-sm text-slate-500 font-medium">Or continue with</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          <div className="w-full">
            <GoogleSignIn />
          </div>

          <p className="text-center text-sm text-slate-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:text-primary-dark">
              Sign In
            </Link>
          </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
