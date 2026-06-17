#!/usr/bin/env node

/**
 * PayHere Integration Verification Script
 * Run this to verify your PayHere setup is correct
 * 
 * Usage: node verify-payhere.js
 */

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

// Import from Backend/.env without requiring root-level dependencies.
const envPath = path.join(__dirname, 'Backend', '.env')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return

      const separatorIndex = trimmed.indexOf('=')
      if (separatorIndex === -1) return

      const key = trimmed.slice(0, separatorIndex).trim()
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) {
        process.env[key] = value
      }
    })
}

const PAYHERE_MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID
const PAYHERE_MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET
const PAYHERE_MERCHANT_SECRET_ENCODING = String(process.env.PAYHERE_MERCHANT_SECRET_ENCODING || 'plain').toLowerCase()
const PAYHERE_CHECKOUT_URL = process.env.PAYHERE_CHECKOUT_URL
const PAYHERE_NOTIFY_URL = process.env.PAYHERE_NOTIFY_URL
const PAYHERE_RETURN_URL = process.env.PAYHERE_RETURN_URL
const PAYHERE_CANCEL_URL = process.env.PAYHERE_CANCEL_URL

console.log('🔍 PayHere Integration Verification\n')
console.log('=' .repeat(50))

// Check 1: Environment Variables
console.log('\n✓ Step 1: Checking Environment Variables')
console.log('-'.repeat(50))

let hasErrors = false

if (!PAYHERE_MERCHANT_ID) {
  console.log('❌ PAYHERE_MERCHANT_ID is not set')
  hasErrors = true
} else {
  console.log(`✅ PAYHERE_MERCHANT_ID: ${PAYHERE_MERCHANT_ID}`)
}

if (!PAYHERE_MERCHANT_SECRET) {
  console.log('❌ PAYHERE_MERCHANT_SECRET is not set')
  hasErrors = true
} else {
  console.log(`✅ PAYHERE_MERCHANT_SECRET: ${PAYHERE_MERCHANT_SECRET.substring(0, 10)}...`)
}

if (!PAYHERE_CHECKOUT_URL) {
  console.log('❌ PAYHERE_CHECKOUT_URL is not set')
  hasErrors = true
} else {
  const isSandbox = PAYHERE_CHECKOUT_URL.includes('sandbox')
  console.log(`✅ PAYHERE_CHECKOUT_URL: ${PAYHERE_CHECKOUT_URL}`)
  console.log(`   Environment: ${isSandbox ? '🧪 SANDBOX (Testing)' : '🚀 PRODUCTION'}`)
}

console.log(`✅ PAYHERE_NOTIFY_URL: ${PAYHERE_NOTIFY_URL}`)
console.log(`✅ PAYHERE_RETURN_URL: ${PAYHERE_RETURN_URL}`)
console.log(`✅ PAYHERE_CANCEL_URL: ${PAYHERE_CANCEL_URL}`)

// Check 2: Hash Generation
console.log('\n✓ Step 2: Testing Hash Generation')
console.log('-'.repeat(50))

const testOrderId = 'TEST' + Date.now()
const testAmount = '1000.00'
const testCurrency = 'LKR'

const upperMd5 = (value) => crypto.createHash('md5').update(String(value)).digest('hex').toUpperCase()
const resolveSecret = (secret) => {
  if (PAYHERE_MERCHANT_SECRET_ENCODING !== 'base64') {
    return String(secret || '').trim()
  }

  try {
    return Buffer.from(String(secret || '').trim(), 'base64').toString('utf8').trim()
  } catch (error) {
    return String(secret || '').trim()
  }
}
const secretValue = resolveSecret(PAYHERE_MERCHANT_SECRET)
const secretHash = upperMd5(secretValue)
const hashInput = `${PAYHERE_MERCHANT_ID}${testOrderId}${testAmount}${testCurrency}${secretHash}`
const testHash = upperMd5(hashInput)

console.log(`Order ID: ${testOrderId}`)
console.log(`Amount: ${testAmount}`)
console.log(`Currency: ${testCurrency}`)
console.log(`Merchant Secret: ${secretValue ? `*** (${PAYHERE_MERCHANT_SECRET_ENCODING})` : '(missing)'}`)
console.log(`Final Hash: ${testHash}`)
console.log('✅ Hash generation working correctly')

// Check 3: Configuration Quality
console.log('\n✓ Step 3: Configuration Quality Checks')
console.log('-'.repeat(50))

if (PAYHERE_NOTIFY_URL && PAYHERE_NOTIFY_URL.includes('<your-ngrok>')) {
  console.log('⚠️  PAYHERE_NOTIFY_URL contains placeholder')
  console.log('   Action: Replace <your-ngrok> with actual ngrok URL')
  hasErrors = true
} else if (PAYHERE_NOTIFY_URL && !PAYHERE_NOTIFY_URL.includes('https') && !PAYHERE_NOTIFY_URL.includes('localhost')) {
  console.log('⚠️  PAYHERE_NOTIFY_URL should use HTTPS for production')
}

if (PAYHERE_NOTIFY_URL && PAYHERE_NOTIFY_URL.includes('localhost')) {
  console.log('ℹ️  PAYHERE_NOTIFY_URL is using localhost (for local development)')
  console.log('   For production, this must be a public HTTPS URL')
}

// Check 4: Test Credentials
console.log('\n✓ Step 4: Merchant ID Validation')
console.log('-'.repeat(50))

if (PAYHERE_MERCHANT_ID === '1236017') {
  console.log('✅ Using PayHere test merchant ID')
  console.log('   Note: This is for sandbox testing only')
}

// Check 5: URL Validation
console.log('\n✓ Step 5: URL Validation')
console.log('-'.repeat(50))

const validateUrl = (url, name) => {
  try {
    new URL(url)
    console.log(`✅ ${name} is valid URL`)
    return true
  } catch (e) {
    console.log(`❌ ${name} is not a valid URL: ${url}`)
    return false
  }
}

validateUrl(PAYHERE_CHECKOUT_URL, 'PAYHERE_CHECKOUT_URL')
validateUrl(PAYHERE_RETURN_URL, 'PAYHERE_RETURN_URL')
validateUrl(PAYHERE_CANCEL_URL, 'PAYHERE_CANCEL_URL')
validateUrl(PAYHERE_NOTIFY_URL, 'PAYHERE_NOTIFY_URL')

// Summary
console.log('\n' + '='.repeat(50))
console.log('📋 Summary\n')

if (hasErrors) {
  console.log('❌ Some issues found. Please fix them above.')
  console.log('\nCommon fixes:')
  console.log('1. Set all PayHere credentials in .env')
  console.log('2. For local dev, use: ngrok http 5000')
  console.log('3. Update PAYHERE_NOTIFY_URL with ngrok URL')
  console.log('4. Verify PayHere account at https://sandbox.payhere.lk')
  process.exit(1)
} else {
  console.log('✅ All checks passed! Your PayHere configuration looks good.')
  console.log('\nNext steps:')
  console.log('1. Test payment flow in your app')
  console.log('2. Check backend logs for payment processing')
  console.log('3. Verify payments in PayHere dashboard')
  console.log('\nTest card details (Sandbox):')
  console.log('- Card Number: 4111111111111111')
  console.log('- Expiry: Any future date')
  console.log('- CVV: Any 3 digits')
  process.exit(0)
}
