import apiClient from '../utils/axios'

export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  googleAuth: (data) => apiClient.post('/auth/google-auth', data),
  googleExchange: (data) => apiClient.post('/auth/google-exchange', data),
  forgotPassword: (data) => apiClient.post('/auth/forgot-password', data),
  resetPassword: (token, data) => apiClient.put(`/auth/reset-password/${token}`, data),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/update-profile', data),
  // Verification endpoints
  requestVerification: () => apiClient.post('/auth/request-verification'),
  getPendingVerifications: () => apiClient.get('/auth/verification-requests'),
  approveVerification: (id, data) => apiClient.put(`/auth/verification-requests/${id}/approve`, data),
  rejectVerification: (id, data) => apiClient.put(`/auth/verification-requests/${id}/reject`, data),
  uploadAvatar: (file) => {
    const form = new FormData()
    form.append('avatar', file)

    // Use fetch to ensure multipart boundary is set correctly and include auth token
    const auth = JSON.parse(localStorage.getItem('tourmate-auth'))
    const token = auth?.state?.token
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    return fetch(base + '/auth/avatar', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form
    }).then(async (res) => {
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const err = new Error(json?.message || 'Upload failed')
        err.response = { data: json }
        throw err
      }
      // Normalize to axios-like response shape used elsewhere
      return { data: json }
    })
  }
}

export const tourAPI = {
  createTourRequest: (data) => apiClient.post('/tours', data),
  getTourRequests: () => apiClient.get('/tours'),
  getMyRequests: () => apiClient.get('/tours/my-requests'),
  getTourRequestById: (id) => apiClient.get(`/tours/${id}`),
  updateTourRequest: (id, data) => apiClient.put(`/tours/${id}`, data),
  deleteTourRequest: (id) => apiClient.delete(`/tours/${id}`),
  submitBid: (id, data) => apiClient.post(`/tours/${id}/bid`, data),
  acceptBid: (tourId, bidId) => apiClient.post(`/tours/${tourId}/accept-bid/${bidId}`),
  rejectBid: (tourId, bidId) => apiClient.post(`/tours/${tourId}/reject-bid/${bidId}`)
}

export const serviceAPI = {
  getAllServices: (params) => apiClient.get('/services', { params }),
  getServiceById: (id) => apiClient.get(`/services/${id}`),
  createService: (data) => apiClient.post('/services', data),
  updateService: (id, data) => apiClient.put(`/services/${id}`, data),
  deleteService: (id) => apiClient.delete(`/services/${id}`)
}

export const userAPI = {
  getProviderProfile: (id) => apiClient.get(`/users/providers/${id}`),
  getPackageSuggestions: (districts) => apiClient.get('/users/package-suggestions', { params: { districts: Array.isArray(districts) ? districts.join(',') : districts } })
}

export const bookingAPI = {
  createBooking: (data) => apiClient.post('/bookings', data),
  getMyBookings: () => apiClient.get('/bookings/my-bookings'),
  getBookingById: (id) => apiClient.get(`/bookings/${id}`),
  cancelBooking: (id) => apiClient.put(`/bookings/${id}/cancel`)
}

export const paymentAPI = {
  createPayment: (data) => apiClient.post('/payments', data),
  checkoutPayment: (data) => apiClient.post('/payments/checkout', data),
  getPaymentStatus: (id) => apiClient.get(`/payments/${id}`)
}

export const messageAPI = {
  getConversations: () => apiClient.get('/messages/conversations'),
  getBookingMessages: (bookingId) => apiClient.get(`/messages/bookings/${bookingId}`),
  sendBookingMessage: (bookingId, data) => apiClient.post(`/messages/bookings/${bookingId}`, data),
  getRequestMessages: (requestId, providerId) => apiClient.get(`/messages/requests/${requestId}/providers/${providerId}`),
  sendRequestMessage: (requestId, providerId, data) => apiClient.post(`/messages/requests/${requestId}/providers/${providerId}`, data),
  deleteMessage: (messageId) => apiClient.delete(`/messages/${messageId}`)
}

export const feedbackAPI = {
  createFeedback: (data) => apiClient.post('/feedback', data),
  getServiceFeedback: (serviceId) => apiClient.get(`/feedback/service/${serviceId}`),
  getBookingFeedback: (bookingId) => apiClient.get(`/feedback/booking/${bookingId}`)
}

export const sosAPI = {
  createSOSAlert: (data) => apiClient.post('/sos', data),
  getSOSAlerts: () => apiClient.get('/sos'),
  updateSOSAlert: (id, data) => apiClient.put(`/sos/${id}`, data)
}

export const notificationAPI = {
  getNotifications: () => apiClient.get('/notifications'),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),
  deleteNotification: (id) => apiClient.delete(`/notifications/${id}`)
}

export const adminAPI = {
  getDashboardStats: () => apiClient.get('/admin/dashboard'),
  getAllUsers: (params) => apiClient.get('/admin/users', { params }),
  getVerifications: () => apiClient.get('/admin/verifications'),
  verifyProvider: (id, data) => apiClient.put(`/admin/verify-provider/${id}`, data),
  updateUserStatus: (id, data) => apiClient.patch(`/admin/users/${id}/status`, data),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
  getSOSAlerts: (params) => apiClient.get('/admin/sos', { params }),
  updateSOSAlert: (id, data) => apiClient.patch(`/admin/sos/${id}`, data)
}
