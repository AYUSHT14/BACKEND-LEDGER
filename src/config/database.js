const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.log('Please ensure MongoDB is running locally on port 27017, or update MONGODB_URI in .env');
    process.exit(1);
  }
};

module.exports = connectDatabase;
