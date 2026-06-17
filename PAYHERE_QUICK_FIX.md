# 🚀 PayHere Sandbox Fix - Quick Action Items

## Issue
PayHere sandbox shows: **"Unauthorized payment request"** → Hash signature mismatch

## Fix (3 Steps)

### 1️⃣ Get Correct Merchant Secret
- Visit https://sandbox.payhere.lk/ (or your PayHere dashboard)
- Log in → Settings/Dashboard → API Settings
- Copy your **Merchant Secret** (the raw value, not base64)
- Copy your **Merchant ID**

### 2️⃣ Update Backend/.env
```bash
# File: Backend/.env

PAYHERE_MERCHANT_ID=1236017              # Your ID from PayHere
PAYHERE_MERCHANT_SECRET_ENCODING=plain   # Must be "plain"
PAYHERE_MERCHANT_SECRET=YOUR_SECRET_HERE # Paste raw secret here
```

### 3️⃣ Restart Backend & Test
```powershell
# Kill existing processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Start backend (watch logs for ✅ PayHere Configured)
cd "Backend"
npm start

# In new terminal, test hash:
node test-payhere-hash.js
```

## Debugging Endpoints Available

**Check Configuration:**
```bash
curl http://localhost:5000/api/payments/payhere/config
```

**Test Hash Computation:**
```bash
curl -X POST http://localhost:5000/api/payments/payhere/test/hash \
  -H "Content-Type: application/json" \
  -d '{"orderId":"TEST123","amount":"1000.00","currency":"LKR"}'
```

**Validate Secret:**
```bash
curl http://localhost:5000/api/payments/payhere/test/validate-secret
```

## What Was Fixed

✅ Enhanced signature verification (tolerates PayHere field name variations)  
✅ Extended URL-encoded body parsing for webhook  
✅ Sandbox auto-detection  
✅ Comprehensive logging for debugging  
✅ Test helper endpoints  
✅ Better error handling  

## Backend Logs When Payment Is Submitted

You should see:
```
🔍 PayHere Checkout Payload Debug
============================================================
Merchant ID: 1236017
Order ID: PH12A3B4C5D6E7F8G9H0I
Amount: 9250.00
Currency: LKR
Hash: 11C108F559D5547336339608025D9835
...
============================================================
```

---

**💡 Tip:** If payment still fails after these steps, the merchant secret from your .env doesn't match what PayHere expects. Double-check it's exactly as shown in your PayHere dashboard.

See detailed guides:
- [PAYHERE_FIX.md](PAYHERE_FIX.md) - Comprehensive troubleshooting
- [PAYHERE_DEBUG.md](PAYHERE_DEBUG.md) - Advanced debugging  
- [Backend/.env.example](.env.example) - Configuration reference
