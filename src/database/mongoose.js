import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 50),
      minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 5),
      serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 5000),
      socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS || 45000),
      maxIdleTimeMS: Number(process.env.MONGO_MAX_IDLE_TIME_MS || 60000),
      autoIndex: process.env.NODE_ENV !== 'production'
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Database connection error:', error.message);
  }
};
export default connectDB;
