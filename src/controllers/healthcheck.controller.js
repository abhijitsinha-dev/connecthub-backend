import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';

const healthCheck = asyncHandler((req, res) => {
  // Check MongoDB connection state
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbState = mongoose.connection.readyState;
  const isDbConnected = dbState === 1;

  const healthCheck = {
    status: isDbConnected ? 'UP' : 'DOWN',
    uptime: process.uptime(), // seconds
    timestamp: new Date().toISOString(),
    database: {
      status: isDbConnected ? 'connected' : 'disconnected',
      readyState: dbState,
    },
    memory: {
      // Returns memory usage in Megabytes (MB)
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
    },
  };

  // If the DB is down, return a 503 error, otherwise 200 OK
  if (!isDbConnected) {
    return res.status(503).json(healthCheck);
  }

  res.status(200).json(healthCheck);
});

export default healthCheck;
