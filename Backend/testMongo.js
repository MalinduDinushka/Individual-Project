require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
console.log('MONGODB_URI set =', !!uri);
console.log('MONGODB_URI =', uri ? uri.replace(/(mongodb\+srv:\/\/[^:]+):[^@]+@/, '$1:*****@') : 'no uri');

(async () => {
  try {
    const conn = await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 });
    console.log('Mongo connected:', conn.connection.host);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Mongo connect error:', err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
})();
