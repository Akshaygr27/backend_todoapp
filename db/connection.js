// MongoDB Configuration

const mongoose = require('mongoose');
require('dotenv').config(); // Load from .env

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('DB connection failed:', error.message);
    process.exit(1); // stop app if DB fails
  }
};

module.exports = connectDB;

