import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/database.js';
import dns from 'dns';

dns.setServers(['1.1.1.1', '8.8.8.8']);

const PORT = process.env.PORT || 4000;

(async () => {
  // Connect to the database before starting the server
  await connectDB();

  /**@type {import('http').Server} */
  const server = app.listen(PORT, () => {
    console.log(`\nServer is running on render at PORT: ${PORT}/`);
  });

  /**@param {Error} error */
  const handleServerError = error => {
    console.error('Server error:', error);
    process.exit(1);
  };

  server.on('error', handleServerError);

  /**@param {string} signal */
  const gracefulShutdown = signal => {
    console.log(`\n${signal} received. Shutting down...`);
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
  process.on('uncaughtException', gracefulShutdown);
})();
