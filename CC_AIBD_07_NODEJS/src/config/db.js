const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      const conn = await mongoose.connect(config.mongodbUri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
