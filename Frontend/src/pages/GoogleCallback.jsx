import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authAPI } from '../api'
import { toast } from 'react-hot-toast'

const GoogleCallback = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore(state => state.setAuth)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        if (!code) {
          toast.error('Missing authorization code from Google')
          setLoading(false)
          return
        }

        // Use the current full callback path as redirectUri so it matches Google console
        const redirectUri = window.location.origin + window.location.pathname

        // Extract role from state if provided
        let role = 'tourist'
        try {
          const state = params.get('state')
          if (state) {
            const parsed = JSON.parse(decodeURIComponent(state))
            if (parsed && parsed.role) role = parsed.role
          }
        } catch (e) {
          // ignore parse errors and default to tourist
        }

        const res = await authAPI.googleExchange({ code, redirectUri, role })
        const { user, token } = res.data.data
        setAuth(user, token)
        toast.success('Signed in with Google')

        if (user?.role === 'tourist') navigate('/tourist')
        else if (user?.role === 'provider') navigate('/provider')
        else if (user?.role === 'admin') navigate('/admin')
        else navigate('/')
      } catch (err) {
        console.error('Google callback error', err)
        toast.error(err.response?.data?.message || 'Google sign-in failed')
      } finally {
        setLoading(false)
      }
    })()
  }, [navigate, setAuth])

  if (loading) return <div className="page-shell py-20">Processing Google sign-in...</div>

  return (
    <div className="page-shell py-20">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-2xl font-semibold">Google sign-in</h2>
        <p className="text-sm text-slate-600 mt-4">If you are not redirected automatically, return to the <a href="/" className="text-primary font-semibold">home page</a>.</p>
      </div>
    </div>
  )
}

export default GoogleCallback
