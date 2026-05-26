import { useEffect, useState } from 'react'
import { paymentAPI } from '../../api'
import { useAuthStore } from '../../store/authStore'

const sandboxAction = 'https://sandbox.payhere.lk/pay/checkout'

const buildCustomerFallback = (user) => {
  const nameParts = String(user?.name || '').trim().split(/\s+/).filter(Boolean)

  return {
    first_name: nameParts[0] || 'TourMate',
    last_name: nameParts.slice(1).join(' ') || 'User',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    country: user?.country || 'Sri Lanka'
  }
}

const PayHereCheckoutButton = ({
  paymentType,
  bookingId,
  tourRequestId,
  bidId,
  items,
  amount,
  currency = 'LKR',
  children,
  className = 'btn btn-primary',
  disabled = false,
  onError,
  onCreated
}) => {
  const [loading, setLoading] = useState(false)
  const [configured, setConfigured] = useState(null)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    let active = true

    const loadConfig = async () => {
      try {
        if (typeof paymentAPI.getPayHereConfigStatus !== 'function') {
          if (active) {
            setConfigured(false)
          }
          return
        }

        const response = await paymentAPI.getPayHereConfigStatus()
        if (active) {
          setConfigured(Boolean(response.data?.data?.configured))
        }
      } catch (error) {
        console.error('PayHere config check failed:', error)
        if (active) {
          setConfigured(false)
        }
      }
    }

    loadConfig()

    return () => {
      active = false
    }
  }, [])

  const startCheckout = async () => {
    try {
      if (configured === false) {
        const error = new Error('PayHere is not configured on this backend yet.')
        if (onError) onError(error)
        return
      }

      setLoading(true)

      const customer = buildCustomerFallback(user)
      const response = await paymentAPI.createPayHereCheckoutData({
        paymentType,
        bookingId,
        tourRequestId,
        bidId,
        items,
        amount,
        currency,
        customer
      })

      const checkout = response.data.data.checkout

      if (onCreated) {
        onCreated(checkout)
      }

      const form = document.createElement('form')
      form.method = 'POST'
      form.action = sandboxAction

      Object.entries(checkout).forEach(([name, value]) => {
        if (name === 'sandboxUrl') return
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = name
        input.value = value == null ? '' : String(value)
        form.appendChild(input)
      })

      document.body.appendChild(form)
      form.submit()
    } catch (error) {
      console.error('PayHere checkout error:', error)
      if (onError) onError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      className={`${className} ${configured === false ? 'opacity-70 ring-2 ring-amber-300 border-amber-400 bg-amber-100 text-amber-900 hover:bg-amber-100 cursor-not-allowed' : ''}`}
      onClick={startCheckout}
      disabled={disabled || loading || configured === false}
      title={configured === false ? 'PayHere credentials are missing in the backend .env file' : undefined}
    >
      {children || (configured === false ? 'PayHere not configured' : loading ? 'Redirecting to PayHere...' : 'Pay with PayHere')}
    </button>
  )
}

export default PayHereCheckoutButton