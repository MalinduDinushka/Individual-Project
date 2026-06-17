require('dotenv').config();
const mongoose = require('mongoose');
const TourRequest = require('../models/TourRequest');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tourmate';

(async () => {
  try {
    await mongoose.connect(uri);
    console.log('Connected to DB');

    const trId = '6a311694d8ddd4a70a825850';
    const tr = await TourRequest.findById(trId).lean();
    console.log('TourRequest:', tr);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
