/**
 * Payment API Service
 * Handles all payment-related API calls to the backend
 */

import axios from 'axios'

const API_BASE = '/api/payments'

/**
 * Get payment status
 */
export const getPaymentStatus = async (paymentId) => {
  try {
    const response = await axios.get(`${API_BASE}/${paymentId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching payment status:', error)
    throw error.response?.data || error
  }
}

/**
 * Create a booking payment
 */
export const createPayment = async (bookingId, paymentMethod = 'manual') => {
  try {
    const response = await axios.post(`${API_BASE}/`, {
      bookingId,
      paymentMethod
    })
    return response.data
  } catch (error) {
    console.error('Error creating payment:', error)
    throw error.response?.data || error
  }
}

/**
 * Create advance payment for a tour request
 */
export const createAdvancePayment = async (tourRequestId, bidId, paymentMethod = 'manual') => {
  try {
    const response = await axios.post(`${API_BASE}/advance`, {
      tourRequestId,
      bidId,
      paymentMethod
    })
    return response.data
  } catch (error) {
    console.error('Error creating advance payment:', error)
    throw error.response?.data || error
  }
}

export default {
  getPaymentStatus,
  createPayment,
  createAdvancePayment
}
