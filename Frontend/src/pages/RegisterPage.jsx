import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { FaMapMarkerAlt, FaGoogle } from 'react-icons/fa'
import { authAPI } from '../api'
import { useAuthStore } from '../store/authStore'

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
    nationality: 'local',
    nic: '',
    passport: '',
    businessInfo: {
      businessName: '',
      serviceType: '',
      description: ''
    }
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
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
        payload.nic = formData.nic
        payload.businessInfo = formData.businessInfo
      }

      const response = await authAPI.register(payload)
      const { user, token } = response.data.data

      setAuth(user, token)
      toast.success('Registration successful!')

      // Redirect based on role
      if (user.role === 'tourist') navigate('/tourist')
      else if (user.role === 'provider') navigate('/provider')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-primary p-3 rounded-full">
            <FaMapMarkerAlt className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-primary ml-3">TourMate</h1>
        </div>

        {/* Role Tabs */}
        <div className="flex bg-white rounded-lg p-1 mb-8 shadow-sm max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('tourist')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              activeTab === 'tourist'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            I am a Tourist
          </button>
          <button
            onClick={() => setActiveTab('provider')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              activeTab === 'provider'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            I am a Service Provider
          </button>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Your Account</h2>
          <p className="text-gray-600 mb-8">Start your journey with TourMate</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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

              {/* Tourist nationality selection */}
              {activeTab === 'tourist' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Type *
                    </label>
                    <select
                      name="business.serviceType"
                      value={formData.businessInfo.serviceType}
                      onChange={handleChange}
                      className="input"
                      required
                    >
                      <option value="">Select Service Type</option>
                      <option value="hotel">Hotel/Guest House</option>
                      <option value="vehicle">Vehicle Rental</option>
                      <option value="guide">Tour Guide</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="photographer">Photography</option>
                      <option value="equipment">Equipment Rental</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">Or continue with</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <button className="w-full flex items-center justify-center space-x-2 border-2 border-gray-300 rounded-lg py-3 hover:bg-gray-50 transition">
            <FaGoogle className="text-red-500" />
            <span className="font-medium">Sign up with Google</span>
          </button>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
