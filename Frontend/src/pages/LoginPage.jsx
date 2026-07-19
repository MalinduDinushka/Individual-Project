import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { FaGoogle, FaMapMarkerAlt } from 'react-icons/fa'
import GoogleSignIn from '../components/GoogleSignIn'
import Logo from '../components/Logo'
import { authAPI } from '../api'
import { useAuthStore } from '../store/authStore'

const validateEmail = (value) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value.trim())
const validatePassword = (value) => /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/.test(value)

const LoginPage = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore(state => state.setAuth)
  const [activeTab, setActiveTab] = useState('tourist')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setErrors((current) => ({ ...current, [e.target.name]: '' }))
  }

  const validateForm = () => {
    const nextErrors = {}
    if (!validateEmail(formData.email)) nextErrors.email = 'Please enter a valid email address'
    if (!formData.password) nextErrors.password = 'Password is required'
    else if (!validatePassword(formData.password)) nextErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and a number'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error('Please fix the highlighted fields')
      return
    }

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
    <div className="page-shell flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-primary to-cyan-700 text-white p-14 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.12),_transparent_22%)]"></div>
        <div className="max-w-xl relative z-10">
          <div className="inline-flex items-center gap-3 mb-10 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md">
            <div className="bg-white/15 p-2.5 rounded-2xl">
              <FaMapMarkerAlt className="text-primary text-2xl" />
            </div>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-white/90">Premium travel platform</span>
          </div>
          
          <h2 className="text-5xl font-extrabold mb-6 leading-tight">Welcome back to TourMate</h2>
          <p className="text-xl text-white/85 leading-8 max-w-lg mb-8">
            Manage bookings, connect with verified providers, and keep travel planning elegant, safe, and seamless.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm text-white/75 mt-1">Verified providers</div>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-white/75 mt-1">Travel support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-10">
        <div className="max-w-lg w-full">
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <Logo />
          </div>

          {/* Role Tabs */}
          <div className="premium-panel-soft flex items-center gap-1 p-1.5 mb-8">
            <button
              onClick={() => setActiveTab('tourist')}
              className={`flex-1 inline-flex items-center justify-center py-3.5 px-4 rounded-2xl font-semibold transition text-sm text-center ${
                activeTab === 'tourist'
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/15'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tourist
            </button>
            <button
              onClick={() => setActiveTab('provider')}
              className={`flex-1 inline-flex items-center justify-center py-3.5 px-4 rounded-2xl font-semibold transition text-sm text-center ${
                activeTab === 'provider'
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/15'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Provider
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 inline-flex items-center justify-center py-3.5 px-4 rounded-2xl font-semibold transition text-sm text-center ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/15'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Login Form */}
          <div className="premium-panel p-8 md:p-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Welcome Back</h2>
            <p className="text-slate-500 mb-8">Sign in to continue your premium travel experience.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`input ${errors.email ? 'border-rose-500' : ''}`}
                  required
                />
                {errors.email && <p className="mt-2 text-sm text-rose-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`input ${errors.password ? 'border-rose-500' : ''}`}
                  required
                />
                {errors.password && <p className="mt-2 text-sm text-rose-600">{errors.password}</p>}
              </div>

              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-primary hover:text-primary-dark"
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

            <div className="my-7 flex items-center">
              <div className="flex-1 border-t border-slate-200"></div>
              <span className="px-4 text-sm text-slate-500 font-medium">Or continue with</span>
              <div className="flex-1 border-t border-slate-200"></div>
            </div>

            <div className="w-full"><GoogleSignIn role={activeTab} /></div>

            <p className="text-center text-sm text-slate-600 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-semibold hover:text-primary-dark">
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
