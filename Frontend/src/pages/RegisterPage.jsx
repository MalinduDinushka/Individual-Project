import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { FaGoogle } from 'react-icons/fa'
import GoogleSignIn from '../components/GoogleSignIn'
import Logo from '../components/Logo'
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

const serviceDetailOptions = {
  guide: {
    specialties: ['Cultural tours', 'Wildlife', 'City tours', 'Hill country', 'Beach trips', 'Religious sites', 'Adventure', 'Food tours'],
    groupSizes: ['Solo travelers', 'Couples', 'Families', 'Small groups', 'Large groups']
  },
  vehicle: {
    vehicleTypes: ['Car', 'Van', 'SUV', 'Bus', 'Tuk-tuk', 'Motorbike', 'Luxury vehicle'],
    capacity: ['1-2 passengers', '3-4 passengers', '5-7 passengers', '8-12 passengers', '13+ passengers'],
    tripTypes: ['Airport transfers', 'Day tours', 'Multi-day trips', 'City rides', 'Long-distance routes']
  },
  hotel: {
    roomCount: ['1-3 rooms', '4-10 rooms', '11-25 rooms', '26-50 rooms', '50+ rooms'],
    roomTypes: ['Single', 'Double', 'Twin', 'Triple', 'Family', 'Dormitory', 'Villa', 'Suite'],
    amenities: ['AC', 'Wi-Fi', 'Breakfast', 'Pool', 'Parking', 'Restaurant', 'Sea view', 'Kitchen']
  },
  restaurant: {
    cuisines: ['Sri Lankan', 'Seafood', 'Chinese', 'Indian', 'Western', 'Italian', 'Cafe', 'Street food'],
    dietaryOptions: ['Vegetarian', 'Vegan', 'Halal', 'Gluten-free', 'Seafood', 'Kids menu'],
    diningOptions: ['Dine-in', 'Takeaway', 'Delivery', 'Group bookings', 'Outdoor seating']
  },
  photographer: {
    coverage: ['Travel portraits', 'Events', 'Weddings', 'Drone shots', 'Wildlife', 'Hotel shoots', 'Social media content'],
    equipment: ['DSLR camera', 'Mirrorless camera', 'Drone', 'Lighting kit', 'Gimbal', 'Video camera'],
    delivery: ['Edited photos', 'Raw photos', 'Short videos', 'Same-day previews', 'Online gallery']
  },
  equipment: {
    items: ['Camping gear', 'Surfboards', 'Bicycles', 'Scooters', 'Cameras', 'Hiking gear', 'Snorkeling gear'],
    delivery: ['Pickup only', 'Hotel delivery', 'Airport delivery', 'District delivery', 'Return pickup'],
    rentalPeriods: ['Hourly', 'Half day', 'Full day', 'Multi-day', 'Weekly']
  }
}

