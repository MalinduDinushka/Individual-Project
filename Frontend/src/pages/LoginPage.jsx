import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { FaMapMarkerAlt, FaGoogle } from 'react-icons/fa'
import { authAPI } from '../api'
import { useAuthStore } from '../store/authStore'

const LoginPage = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore(state => state.setAuth)
  const [activeTab, setActiveTab] = useState('tourist')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await authAPI.login(formData)
      const { user, token } = response.data.data

      setAuth(user, token)
      toast.success('Login successful!')

      // Redirect based on role
      if (user.role === 'tourist') navigate('/tourist')
      else if (user.role === 'provider') navigate('/provider')
      else if (user.role === 'admin') navigate('/admin')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-dark text-white p-12 flex-col justify-center">
        <div className="max-w-md">
          <div className="flex items-center space-x-2 mb-8">
            <div className="bg-white p-3 rounded-full">
              <FaMapMarkerAlt className="text-primary text-2xl" />
            </div>
            <h1 className="text-3xl font-bold">TourMate</h1>
          </div>
          
          <h2 className="text-4xl font-bold mb-6">Welcome to TourMate</h2>
          <p className="text-xl text-white/90 italic mb-2">
            "The journey of a thousand miles begins with a single step."
          </p>
          <p className="text-white/70">- Lao Tzu</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full">
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="bg-primary p-3 rounded-full">
              <FaMapMarkerAlt className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-primary ml-3">TourMate</h1>
          </div>

          {/* Role Tabs */}
          <div className="flex bg-white rounded-lg p-1 mb-8 shadow-sm">
            <button
              onClick={() => setActiveTab('tourist')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition text-sm ${
                activeTab === 'tourist'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              Tourist
            </button>
            <button
              onClick={() => setActiveTab('provider')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition text-sm ${
                activeTab === 'provider'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              Provider
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition text-sm ${
                activeTab === 'admin'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Welcome Back</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
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
                  Password
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

              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">Or continue with</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <button className="w-full flex items-center justify-center space-x-2 border-2 border-gray-300 rounded-lg py-3 hover:bg-gray-50 transition">
              <FaGoogle className="text-red-500" />
              <span className="font-medium">Login with Google</span>
            </button>

            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
