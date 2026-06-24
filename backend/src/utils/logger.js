const config = require('../config/env');

const logger = {
  info: (message, ...meta) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, ...meta);
  },
  error: (message, error, ...meta) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error ? error.stack || error : '', ...meta);
  },
  warn: (message, ...meta) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, ...meta);
  },
  debug: (message, ...meta) => {
    if (config.nodeEnv === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()}: ${message}`, ...meta);
    }
  },
};

module.exports = logger;
