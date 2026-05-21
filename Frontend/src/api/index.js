import apiClient from '../utils/axios'

export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  googleAuth: (data) => apiClient.post('/auth/google-auth', data),
  forgotPassword: (data) => apiClient.post('/auth/forgot-password', data),
  resetPassword: (token, data) => apiClient.put(`/auth/reset-password/${token}`, data),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/update-profile', data)
}

export const tourAPI = {
  createTourRequest: (data) => apiClient.post('/tours', data),
  getTourRequests: () => apiClient.get('/tours'),
  getMyRequests: () => apiClient.get('/tours/my-requests'),
  getTourRequestById: (id) => apiClient.get(`/tours/${id}`),
  updateTourRequest: (id, data) => apiClient.put(`/tours/${id}`, data),
  deleteTourRequest: (id) => apiClient.delete(`/tours/${id}`),
  submitBid: (id, data) => apiClient.post(`/tours/${id}/bid`, data),
  acceptBid: (tourId, bidId) => apiClient.post(`/tours/${tourId}/accept-bid/${bidId}`)
}

export const serviceAPI = {
  getAllServices: (params) => apiClient.get('/services', { params }),
  getServiceById: (id) => apiClient.get(`/services/${id}`),
  createService: (data) => apiClient.post('/services', data),
  updateService: (id, data) => apiClient.put(`/services/${id}`, data),
  deleteService: (id) => apiClient.delete(`/services/${id}`)
}

export const userAPI = {
  getProviderProfile: (id) => apiClient.get(`/users/providers/${id}`)
}

export const bookingAPI = {
  createBooking: (data) => apiClient.post('/bookings', data),
  getMyBookings: () => apiClient.get('/bookings/my-bookings'),
  getBookingById: (id) => apiClient.get(`/bookings/${id}`),
  cancelBooking: (id) => apiClient.put(`/bookings/${id}/cancel`)
}

export const paymentAPI = {
  createPayment: (data) => apiClient.post('/payments', data),
  getPaymentStatus: (id) => apiClient.get(`/payments/${id}`)
}

export const messageAPI = {
  getConversations: () => apiClient.get('/messages/conversations'),
  getBookingMessages: (bookingId) => apiClient.get(`/messages/bookings/${bookingId}`),
  sendBookingMessage: (bookingId, data) => apiClient.post(`/messages/bookings/${bookingId}`, data),
  getRequestMessages: (requestId, providerId) => apiClient.get(`/messages/requests/${requestId}/providers/${providerId}`),
  sendRequestMessage: (requestId, providerId, data) => apiClient.post(`/messages/requests/${requestId}/providers/${providerId}`, data)
}

export const feedbackAPI = {
  createFeedback: (data) => apiClient.post('/feedback', data),
  getServiceFeedback: (serviceId) => apiClient.get(`/feedback/service/${serviceId}`)
}

export const sosAPI = {
  createSOSAlert: (data) => apiClient.post('/sos', data),
  getSOSAlerts: () => apiClient.get('/sos'),
  updateSOSAlert: (id, data) => apiClient.put(`/sos/${id}`, data)
}

export const adminAPI = {
  getDashboardStats: () => apiClient.get('/admin/dashboard'),
  getAllUsers: () => apiClient.get('/admin/users'),
  getVerifications: () => apiClient.get('/admin/verifications'),
  verifyProvider: (id, data) => apiClient.put(`/admin/verify-provider/${id}`, data)
}
