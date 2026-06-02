# PayHere Payment Gateway Setup Guide

## Overview
TourMate uses PayHere for payment processing. PayHere is a secure payment gateway specifically designed for Sri Lanka.

## Prerequisites

### 1. Create a PayHere Account
1. Visit https://sandbox.payhere.lk (for testing)
2. Sign up and create a merchant account
3. Note your Merchant ID and Merchant Secret

### 2. Environment Configuration

Update your `.env` file with PayHere credentials:

```env
# PayHere Configuration
PAYHERE_MERCHANT_ID=your_merchant_id_here
PAYHERE_MERCHANT_SECRET=your_merchant_secret_here
PAYHERE_CHECKOUT_URL=https://sandbox.payhere.lk/pay/checkout
PAYHERE_NOTIFY_URL=http://your-domain.com/api/payments/payhere/notify
PAYHERE_RETURN_URL=http://localhost:3000/tourist/trips
PAYHERE_CANCEL_URL=http://localhost:3000/tourist/requests
```

### 3. Using ngrok for Local Development

For local testing with PayHere (which requires HTTPS notifications):

```bash
# Install ngrok: https://ngrok.com/
# Start ngrok
ngrok http 5000

# Copy the https URL and update .env
PAYHERE_NOTIFY_URL=https://your-ngrok-url.ngrok.io/api/payments/payhere/notify
```

## Implementation Details

### Frontend Payment Flow

1. **Initiate Payment** - User clicks "Pay Now" button
2. **Get Checkout Data** - Frontend calls `/api/payments/payhere/checkout-data`
3. **PayHere Redirect** - Auto-submits form to PayHere checkout
4. **Payment Processing** - User completes payment on PayHere
5. **Return to App** - PayHere redirects back to return_url

### Backend Payment Processing

1. **Payment Initialization** - Backend creates Payment record
2. **Hash Generation** - Generates MD5 hash for PayHere verification
3. **IPN Notification** - PayHere sends payment confirmation to notify_url
4. **Status Update** - Backend updates Payment and Booking status
5. **Notification** - Users are notified of payment status

## API Endpoints

### Create Payment for Booking
```
POST /api/payments/payhere/checkout-data
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "paymentType": "booking",
  "bookingId": "booking_id_here"
}
```

### Create Advance Payment for Tour Request
```
POST /api/payments/payhere/checkout-data
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "paymentType": "tour-request-advance",
  "tourRequestId": "tour_request_id_here",
  "bidId": "bid_id_here"
}
```

### Check Payment Status
```
GET /api/payments/{paymentId}
Authorization: Bearer {token}
```

### Check PayHere Configuration
```
GET /api/payments/payhere/config
```

## Payment Statuses

- **pending** - Payment initiated, awaiting customer action
- **completed** - Payment successful, order status updated
- **failed** - Payment failed or declined
- **cancelled** - Customer cancelled the payment

## Testing Payment Gateway

### Test Credentials (Sandbox)
- Card Number: 4111111111111111
- Expiry: Any future date (MM/YY)
- CVV: Any 3 digits

### Test Payment Flow
1. Create a booking
2. Click "Pay Now"
3. You'll be redirected to PayHere sandbox
4. Use test card details above
5. Complete the payment
6. Return to app - payment status will be updated

## Troubleshooting

### "Unauthorized payment request" Error
**Causes:**
- Incorrect Merchant ID
- Incorrect or malformed Merchant Secret
- Hash calculation error
- Required fields missing

**Solutions:**
1. Verify Merchant ID and Secret in .env
2. Check PayHere sandbox credentials are correct
3. Ensure amount is formatted with 2 decimal places
4. All customer fields must be populated

### Payment Notification Not Received
**Causes:**
- NOTIFY_URL is incorrect or not HTTPS
- Firewall/proxy blocking PayHere IP addresses
- Local development without ngrok

**Solutions:**
1. Use ngrok for local development
2. Ensure NOTIFY_URL is accessible
3. Check PayHere whitelist your domain
4. Review backend logs for errors

### Hash Mismatch Error
**Cause:**
- Merchant Secret formatting issue (may be base64 encoded)

**Solution:**
- Ensure Merchant Secret is properly decoded if base64
- Verify exact string format from PayHere Dashboard

## Security Considerations

1. ✅ Always use HTTPS for notify_url
2. ✅ Validate PayHere signature on every notification
3. ✅ Store Merchant Secret securely in .env
4. ✅ Never expose Merchant Secret in frontend
5. ✅ Verify payment amount matches expected value
6. ✅ Implement proper error handling and logging

## Production Deployment

1. Create PayHere production account at https://payhere.lk
2. Update credentials to production Merchant ID/Secret
3. Change CHECKOUT_URL to: https://www.payhere.lk/pay/checkout
4. Update NOTIFY_URL, RETURN_URL, CANCEL_URL to production domain
5. Ensure all URLs use HTTPS
6. Test thoroughly before going live

## Support

- **PayHere Documentation:** https://payhere.lk/developers
- **PayHere Support:** support@payhere.lk
- **TourMate Backend:** Check `/controllers/paymentController.js`
