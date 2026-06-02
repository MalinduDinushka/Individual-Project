const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not configured in .env');
    }

    if (uri.startsWith('mongodb+srv://')) {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      console.log('🔎 Using public DNS for MongoDB SRV lookup');
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (process.env.MONGODB_URI) {
      console.error(`   MongoDB URI: ${process.env.MONGODB_URI.replace(/(mongodb\+srv:\/\/[^:]+):[^@]+@/, '$1:*****@')}`);
    }
    console.error(`💡 Please set up MongoDB:`);
    console.error(`   Option 1: Install MongoDB locally and start the service`);
    console.error(`   Option 2: Use MongoDB Atlas (cloud) - Update MONGODB_URI in .env`);
    console.error(`   Get free cluster at: https://www.mongodb.com/cloud/atlas`);
    // Don't exit, let server run for testing
  }
};

module.exports = connectDB;
