#!/usr/bin/env node

/**
 * PayHere Hash Validation Test
 * Tests hash computation for PayHere sandbox payments
 */

const crypto = require('crypto');
const axios = require('axios');

const upperMd5 = (value) => crypto.createHash('md5').update(String(value)).digest('hex').toUpperCase();

console.log('\n🧪 PayHere Hash Validation Test\n');
console.log('='.repeat(70));

// Test data
const merchantId = '1236017';  // PayHere test merchant
const orderId = 'TEST_' + Date.now();
const amount = '1000.00';
const currency = 'LKR';

// Try with the merchant secret from .env (decoded from base64)
const merchantSecret = '318166946833135765069434921031222356402';

console.log('\n📋 Test Parameters:');
console.log('  Merchant ID:', merchantId);
console.log('  Order ID:', orderId);
console.log('  Amount:', amount);
console.log('  Currency:', currency);
console.log('  Merchant Secret:', merchantSecret.substring(0, 10) + '...');

// Hash calculation
const secretHash = upperMd5(merchantSecret);
const hashInput = `${merchantId}${orderId}${amount}${currency}${secretHash}`;
const hash = upperMd5(hashInput);

console.log('\n🔐 Hash Computation:');
console.log('  Secret MD5:', secretHash);
console.log('  Hash Input:', hashInput);
console.log('  Final Hash:', hash);

// Now test with backend
console.log('\n🌐 Testing with Backend...');

(async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/payments/payhere/test/hash', {
      orderId: 'BACKEND_TEST_' + Date.now(),
      amount: '500.00',
      currency: 'LKR'
    });

    console.log('\n✅ Backend Response:');
    console.log('  Hash:', response.data.data.hash);
    console.log('  Sandbox:', response.data.data.sandbox);
    console.log('  Merchant ID:', response.data.data.merchantId);

    // Test secret validation endpoint
    const validateResponse = await axios.get('http://localhost:5000/api/payments/payhere/test/validate-secret');
    console.log('\n✅ Secret Validation Response:');
    console.log('  Configured:', validateResponse.data.configured);
    console.log('  Secret Length:', validateResponse.data.data.secretLength);
    console.log('  Encoding:', validateResponse.data.data.secretEncoding);
    console.log('  Sandbox:', validateResponse.data.data.sandbox);
    console.log('  Test Hash:', validateResponse.data.data.testHash.hash);

    console.log('\n' + '='.repeat(70));
    console.log('\n📝 Next Steps:');
    console.log('1. Go to PayHere sandbox: https://sandbox.payhere.lk');
    console.log('2. Log in and find your merchant secret');
    console.log('3. If the secret from PayHere differs from Backend/.env:');
    console.log('   - Update Backend/.env PAYHERE_MERCHANT_SECRET with correct value');
    console.log('   - Set PAYHERE_MERCHANT_SECRET_ENCODING=plain');
    console.log('   - Restart backend with: npm start');
    console.log('\n4. Try payment again and check backend logs\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
  }
})();
