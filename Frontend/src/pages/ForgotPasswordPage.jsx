import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa'
import { authAPI } from '../api'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await authAPI.forgotPassword({ email })
      setEmailSent(true)
      toast.success('Password reset link sent to your email!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-primary p-3 rounded-full">
            <FaMapMarkerAlt className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-primary ml-3">TourMate</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {!emailSent ? (
            <>
              <div className="text-center mb-8">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaEnvelope className="text-primary text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password?</h2>
                <p className="text-gray-600">
                  No worries! Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="text-center mt-6">
                <Link to="/login" className="text-sm text-primary hover:underline">
                  ← Back to Login
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaEnvelope className="text-green-600 text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-primary hover:underline"
                >
                  try again
                </button>
              </p>
              <Link to="/login" className="btn btn-primary">
                Return to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
