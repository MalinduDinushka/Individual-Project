require('dotenv').config();
const mongoose = require('mongoose');
const Payment = require('../models/Payment');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tourmate';

(async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to DB');

    // Look for pending payhere payments of amount 9250
    const amountToFind = 9250;
    const payment = await Payment.findOne({ amount: amountToFind, gateway: 'payhere', status: 'pending' }).lean();

    if (!payment) {
      console.log('No pending payhere payment found for amount', amountToFind);
    } else {
      console.log('Found payment:', payment);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
