const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/phishaware';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(` MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(` MongoDB Connection Warning: ${error.message}`);
    console.warn(' Operating in Fallback/Demo Mode if DB is not reachable. Update MONGODB_URI in .env to connect Atlas.');
    return false;
  }
};

module.exports = connectDB;