const createDefaultServiceDetails = () => ({
  guide: {
    canTakePhotos: false,
    specialties: [],
    groupSizes: []
  },
  vehicle: {
    vehicleTypes: [],
    capacity: '',
    tripTypes: [],
    driverIncluded: true
  },
  hotel: {
    roomCount: '',
    roomTypes: [],
    amenities: []
  },
  restaurant: {
    cuisines: [],
    dietaryOptions: [],
    diningOptions: []
  },
  photographer: {
    coverage: [],
    equipment: [],
    delivery: []
  },
  equipment: {
    items: [],
    delivery: [],
    rentalPeriods: []
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

  const NIC_PATTERN = /^([0-9]{9}[vVxX]|[0-9]{12})$/
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/
const PHONE_PATTERN = /^(\+94|0)?[1-9][0-9]{8,9}$/

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
  const [touchedFields, setTouchedFields] = useState({})
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [documentFile, setDocumentFile] = useState(null)
  const [documentFileName, setDocumentFileName] = useState('')
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

  const getFieldError = (name, value) => {
    if (name === 'email') {
      const trimmedValue = String(value || '').trim()
      if (!trimmedValue) return 'Email is required'
      if (!EMAIL_PATTERN.test(trimmedValue)) return 'Please enter a valid email address'
      return ''
    }

    return ''
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (validationErrors.length > 0) {
      setValidationErrors((current) => current.filter((error) => error.field !== name))
    }
    
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

  const handleBlur = (e) => {
    const { name } = e.target
    setTouchedFields((current) => ({ ...current, [name]: true }))
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

  const handleDocumentSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }
      setDocumentFile(file)
      setDocumentFileName(file.name)
    }
  }

  const uploadVerificationDocument = async (token, file, documentType) => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const form = new FormData()
    form.append('document', file)
    form.append('documentType', documentType)

    const res = await fetch(`${base}/auth/verification-documents`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data?.message || 'Document upload failed')
    }
    return data
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
    setTouchedFields((current) => ({ ...current, email: true }))

    const validationErrors = []

    if (!formData.name || formData.name.trim().length < 2) {
      validationErrors.push({ field: 'name', message: 'Name must be at least 2 characters long' })
    }

    if (!EMAIL_PATTERN.test(String(formData.email || '').trim())) {
      validationErrors.push({ field: 'email', message: 'Please enter a valid email address' })
    }

    if (!PASSWORD_PATTERN.test(String(formData.password || ''))) {
      validationErrors.push({ field: 'password', message: 'Password must be at least 8 characters and include uppercase, lowercase, and a number' })
    }

    if (formData.password !== formData.confirmPassword) {
      validationErrors.push({ field: 'confirmPassword', message: 'Passwords do not match' })
    }

    if (formData.phone && !PHONE_PATTERN.test(String(formData.phone).trim())) {
      validationErrors.push({ field: 'phone', message: 'Please enter a valid phone number' })
    }

    if (!formData.gender) {
      validationErrors.push({ field: 'gender', message: 'Please select your gender' })
    }

    if (activeTab === 'tourist' && !formData.nationality) {
      validationErrors.push({ field: 'nationality', message: 'Please select your nationality' })
    }

    if (activeTab === 'tourist' && formData.nationality === 'local') {
      const nicValue = String(formData.nic || '').trim()
      if (!NIC_PATTERN.test(nicValue)) {
        validationErrors.push({ field: 'nic', message: 'Use a valid NIC format: 9 digits + V/X, or 12 digits.' })
      }
    }

    if (activeTab === 'tourist' && formData.nationality === 'foreign') {
      if (!String(formData.passport || '').trim()) {
        validationErrors.push({ field: 'passport', message: 'Passport is required for foreign tourists' })
      }
    }

    if (activeTab === 'provider') {
      const nicValue = String(formData.nic || '').trim()
      if (!NIC_PATTERN.test(nicValue)) {
        validationErrors.push({ field: 'nic', message: 'Use a valid NIC format: 9 digits + V/X, or 12 digits.' })
      }
      if (!formData.businessInfo.businessName?.trim()) {
        validationErrors.push({ field: 'businessInfo.businessName', message: 'Business name is required' })
      }
      if (!formData.businessInfo.serviceTypes.length) {
        validationErrors.push({ field: 'businessInfo.serviceTypes', message: 'Select at least one service type' })
      }
    }

    if (validationErrors.length > 0) {
      setValidationErrors(validationErrors)
      toast.error('Fix the highlighted registration error')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationErrors([{ field: 'confirmPassword', message: 'Passwords do not match' }])
      toast.error('Fix the highlighted registration error')
      return
    }

    if (activeTab === 'tourist' && formData.nationality === 'local') {
      const nicValue = String(formData.nic || '').trim()
      if (!NIC_PATTERN.test(nicValue)) {
        setValidationErrors([{ field: 'nic', message: 'Use a valid NIC format: 9 digits + V/X, or 12 digits.' }])
        toast.error('Fix the highlighted registration error')
        return
      }
    }

    if (activeTab === 'provider') {
      const nicValue = String(formData.nic || '').trim()
      if (!NIC_PATTERN.test(nicValue)) {
        setValidationErrors([{ field: 'nic', message: 'Use a valid NIC format: 9 digits + V/X, or 12 digits.' }])
        toast.error('Fix the highlighted registration error')
        return
      }
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
        payload.gender = formData.gender
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

      // Upload verification document if selected
      if (documentFile && token) {
        try {
          const docType = activeTab === 'tourist' 
            ? (formData.nationality === 'local' ? 'nic' : 'passport')
            : 'nic'
          await uploadVerificationDocument(token, documentFile, docType)
          await authAPI.requestVerification()
          toast.success('Registration successful! Document uploaded and verification requested.')
        } catch (docErr) {
          console.error('Document upload/verification request failed', docErr)
          toast.success('Registration successful! Your document was uploaded. Please submit verification from your profile.')
        }
      } else {
        toast.success('Registration successful!')
      }

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
        <div className="flex items-center justify-center mb-8">
          <Logo />
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
                  onBlur={handleBlur}
                  placeholder="you@example.com"
                  className={`input ${validationErrors.some((error) => error.field === 'email') ? 'border-rose-500' : ''}`}
                  aria-invalid={Boolean(validationErrors.some((error) => error.field === 'email') || (touchedFields.email && getFieldError('email', formData.email)))}
                  required
                />
                {touchedFields.email && getFieldError('email', formData.email) && (
                  <p className="mt-2 text-sm text-rose-600">{getFieldError('email', formData.email)}</p>
                )}
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
                  className={`input ${validationErrors.some((error) => error.field === 'password') ? 'border-rose-500' : ''}`}
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
                  className={`input ${validationErrors.some((error) => error.field === 'confirmPassword') ? 'border-rose-500' : ''}`}
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
                  className={`input ${validationErrors.some((error) => error.field === 'phone') ? 'border-rose-500' : ''}`}
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

              {(activeTab === 'tourist' || activeTab === 'provider') && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`input ${validationErrors.some((error) => error.field === 'gender') ? 'border-rose-500' : ''}`}
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
                    pattern="^([0-9]{9}[vVxX]|[0-9]{12})$"
                    title="Use 9 digits plus V/X, or 12 digits"
                    className="input"
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500">Use 9 digits followed by V/X, or a 12-digit NIC number.</p>
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
                      className={`input ${validationErrors.some((error) => error.field === 'businessInfo.businessName') ? 'border-rose-500' : ''}`}
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
                        <p className="text-sm text-slate-500">Select your specialties and group sizes you can guide.</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-3">Specialties</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {serviceDetailOptions.guide.specialties.map((specialty) => {
                            const isSelected = (formData.businessInfo.serviceDetails.guide?.specialties || []).includes(specialty)
                            return (
                              <label key={specialty} className="flex items-center gap-3 rounded-xl bg-white border px-4 py-3 text-sm cursor-pointer hover:border-primary transition-colors">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const current = formData.businessInfo.serviceDetails.guide?.specialties || []
                                    const next = e.target.checked
                                      ? [...current, specialty]
                                      : current.filter(s => s !== specialty)
                                    handleServiceDetailChange('guide', 'specialties', next)
                                  }}
                                  className="checkbox checkbox-primary"
                                />
                                {specialty}
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-3">Group sizes you can guide</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {serviceDetailOptions.guide.groupSizes.map((size) => {
                            const isSelected = (formData.businessInfo.serviceDetails.guide?.groupSizes || []).includes(size)
                            return (
                              <label key={size} className="flex items-center gap-3 rounded-xl bg-white border px-4 py-3 text-sm cursor-pointer hover:border-primary transition-colors">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const current = formData.businessInfo.serviceDetails.guide?.groupSizes || []
                                    const next = e.target.checked
                                      ? [...current, size]
                                      : current.filter(s => s !== size)
                                    handleServiceDetailChange('guide', 'groupSizes', next)
                                  }}
                                  className="checkbox checkbox-primary"
                                />
                                {size}
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      <label className="flex items-center gap-3 rounded-xl bg-white border px-4 py-3 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(formData.businessInfo.serviceDetails.guide.canTakePhotos)}
                          onChange={(e) => handleServiceDetailChange('guide', 'canTakePhotos', e.target.checked)}
                          className="checkbox checkbox-primary"
                        />
                        Can take photos for travelers
                      </label>
                    </div>
                  )}

                  {formData.businessInfo.serviceTypes.includes('vehicle') && (
                    <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 space-y-4 shadow-sm">
                      <div>
                        <h3 className="font-semibold text-slate-800">Vehicle service details</h3>
                        <p className="text-sm text-slate-500">Select the types of vehicles and services you provide.</p>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-3">Vehicle types</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {serviceDetailOptions.vehicle.vehicleTypes.map((type) => {
                            const isSelected = (formData.businessInfo.serviceDetails.vehicle?.vehicleTypes || []).includes(type)
                            return (
                              <label key={type} className="flex items-center gap-3 rounded-xl bg-white border px-4 py-3 text-sm cursor-pointer hover:border-primary transition-colors">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const current = formData.businessInfo.serviceDetails.vehicle?.vehicleTypes || []
                                    const next = e.target.checked
                                      ? [...current, type]
                                      : current.filter(t => t !== type)
                                    handleServiceDetailChange('vehicle', 'vehicleTypes', next)
                                  }}
                                  className="checkbox checkbox-primary"
                                />
                                {type}
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-3">Passenger capacity</label>
                        <select
                          value={formData.businessInfo.serviceDetails.vehicle?.capacity || ''}
                          onChange={(e) => handleServiceDetailChange('vehicle', 'capacity', e.target.value)}
                          className="input"
                        >
                          <option value="">Select capacity</option>
                          {serviceDetailOptions.vehicle.capacity.map((cap) => (
                            <option key={cap} value={cap}>{cap}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-3">Trip types</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {serviceDetailOptions.vehicle.tripTypes.map((trip) => {
                            const isSelected = (formData.businessInfo.serviceDetails.vehicle?.tripTypes || []).includes(trip)
                            return (
                              <label key={trip} className="flex items-center gap-3 rounded-xl bg-white border px-4 py-3 text-sm cursor-pointer hover:border-primary transition-colors">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const current = formData.businessInfo.serviceDetails.vehicle?.tripTypes || []
                                    const next = e.target.checked
                                      ? [...current, trip]
                                      : current.filter(t => t !== trip)
                                    handleServiceDetailChange('vehicle', 'tripTypes', next)
                                  }}
                                  className="checkbox checkbox-primary"
                                />
                                {trip}
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      <label className="flex items-center gap-3 rounded-xl bg-white border px-4 py-3 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(formData.businessInfo.serviceDetails.vehicle.driverIncluded)}
                          onChange={(e) => handleServiceDetailChange('vehicle', 'driverIncluded', e.target.checked)}
                          className="checkbox checkbox-primary"
                        />
                        Driver included
                      </label>
                    </div>
                  )}

                  {formData.businessInfo.serviceTypes.includes('hotel') && (
                    <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 space-y-4 shadow-sm">
                      <div>
                        <h3 className="font-semibold text-slate-800">Hotel / guest house details</h3>
                        <p className="text-sm text-slate-500">Select your room count, types, and amenities.</p>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-3">Number of rooms</label>
                        <select
                          value={formData.businessInfo.serviceDetails.hotel?.roomCount || ''}
                          onChange={(e) => handleServiceDetailChange('hotel', 'roomCount', e.target.value)}
                          className="input"
                        >
                          <option value="">Select room count</option>
                          {serviceDetailOptions.hotel.roomCount.map((count) => (
                            <option key={count} value={count}>{count}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-3">Room types</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {serviceDetailOptions.hotel.roomTypes.map((type) => {
                            const isSelected = (formData.businessInfo.serviceDetails.hotel?.roomTypes || []).includes(type)
                            return (
                              <label key={type} className="flex items-center gap-3 rounded-xl bg-white border px-4 py-3 text-sm cursor-pointer hover:border-primary transition-colors">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const current = formData.businessInfo.serviceDetails.hotel?.roomTypes || []
                                    const next = e.target.checked
                                      ? [...current, type]
                                      : current.filter(t => t !== type)
                                    handleServiceDetailChange('hotel', 'roomTypes', next)
                                  }}
                                  className="checkbox checkbox-primary"
                                />
                                {type}
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-3">Amenities</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {serviceDetailOptions.hotel.amenities.map((amenity) => {
                            const isSelected = (formData.businessInfo.serviceDetails.hotel?.amenities || []).includes(amenity)
                            return (
                              <label key={amenity} className="flex items-center gap-3 rounded-xl bg-white border px-4 py-3 text-sm cursor-pointer hover:border-primary transition-colors">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const current = formData.businessInfo.serviceDetails.hotel?.amenities || []
                                    const next = e.target.checked
                                      ? [...current, amenity]
                                      : current.filter(a => a !== amenity)
                                    handleServiceDetailChange('hotel', 'amenities', next)
                                  }}
                                  className="checkbox checkbox-primary"
                                />
                                {amenity}
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.businessInfo.serviceTypes.includes('restaurant') && (
                    <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 space-y-4 shadow-sm">
                      <div>
                        <h3 className="font-semibold text-slate-800">Restaurant details</h3>
                        <p className="text-sm text-slate-500">Select your cuisine styles and dietary options.</p>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-3">Cuisine styles</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {serviceDetailOptions.restaurant.cuisines.map((cuisine) => {
                            const isSelected = (formData.businessInfo.serviceDetails.restaurant?.cuisines || []).includes(cuisine)
                            return (
                              <label key={cuisine} className="flex items-center gap-3 rounded-xl bg-white border px-4 py-3 text-sm cursor-pointer hover:border-primary transition-colors">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const current = formData.businessInfo.serviceDetails.restaurant?.cuisines || []
                                    const next = e.target.checked
                                      ? [...current, cuisine]
                                      : current.filter(c => c !== cuisine)
                                    handleServiceDetailChange('restaurant', 'cuisines', next)
                                  }}
                                  className="checkbox checkbox-primary"
                                />
                                {cuisine}
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-3">Dietary options</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {serviceDetailOptions.restaurant.dietaryOptions.map((option) => {
                            const isSelected = (formData.businessInfo.serviceDetails.restaurant?.dietaryOptions || []).includes(option)
                            return (
                              <label key={option} className="flex items-center gap-3 rounded-xl bg-white border px-4 py-3 text-sm cursor-pointer hover:border-primary transition-colors">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const current = formData.businessInfo.serviceDetails.restaurant?.dietaryOptions || []
                                    const next = e.target.checked
                                      ? [...current, option]
                                      : current.filter(d => d !== option)
                                    handleServiceDetailChange('restaurant', 'dietaryOptions', next)
                                  }}
                                  className="checkbox checkbox-primary"
                                />
                                {option}
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-3">Dining options</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {serviceDetailOptions.restaurant.diningOptions.map((option) => {
                            const isSelected = (formData.businessInfo.serviceDetails.restaurant?.diningOptions || []).includes(option)
                            return (
                              <label key={option} className="flex items-center gap-3 rounded-xl bg-white border px-4 py-3 text-sm cursor-pointer hover:border-primary transition-colors">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const current = formData.businessInfo.serviceDetails.restaurant?.diningOptions || []
                                    const next = e.target.checked
                                      ? [...current, option]
                                      : current.filter(d => d !== option)
                                    handleServiceDetailChange('restaurant', 'diningOptions', next)
                                  }}
                                  className="checkbox checkbox-primary"
                                />
                                {option}
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.businessInfo.serviceTypes.includes('photographer') && (
                    <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 space-y-4 shadow-sm">
                      <div>
                        <h3 className="font-semibold text-slate-800">Photography details</h3>
                        <p className="text-sm text-slate-500">Select your coverage types, equipment, and delivery options.</p>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-3">Coverage types</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {serviceDetailOptions.photographer.coverage.map((type) => {
                            const isSelected = (formData.businessInfo.serviceDetails.photographer?.coverage || []).includes(type)
                            return (
                              <label key={type} className="flex items-center gap-3 rounded-xl bg-white border px-4 py-3 text-sm cursor-pointer hover:border-primary transition-colors">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const current = formData.businessInfo.serviceDetails.photographer?.coverage || []
                                    const next = e.target.checked
                                      ? [...current, type]
                                      : current.filter(t => t !== type)
                                    handleServiceDetailChange('photographer', 'coverage', next)
                                  }}
                                  className="checkbox checkbox-primary"
                                />
                                {type}
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-3">Equipment</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {serviceDetailOptions.photographer.equipment.map((item) => {
                            const isSelected = (formData.businessInfo.serviceDetails.photographer?.equipment || []).includes(item)
                            return (
                              <label key={item} className="flex items-center gap-3 rounded-xl bg-white border px-4 py-3 text-sm cursor-pointer hover:border-primary transition-colors">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const current = formData.businessInfo.serviceDetails.photographer?.equipment || []
                                    const next = e.target.checked
                                      ? [...current, item]
                                      : current.filter(i => i !== item)
                                    handleServiceDetailChange('photographer', 'equipment', next)
                                  }}
                                  className="checkbox checkbox-primary"
                                />
                                {item}
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-3">Delivery options</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {serviceDetailOptions.photographer.delivery.map((option) => {
                            const isSelected = (formData.businessInfo.serviceDetails.photographer?.delivery || []).includes(option)
                            return (
                              <label key={option} className="flex items-center gap-3 rounded-xl bg-white border px-4 py-3 text-sm cursor-pointer hover:border-primary transition-colors">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const current = formData.businessInfo.serviceDetails.photographer?.delivery || []
                                    const next = e.target.checked
                                      ? [...current, option]
                                      : current.filter(d => d !== option)
                                    handleServiceDetailChange('photographer', 'delivery', next)
                                  }}
                                  className="checkbox checkbox-primary"
                                />
                                {option}
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.businessInfo.serviceTypes.includes('equipment') && (
                    <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 space-y-4 shadow-sm">
                      <div>
                        <h3 className="font-semibold text-slate-800">Equipment rental details</h3>
                        <p className="text-sm text-slate-500">Select items, delivery options, and rental periods.</p>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-3">Equipment items</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {serviceDetailOptions.equipment.items.map((item) => {
                            const isSelected = (formData.businessInfo.serviceDetails.equipment?.items || []).includes(item)
                            return (
                              <label key={item} className="flex items-center gap-3 rounded-xl bg-white border px-4 py-3 text-sm cursor-pointer hover:border-primary transition-colors">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const current = formData.businessInfo.serviceDetails.equipment?.items || []
                                    const next = e.target.checked
                                      ? [...current, item]
                                      : current.filter(i => i !== item)
                                    handleServiceDetailChange('equipment', 'items', next)
                                  }}
                                  className="checkbox checkbox-primary"
                                />
                                {item}
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-3">Delivery options</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {serviceDetailOptions.equipment.delivery.map((option) => {
                            const isSelected = (formData.businessInfo.serviceDetails.equipment?.delivery || []).includes(option)
                            return (
                              <label key={option} className="flex items-center gap-3 rounded-xl bg-white border px-4 py-3 text-sm cursor-pointer hover:border-primary transition-colors">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const current = formData.businessInfo.serviceDetails.equipment?.delivery || []
                                    const next = e.target.checked
                                      ? [...current, option]
                                      : current.filter(d => d !== option)
                                    handleServiceDetailChange('equipment', 'delivery', next)
                                  }}
                                  className="checkbox checkbox-primary"
                                />
                                {option}
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-3">Rental periods</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {serviceDetailOptions.equipment.rentalPeriods.map((period) => {
                            const isSelected = (formData.businessInfo.serviceDetails.equipment?.rentalPeriods || []).includes(period)
                            return (
                              <label key={period} className="flex items-center gap-3 rounded-xl bg-white border px-4 py-3 text-sm cursor-pointer hover:border-primary transition-colors">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const current = formData.businessInfo.serviceDetails.equipment?.rentalPeriods || []
                                    const next = e.target.checked
                                      ? [...current, period]
                                      : current.filter(p => p !== period)
                                    handleServiceDetailChange('equipment', 'rentalPeriods', next)
                                  }}
                                  className="checkbox checkbox-primary"
                                />
                                {period}
                              </label>
                            )
                          })}
                        </div>
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

              {/* Verification Document Upload (Optional) */}
              <div className="md:col-span-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 md:p-6 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      {activeTab === 'tourist' ? 'Verification Document' : 'Business Verification Document'}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {activeTab === 'tourist' 
                        ? 'Upload a clear image of your passport or NIC to get verified and build trust with service providers. (Optional)'
                        : 'Upload a clear image of your NIC to get verified and increase customer confidence in your business. (Optional)'}
                    </p>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleDocumentSelect}
                      className="hidden"
                      id="doc-upload"
                    />
                    <label
                      htmlFor="doc-upload"
                      className="flex items-center justify-center px-4 py-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary hover:bg-blue-50/30 transition-colors"
                    >
                      {documentFileName ? (
                        <span className="text-sm text-slate-700 font-medium">✓ {documentFileName} selected</span>
                      ) : (
                        <span className="text-sm text-slate-500">
                          {activeTab === 'tourist' 
                            ? 'Click to select passport or NIC (JPG, PNG, PDF - max 10MB)'
                            : 'Click to select your NIC (JPG, PNG, PDF - max 10MB)'}
                        </span>
                      )}
                    </label>
                  </div>
                </div>
              </div>

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
            <GoogleSignIn role={activeTab} />
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
