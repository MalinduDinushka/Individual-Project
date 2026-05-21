const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`💡 Please set up MongoDB:`);
    console.error(`   Option 1: Install MongoDB locally and start the service`);
    console.error(`   Option 2: Use MongoDB Atlas (cloud) - Update MONGODB_URI in .env`);
    console.error(`   Get free cluster at: https://www.mongodb.com/cloud/atlas`);
    // Don't exit, let server run for testing
  }
};

module.exports = connectDB;
