import React, { useState, useEffect } from 'react'
import { paymentAPI } from '../api'

const PayHereCheckout = ({ bookingId, tourRequestId, bidId, paymentType = 'booking', onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkoutData, setCheckoutData] = useState(null)
  const formRef = React.useRef(null)

  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        setLoading(true)
        setError('')

        const payload = {
          paymentType,
          ...(paymentType === 'booking' && { bookingId }),
          ...(paymentType === 'tour-request-advance' && { tourRequestId, bidId })
        }

        const response = await paymentAPI.createPayHereCheckoutData(payload)

        if (response.data?.success && response.data?.data?.checkout) {
          setCheckoutData(response.data.data.checkout)
        } else {
          setError(response.data?.message || 'Failed to load payment information')
        }
      } catch (err) {
        console.error('Checkout data error:', err)
        setError(err.response?.data?.message || 'Failed to load payment gateway')
      } finally {
        setLoading(false)
      }
    }

    if (bookingId || (tourRequestId && bidId)) {
      fetchCheckoutData()
    }
  }, [bookingId, tourRequestId, bidId, paymentType])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!checkoutData) {
      setError('Payment data not loaded. Please try again.')
      return
    }

    // Auto-submit the form to PayHere
    if (formRef.current) {
      formRef.current.submit()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
          <p className="text-slate-600">Loading payment gateway...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 font-medium">Payment Error</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button
          onClick={onCancel}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Go Back
        </button>
      </div>
    )
  }

  if (!checkoutData) {
    return (
      <div className="text-center p-8">
        <p className="text-slate-600">No payment data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Display order summary */}
      <div className="bg-slate-50 rounded-lg p-4">
        <h3 className="font-semibold text-slate-900 mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Order ID:</span>
            <span className="font-mono text-slate-900">{checkoutData.order_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Amount:</span>
            <span className="font-semibold text-slate-900">{checkoutData.currency} {checkoutData.amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Customer:</span>
            <span className="text-slate-900">{checkoutData.first_name} {checkoutData.last_name}</span>
          </div>
        </div>
      </div>

      {/* Hidden form for PayHere */}
      <form
        ref={formRef}
        method="POST"
        action={checkoutData.checkoutUrl}
        style={{ display: 'none' }}
      >
        {/* Merchant Details */}
        <input type="hidden" name="merchant_id" value={checkoutData.merchant_id} />
        <input type="hidden" name="return_url" value={checkoutData.return_url} />
        <input type="hidden" name="cancel_url" value={checkoutData.cancel_url} />
        <input type="hidden" name="notify_url" value={checkoutData.notify_url} />

        {/* Order Details */}
        <input type="hidden" name="order_id" value={checkoutData.order_id} />
        <input type="hidden" name="items" value={checkoutData.items} />
        <input type="hidden" name="amount" value={checkoutData.amount} />
        <input type="hidden" name="currency" value={checkoutData.currency} />
        <input type="hidden" name="hash" value={checkoutData.hash} />

        {/* Customer Details */}
        <input type="hidden" name="first_name" value={checkoutData.first_name} />
        <input type="hidden" name="last_name" value={checkoutData.last_name} />
        <input type="hidden" name="email" value={checkoutData.email} />
        <input type="hidden" name="phone" value={checkoutData.phone} />
        <input type="hidden" name="address" value={checkoutData.address} />
        <input type="hidden" name="city" value={checkoutData.city} />
        <input type="hidden" name="country" value={checkoutData.country} />
      </form>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-dark transition"
        >
          Pay with PayHere
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-slate-200 text-slate-700 font-semibold py-3 rounded-lg hover:bg-slate-300 transition"
        >
          Cancel
        </button>
      </div>

      <p className="text-xs text-slate-500 text-center mt-4">
        You will be redirected to PayHere secure checkout. Your payment is protected and encrypted.
      </p>
    </div>
  )
}

export default PayHereCheckout
