import { useEffect, useState } from 'react'
import { paymentAPI } from '../../api'
import { useAuthStore } from '../../store/authStore'

const defaultCheckoutAction = 'https://sandbox.payhere.lk/pay/checkout'

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

      // Debug: check if user is authenticated
      const auth = JSON.parse(localStorage.getItem('tourmate-auth'))
      if (!auth?.state?.token) {
        console.error('🔴 No auth token found! User must be logged in for payment.')
        const error = new Error('You must be logged in to make a payment.')
        if (onError) onError(error)
        return
      }

      console.log('📤 Sending checkout request with:', {
        paymentType,
        bookingId,
        tourRequestId,
        bidId,
        amount,
        currency
      })

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

      console.log('✅ Checkout response received:', response.data)

      const checkout = response.data.data.checkout
      if (!checkout) {
        throw new Error('No checkout data in response')
      }

      const checkoutAction = checkout?.checkoutUrl || defaultCheckoutAction

      // Debug: log checkout payload before submitting to PayHere
      try {
        console.log('🔷 PayHere checkout (client):', checkout)
      } catch (e) {}
      if (onCreated) {
        onCreated(checkout)
      }

      const form = document.createElement('form')
      form.method = 'POST'
      form.action = checkoutAction

      console.log('📋 Form fields being sent:')
      Object.entries(checkout).forEach(([name, value]) => {
        if (name === 'checkoutUrl' || name.startsWith('_')) return
        console.log(`  ${name}: ${String(value).substring(0, 50)}${String(value).length > 50 ? '...' : ''}`)
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = name
        input.value = value == null ? '' : String(value)
        form.appendChild(input)
      })

      document.body.appendChild(form)
      console.log('🚀 Submitting form to PayHere:', checkoutAction)
      form.submit()
    } catch (error) {
      console.error('❌ PayHere checkout error:', error)
      console.error('Error details:', error.response?.data || error.message)
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