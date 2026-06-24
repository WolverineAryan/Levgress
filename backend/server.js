const http = require('http');
const app = require('./src/app');
const config = require('./src/config/env');
const connectDB = require('./src/config/db');
const socketConfig = require('./src/config/socket');
const logger = require('./src/utils/logger');

// Connect to MongoDB database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
socketConfig.init(server, {
  origin: config.clientUrl,
  methods: ['GET', 'POST'],
  credentials: true,
});

// Start listening
const PORT = config.port;
server.listen(PORT, () => {
  logger.info(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});

// Handle unhandled promise rejections outside Express
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully...');
  server.close(() => {
    logger.info('💥 Process terminated!');
  });
});
