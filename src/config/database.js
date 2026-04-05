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
  } catch (err) {
    console.log('Error connecting to MongoDB:', err);
    process.exit(1);
  }
};

export default connectDB;
