/**
 * Payment API Service
 * Handles all payment-related API calls to the backend
 */

import axios from 'axios'

const API_BASE = '/api/payments'

/**
 * Get PayHere configuration status
 */
export const getPayHereConfig = async () => {
  try {
    const response = await axios.get(`${API_BASE}/payhere/config`)
    return response.data
  } catch (error) {
    console.error('Error fetching PayHere config:', error)
    throw error
  }
}

/**
 * Create checkout data for booking payment
 */
export const createBookingCheckout = async (bookingId) => {
  try {
    const response = await axios.post(`${API_BASE}/payhere/checkout-data`, {
      paymentType: 'booking',
      bookingId
    })
    return response.data
  } catch (error) {
    console.error('Error creating booking checkout:', error)
    throw error.response?.data || error
  }
}

/**
 * Create checkout data for tour request advance payment
 */
export const createAdvancePaymentCheckout = async (tourRequestId, bidId) => {
  try {
    const response = await axios.post(`${API_BASE}/payhere/checkout-data`, {
      paymentType: 'tour-request-advance',
      tourRequestId,
      bidId
    })
    return response.data
  } catch (error) {
    console.error('Error creating advance payment checkout:', error)
    throw error.response?.data || error
  }
}

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
 * Create a payment (legacy - use checkout endpoints instead)
 */
export const createPayment = async (bookingId, paymentMethod = 'payhere') => {
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
 * Create advance payment (legacy - use checkout endpoints instead)
 */
export const createAdvancePayment = async (tourRequestId, bidId, paymentMethod = 'payhere') => {
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

/**
 * Handle payment success/failure based on PayHere redirect
 * Call this in a useEffect when page loads after PayHere redirect
 */
export const handlePaymentReturn = (params) => {
  const status = params.get('status')
  const orderId = params.get('order_id')
  
  return {
    isSuccess: status === '2',
    isPending: status === '0',
    isFailed: status !== '2' && status !== '0',
    orderId,
    status
  }
}

export default {
  getPayHereConfig,
  createBookingCheckout,
  createAdvancePaymentCheckout,
  getPaymentStatus,
  createPayment,
  createAdvancePayment,
  handlePaymentReturn
}
