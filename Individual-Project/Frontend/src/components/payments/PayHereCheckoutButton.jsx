import { useState } from 'react'
import { paymentAPI } from '../../api'
import { toast } from 'react-hot-toast'

const PayHereCheckoutButton = ({ bookingId, tourRequestId, label = 'Pay with PayHere', className = '' }) => {
  const [loading, setLoading] = useState(false)

  const createAndSubmitForm = (url, payload) => {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = url
    form.enctype = 'application/x-www-form-urlencoded'
    form.acceptCharset = 'UTF-8'
    form.style.display = 'none'

    Object.entries(payload).forEach(([key, value]) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = String(value ?? '')
      form.appendChild(input)
    })

    document.body.appendChild(form)
    form.submit()
  }

  const handleCheckout = async () => {
    try {
      setLoading(true)
      const response = await paymentAPI.checkoutPayment({ bookingId, tourRequestId })
      const { payHereUrl, payload } = response.data.data
      createAndSubmitForm(payHereUrl, payload)
    } catch (error) {
      console.error('PayHere checkout error:', error)
      toast.error(error.response?.data?.message || 'Unable to start PayHere checkout.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={loading}
      className={`btn btn-primary ${className}`}
    >
      {loading ? 'Redirecting...' : label}
    </button>
  )
}

export default PayHereCheckoutButton
