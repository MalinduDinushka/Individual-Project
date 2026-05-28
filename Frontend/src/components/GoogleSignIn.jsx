import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../api'
import { useAuthStore } from '../store/authStore'
import { toast } from 'react-hot-toast'

const isPlaceholderClientId = (value) => !value || value.includes('your_google_client_id') || value.includes('your-google-client')

const GoogleSignIn = () => {
  const btnRef = useRef(null)
  const setAuth = useAuthStore(state => state.setAuth)

  const [error, setError] = useState(null)

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (isPlaceholderClientId(clientId)) {
      console.warn('Google Sign-In is not configured. Set VITE_GOOGLE_CLIENT_ID to a real Web OAuth client ID from Google Cloud, then restart the frontend.')
      return
    }

    const scriptId = 'google-identity-script'
    if (!document.getElementById(scriptId)) {
      const s = document.createElement('script')
      s.src = 'https://accounts.google.com/gsi/client'
      s.id = scriptId
      s.async = true
      s.defer = true
      document.body.appendChild(s)
      s.onload = () => initButton()
      s.onerror = () => setError('Failed to load Google Identity script.')
    } else {
      initButton()
    }

    function initButton() {
      // global google available
      if (window.google && btnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse
          })

          // render a button inline if desired
          window.google.accounts.id.renderButton(btnRef.current, {
            theme: 'outline',
            size: 'large'
          })
        } catch (err) {
          console.error('Google init error', err)
          // Show a helpful message to user
          setError('Google Sign-In is misconfigured for this origin. In Google Cloud, authorize http://localhost:3000 under the Web OAuth client and confirm VITE_GOOGLE_CLIENT_ID is correct.')
        }
      } else {
        setError('Google Identity Service not available.')
      }
    }

    return () => {
      // cleanup not required for global script
    }
  }, [])

  const navigate = useNavigate()

  async function handleCredentialResponse(response) {
    if (!response || !response.credential) {
      toast.error('Google sign-in failed')
      return
    }

    try {
      const res = await authAPI.googleAuth({ idToken: response.credential })
      const { user, token } = res.data.data
      setAuth(user, token)
      toast.success('Signed in with Google')
      // Redirect based on role for immediate UX
      if (user?.role === 'tourist') navigate('/tourist')
      else if (user?.role === 'provider') navigate('/provider')
      else if (user?.role === 'admin') navigate('/admin')
    } catch (err) {
      console.error('Google auth failed', err)
      toast.error(err.response?.data?.message || 'Google sign-in failed')
    }
  }

  return (
    <div>
      <div ref={btnRef} />
      {error && null}
      {/* Fallback: redirect-based OAuth if GSI isn't desired */}
      <div className="mt-3">
        <a
          href={(() => {
            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
            const redirect = window.location.origin + '/auth/google/callback'
            const scope = encodeURIComponent('openid email profile')
            return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirect)}&scope=${scope}&access_type=offline&prompt=consent`
          })()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.6 12.23c0-.78-.07-1.53-.2-2.25H12v4.26h5.64c-.24 1.3-.97 2.4-2.06 3.14v2.6h3.32c1.94-1.79 3.06-4.42 3.06-7.75z" fill="#4285F4"/><path d="M12 22c2.7 0 4.97-.9 6.63-2.44l-3.32-2.6c-.92.62-2.09.99-3.31.99-2.55 0-4.71-1.72-5.48-4.03H2.97v2.54C4.63 19.9 8 22 12 22z" fill="#34A853"/><path d="M6.52 13.92A6.998 6.998 0 0 1 6 12c0-.67.1-1.32.28-1.92V7.54H2.97A10.98 10.98 0 0 0 1 12c0 1.8.43 3.49 1.21 4.96l4.31-3.04z" fill="#FBBC05"/><path d="M12 6.5c1.47 0 2.8.51 3.85 1.52l2.88-2.88C16.96 3.45 14.7 2.5 12 2.5 8 2.5 4.63 4.6 2.97 7.46l4.31 3.04C7.29 8.22 9.45 6.5 12 6.5z" fill="#EA4335"/></svg>
          Sign in with Google (redirect)
        </a>
      </div>
    </div>
  )
}

export default GoogleSignIn
