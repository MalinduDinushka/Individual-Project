import { useEffect, useRef, useState } from 'react'
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
      // Let pages handle redirects by reading authStore
    } catch (err) {
      console.error('Google auth failed', err)
      toast.error(err.response?.data?.message || 'Google sign-in failed')
    }
  }

  return (
    <div>
      <div ref={btnRef} />
      {error && null}
    </div>
  )
}

export default GoogleSignIn
