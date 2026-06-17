# PayHere Sandbox Payment - Hash Mismatch Fix

## Problem
PayHere is rejecting your payment with "Unauthorized payment request" — this means the hash signature doesn't match.

## Root Cause
The most common reason is that the `PAYHERE_MERCHANT_SECRET` in your `.env` file doesn't match the secret from your PayHere merchant account.

## Solution

### Step 1: Get the Correct Merchant Secret

**For Test/Sandbox:**

1. Visit: https://sandbox.payhere.lk/
2. Log in with your sandbox credentials
3. Go to **Settings** or **Dashboard** → **API Settings**
4. Copy the **Merchant Secret** (should be a long alphanumeric string, NOT base64)
5. Copy the **Merchant ID** (should be numeric)

### Step 2: Update Backend/.env

```bash
# Open Backend/.env and update:

PAYHERE_MERCHANT_ID=1236017              # Your merchant ID from PayHere
PAYHERE_MERCHANT_SECRET_ENCODING=plain   # Set to "plain" for raw secret
PAYHERE_MERCHANT_SECRET=YOUR_SECRET_HERE # Paste the secret from PayHere dashboard
```

⚠️ **Important**: If the secret is very long and looks like gibberish, that's correct. Don't encode it — just paste the raw value.

### Step 3: Verify the Fix

1. Restart backend:
```powershell
# Kill existing process
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Start backend
cd "c:\Users\ASUS\Desktop\Individual Project\Individual-Project\Backend"
npm start
```

2. Watch the console output. You should see:
```
✅ PayHere Configured: {
  merchantId: '1236017',
  secretLength: 60,
  encoding: 'plain',
  sandbox: true,
  checkoutUrl: 'https://sandbox.payhere.lk/pay/checkout'
}
```

3. Test the hash computation:
```powershell
# In another terminal, run:
cd "c:\Users\ASUS\Desktop\Individual Project\Individual-Project"
node test-payhere-hash.js
```

4. Try a payment again. The backend should now log:
```
🔍 PayHere Checkout Payload Debug
============================================================
Merchant ID: 1236017
Order ID: PH12A3B4C5D...
Amount: 9250.00
Currency: LKR
Hash: (a long hex string)
...
============================================================
```

### Step 4: If Payment Still Fails

Check the backend logs for the error. Common issues:

| Error | Cause | Fix |
|-------|-------|-----|
| "Hash does not match" | Wrong merchant secret | Verify secret from PayHere dashboard |
| "Amount mismatch" | Amount format error | Should be "9250.00" not "9250" |
| "Invalid order ID" | Order ID format issue | Try order ID with only alphanumeric + underscore |
| "Merchant not found" | Wrong merchant ID | Verify merchant ID from PayHere |

### Step 5: Alternative - Use Known Test Secret

If you don't have PayHere credentials, try these test values:

```bash
PAYHERE_MERCHANT_ID=1236017
PAYHERE_MERCHANT_SECRET=Your merchant secret
PAYHERE_MERCHANT_SECRET_ENCODING=plain
```

Note: The test merchant ID 1236017 requires the correct secret. Ask your PayHere provider if unsure.

### Debugging Commands

**Check PayHere config:**
```bash
curl http://localhost:5000/api/payments/payhere/config
```

**Test hash computation:**
```bash
curl -X POST http://localhost:5000/api/payments/payhere/test/hash \
  -H "Content-Type: application/json" \
  -d '{"orderId":"TEST123","amount":"1000.00","currency":"LKR"}'
```

**Validate merchant secret:**
```bash
curl http://localhost:5000/api/payments/payhere/test/validate-secret
```

## Common Mistakes

❌ **Using base64 encoding when encoding=plain**
```bash
# WRONG
PAYHERE_MERCHANT_SECRET_ENCODING=plain
PAYHERE_MERCHANT_SECRET=MzE4MTY2OTQ2...  # This is base64!
```

✅ **Correct**
```bash
# RIGHT
PAYHERE_MERCHANT_SECRET_ENCODING=plain
PAYHERE_MERCHANT_SECRET=318166946833135...  # Raw secret
```

❌ **Including spaces or special chars in secret**
```bash
# WRONG
PAYHERE_MERCHANT_SECRET="My Secret Key"
```

✅ **Correct**
```bash
# RIGHT
PAYHERE_MERCHANT_SECRET=MySecretKeyWithoutSpaces
```

## Need Help?

If payment still fails after these steps:

1. Run `node test-payhere-hash.js` and share the output
2. Share backend logs showing the "PayHere Checkout Payload Debug" section
3. Verify merchant ID and secret match PayHere dashboard exactly
