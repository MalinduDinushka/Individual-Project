import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const auth = JSON.parse(localStorage.getItem('tourmate-auth'))
    if (auth?.state?.token) {
      config.headers.Authorization = `Bearer ${auth.state.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-logout for public read-only endpoints (e.g., service listing)
      const reqUrl = error.config?.url || ''
      const isPublicService = reqUrl.includes('/services')

      if (!isPublicService) {
        localStorage.removeItem('tourmate-auth')
        window.location.href = '/login'
      } else {
        // For public service fetches, let the caller handle the error (avoid forced logout)
        console.warn('Received 401 for public service endpoint, skipping auto-logout')
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
