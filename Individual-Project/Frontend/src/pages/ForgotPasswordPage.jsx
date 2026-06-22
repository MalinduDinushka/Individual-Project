import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { FaEnvelope } from 'react-icons/fa'
import Logo from '../components/Logo'
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
    <div className="page-shell flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full relative z-10">
        <div className="flex items-center justify-center mb-8">
          <Logo />
        </div>

        <div className="premium-panel p-8 md:p-10">
          {!emailSent ? (
            <>
              <div className="text-center mb-8">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaEnvelope className="text-primary text-2xl" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Forgot Password?</h2>
                <p className="text-slate-500">
                  No worries! Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                <Link to="/login" className="text-sm font-semibold text-primary hover:text-primary-dark">
                  ← Back to Login
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaEnvelope className="text-green-600 text-2xl" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Check Your Email</h2>
              <p className="text-slate-500 mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-slate-500 mb-8">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-primary font-semibold hover:text-primary-dark"
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
