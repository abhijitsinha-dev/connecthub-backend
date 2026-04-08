import { DB_NAME } from '../constants/db.js';
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      process.env.MONGODB_ATLAS_URI,
      {
        dbName: DB_NAME,
      }
    );
    console.log(
      `\nConnected to MongoDB: ${connectionInstance.connection.host}`
    );

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB connection disconnected. Trying to reconnect...');
    });

    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });
  } catch (err) {
    console.log('Error connecting to MongoDB:', err);
    process.exit(1);
  }
};

export default connectDB;
