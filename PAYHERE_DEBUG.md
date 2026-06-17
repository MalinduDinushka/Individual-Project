# PayHere Sandbox Payment Debug Guide

## Issue: "Unauthorized payment request"

This error means PayHere rejected the hash signature. Follow these steps to debug:

### Step 1: Check Backend Logs

1. Kill existing processes:
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

2. Start backend with logs visible:
```powershell
cd "c:\Users\ASUS\Desktop\Individual Project\Individual-Project\Backend"
npm start
```

3. Attempt a payment from the frontend and **screenshot the backend terminal** showing:
   - "PayHere checkout payload:" with merchant_id, order_id, amount, hash, _hashInput
   - Any error messages

### Step 2: Verify Hash Computation

Use the test helper endpoint:

```bash
curl -X POST http://localhost:5000/api/payments/payhere/test/hash \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TESTORDER123",
    "amount": "9250.00",
    "currency": "LKR"
  }'
```

Expected response should show:
```json
{
  "success": true,
  "data": {
    "hash": "SOME_HASH_HERE",
    "hashInput": "HASH_INPUT_STRING",
    "sandbox": true,
    "merchantId": "1236017",
    "orderId": "TESTORDER123",
    "amount": "9250.00",
    "currency": "LKR"
  }
}
```

### Step 3: Check Merchant Secret

The merchant secret in .env must be correct. In PayHere Dashboard:

1. Go to https://sandbox.payhere.lk (Merchant Dashboard)
2. Look for "Settings" or "API Keys" section
3. Find your merchant secret
4. Ensure it matches what's in Backend/.env

If the secret is different:
- Update `PAYHERE_MERCHANT_SECRET` with the correct value
- Set `PAYHERE_MERCHANT_SECRET_ENCODING=plain` (unless you manually base64 encoded it)
- Restart backend

### Step 4: Common Issues

**Issue A: Amount Format**
- PayHere expects amounts like "9250.00" (2 decimal places)
- Not "9250" or "9,250" or "9250.0"

**Issue B: Order ID Format**
- Order ID must be unique per transaction
- Should be alphanumeric
- Our format: "PH" + random hex (e.g., "PH12A3B4C5D6E7F8G9H0I")

**Issue C: Merchant Secret Encoding**
- If PAYHERE_MERCHANT_SECRET_ENCODING=base64, the secret string should be base64 encoded
- If plain, use the raw secret from PayHere
- Don't mix them!

**Issue D: CORS/Redirect Issues**
- Make sure PAYHERE_NOTIFY_URL in .env is correct
- For local dev, it's OK if it's localhost (PayHere will skip server-to-server calls in sandbox)

### Step 5: Manual Test with PayHere Credentials

Open a terminal and test hash generation with known values:

```powershell
$merchantId = "1236017"
$orderId = "TEST123"
$amount = "1000.00"
$currency = "LKR"
$merchantSecret = "318166946833135765069434921031222356402"  # decoded from .env

# Create secret hash
$secretMD5 = ([System.Security.Cryptography.MD5]::Create()).ComputeHash([System.Text.Encoding]::UTF8.GetBytes($merchantSecret))
$secretHashString = -join ($secretMD5 | ForEach-Object { "{0:X2}" -f $_ })

echo "Secret Hash: $secretHashString"

# Create full hash input
$hashInput = "$merchantId" + "$orderId" + "$amount" + "$currency" + "$secretHashString"
echo "Hash Input: $hashInput"

# Create final hash
$hashBytes = ([System.Security.Cryptography.MD5]::Create()).ComputeHash([System.Text.Encoding]::UTF8.GetBytes($hashInput))
$finalHash = -join ($hashBytes | ForEach-Object { "{0:X2}" -f $_ })

echo "Final Hash: $finalHash"
```

Compare this with what the backend is computing.

### Step 6: Check Frontend Network Request

1. Open browser DevTools (F12)
2. Go to Network tab
3. Click "Pay with PayHere" button
4. Find the POST request to `sandbox.payhere.lk/pay/checkout`
5. Look at the "Form Data" section
6. Compare the `hash` value with what backend logged

### Debug Endpoints Available

- `GET /api/payments/payhere/config` - Check configuration and sandbox mode
- `POST /api/payments/payhere/test/hash` - Compute hash for testing
- `GET /api/payments/payhere/debug/:paymentId` - Debug specific payment (requires auth)

### Still Stuck?

1. **Share terminal output** showing:
   - Backend logs when payment is attempted
   - Response from `/api/payments/payhere/test/hash` endpoint
   
2. **Verify:**
   - Merchant ID from PayHere dashboard matches .env
   - Merchant secret from PayHere dashboard (raw, not encoded) is in .env
   - `PAYHERE_MERCHANT_SECRET_ENCODING=plain` is set if using raw secret

3. **Try:** 
   - Test with amount "100.00" instead of "9250.00"
   - Use a new order ID
   - Restart backend after any .env changes
