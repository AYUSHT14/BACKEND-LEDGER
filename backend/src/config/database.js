const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/backend-ledger';
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.log('Please ensure MongoDB is running locally on port 27017, or update MONGO_URI/MONGODB_URI in your environment variables.');
    process.exit(1);
  }
};

module.exports = connectDatabase;
