# Payment Integration Guide for TourMate

## Quick Start

### 1. Add Payment Button to Booking Page

```jsx
import PaymentModal from '../components/PaymentModal'
import { useState } from 'react'

const BookingDetails = ({ booking }) => {
  const [showPayment, setShowPayment] = useState(false)

  return (
    <div>
      <h1>{booking.serviceSnapshot?.name}</h1>
      <p>Amount: Rs. {booking.pricing.totalAmount}</p>
      
      {booking.paymentStatus !== 'paid' && (
        <button
          onClick={() => setShowPayment(true)}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark"
        >
          Pay Now
        </button>
      )}

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        paymentType="booking"
        bookingId={booking._id}
        amount={booking.pricing.totalAmount}
        serviceName={booking.serviceSnapshot?.name}
        onSuccess={() => {
          // Refresh booking data
          window.location.reload()
        }}
      />
    </div>
  )
}
```

### 2. Add Payment for Tour Request

```jsx
import PaymentModal from '../components/PaymentModal'
import { useState } from 'react'

const TourRequestDetails = ({ tourRequest, acceptedBid }) => {
  const [showPayment, setShowPayment] = useState(false)

  return (
    <div>
      <h1>{tourRequest.title}</h1>
      <p>Advance Amount: Rs. {tourRequest.advancePayment?.amount}</p>
      
      {tourRequest.status === 'awaiting-payment' && (
        <button
          onClick={() => setShowPayment(true)}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark"
        >
          Pay Advance
        </button>
      )}

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        paymentType="tour-request-advance"
        tourRequestId={tourRequest._id}
        bidId={acceptedBid._id}
        amount={tourRequest.advancePayment?.amount}
        serviceName={`Advance for ${tourRequest.title}`}
        onSuccess={() => {
          window.location.reload()
        }}
      />
    </div>
  )
}
```

### 3. Use Payment Service

```jsx
import { createBookingCheckout } from '../services/paymentService'

const handlePayment = async (bookingId) => {
  try {
    const response = await createBookingCheckout(bookingId)
    // Response includes checkout data
    console.log(response.data.checkout)
  } catch (error) {
    console.error('Payment error:', error.message)
  }
}
```

### 4. Handle Payment Return

```jsx
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { handlePaymentReturn } from '../services/paymentService'

const PaymentReturn = () => {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const { isSuccess, isFailed, orderId } = handlePaymentReturn(searchParams)

    if (isSuccess) {
      // Show success message
      console.log(`Payment ${orderId} successful!`)
      // Redirect or refresh
    } else if (isFailed) {
      // Show error message
      console.log('Payment failed')
    }
  }, [searchParams])

  return <div>Processing payment...</div>
}
```

## Component Props

### PaymentModal

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Whether modal is visible |
| `onClose` | function | Yes | Called when modal closes |
| `paymentType` | 'booking' \| 'tour-request-advance' | Yes | Type of payment |
| `bookingId` | string | Conditional* | MongoDB ID of booking |
| `tourRequestId` | string | Conditional* | MongoDB ID of tour request |
| `bidId` | string | Conditional* | MongoDB ID of bid |
| `amount` | number | No | Display amount |
| `serviceName` | string | No | Display service name |
| `onSuccess` | function | No | Called on successful payment |

*Provide based on `paymentType`

### PayHereCheckout

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `bookingId` | string | Conditional* | MongoDB ID of booking |
| `tourRequestId` | string | Conditional* | MongoDB ID of tour request |
| `bidId` | string | Conditional* | MongoDB ID of bid |
| `paymentType` | 'booking' \| 'tour-request-advance' | Yes | Type of payment |
| `onSuccess` | function | No | Called on payment submission |
| `onCancel` | function | No | Called on cancel |

## Payment Statuses

```
pending ──→ completed
       ╰──→ failed
```

- **pending**: Payment initiated, awaiting customer action
- **completed**: Payment successful
- **failed**: Payment declined or cancelled

## Error Handling

```jsx
import { useState } from 'react'

const PaymentForm = ({ bookingId }) => {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    try {
      setError('')
      setLoading(true)
      
      const response = await fetch('/api/payments/payhere/checkout-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentType: 'booking',
          bookingId
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Payment failed')
      }

      // Form will auto-submit to PayHere
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && <div className="text-red-600">{error}</div>}
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  )
}
```

## Testing

### Test Payment Flow

1. **Create Booking**
   - Navigate to service and create booking
   - Verify booking created with pending payment status

2. **Initiate Payment**
   - Click "Pay Now" button
   - Verify payment modal opens
   - Check console for hash generation debug info

3. **Complete Payment**
   - Use test card: 4111111111111111
   - Fill payment form on PayHere
   - Verify redirect back to app

4. **Verify Status**
   - Check booking payment status updated
   - Verify notification created
   - Check Payment record in database

### Debug Commands

```js
// Check PayHere configuration
fetch('/api/payments/payhere/config').then(r => r.json()).then(d => console.log(d))

// Generate checkout data
fetch('/api/payments/payhere/checkout-data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    paymentType: 'booking',
    bookingId: 'booking_id'
  })
}).then(r => r.json()).then(d => console.log(d))
```

## Common Issues

### Payment Modal Not Opening
- Ensure `isOpen` state is being toggled
- Check browser console for errors
- Verify PaymentModal component is imported

### Checkout Data Not Loading
- Check backend is running
- Verify bookingId/tourRequestId is valid
- Check authentication token is included
- Review console for detailed error

### PayHere Form Not Submitting
- Verify all hidden form fields have values
- Check browser console for JavaScript errors
- Ensure no Content Security Policy blocks form submission

### Payment Status Not Updating
- Verify PAYHERE_NOTIFY_URL in backend .env is correct
- Use ngrok for local development
- Check backend logs for IPN notification receipt
- Verify signature validation passes

## Production Checklist

- [ ] Update PayHere credentials to production
- [ ] Change PAYHERE_CHECKOUT_URL to production
- [ ] Update all URLs to HTTPS
- [ ] Test complete payment flow
- [ ] Set up payment reconciliation
- [ ] Configure backup payment methods
- [ ] Monitor payment notifications
- [ ] Set up error alerts/logging
