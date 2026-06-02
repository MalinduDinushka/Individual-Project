import React, { useState, useEffect } from 'react'
import { paymentAPI } from '../api'

/**
 * PayHereDirectForm - Direct form submission to PayHere
 * Alternative to PayHereCheckout for more control over form submission
 */
const PayHereDirectForm = ({ bookingId, tourRequestId, bidId, paymentType = 'booking' }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkoutData, setCheckoutData] = useState(null)
  const [showForm, setShowForm] = useState(false)

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
          setShowForm(true)
        } else {
          setError(response.data?.message || 'Failed to load payment data')
        }
      } catch (err) {
        console.error('Checkout error:', err)
        setError(err.response?.data?.message || 'Failed to initialize payment')
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
    if (checkoutData) {
      // Manually submit to PayHere
      const form = document.getElementById('payhere-form')
      if (form) {
        console.log('Submitting to PayHere...', checkoutData.checkoutUrl)
        form.submit()
      }
    }
  }

  if (loading) {
    return <div className="animate-spin text-center py-4">Loading...</div>
  }

  if (error) {
    return <div className="text-red-600 p-4 bg-red-50 rounded">{error}</div>
  }

  if (!checkoutData) {
    return <div>No payment data available</div>
  }

  return (
    <div className="space-y-4">
      <form
        id="payhere-form"
        method="POST"
        action={checkoutData.checkoutUrl}
        style={{ display: 'none' }}
      >
        {/* Merchant */}
        <input type="hidden" name="merchant_id" value={checkoutData.merchant_id} />
        <input type="hidden" name="return_url" value={checkoutData.return_url} />
        <input type="hidden" name="cancel_url" value={checkoutData.cancel_url} />
        <input type="hidden" name="notify_url" value={checkoutData.notify_url} />

        {/* Order */}
        <input type="hidden" name="order_id" value={checkoutData.order_id} />
        <input type="hidden" name="items" value={checkoutData.items} />
        <input type="hidden" name="amount" value={checkoutData.amount} />
        <input type="hidden" name="currency" value={checkoutData.currency} />
        <input type="hidden" name="hash" value={checkoutData.hash} />

        {/* Customer */}
        <input type="hidden" name="first_name" value={checkoutData.first_name} />
        <input type="hidden" name="last_name" value={checkoutData.last_name} />
        <input type="hidden" name="email" value={checkoutData.email} />
        <input type="hidden" name="phone" value={checkoutData.phone} />
        <input type="hidden" name="address" value={checkoutData.address} />
        <input type="hidden" name="city" value={checkoutData.city} />
        <input type="hidden" name="country" value={checkoutData.country} />
      </form>

      {showForm && (
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
          <h3 className="font-semibold text-slate-900 mb-4">Payment Summary</h3>
          <div className="space-y-2 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-slate-600">Order ID:</span>
              <span className="font-mono">{checkoutData.order_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Amount:</span>
              <span className="font-semibold">
                {checkoutData.currency} {checkoutData.amount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Name:</span>
              <span>{checkoutData.first_name} {checkoutData.last_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Email:</span>
              <span>{checkoutData.email}</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-dark transition"
          >
            Proceed to Payment
          </button>

          <p className="text-xs text-slate-500 text-center mt-3">
            Click the button above to proceed to secure payment
          </p>
        </div>
      )}
    </div>
  )
}

export default PayHereDirectForm
