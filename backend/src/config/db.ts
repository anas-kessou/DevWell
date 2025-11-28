import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI not set in .env file');
    console.error('Please create a .env file with: MONGO_URI=mongodb://localhost:27017/devwell');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    console.error('Please check your MONGO_URI in .env file');
    process.exit(1);
  }
};

export default connectDB;