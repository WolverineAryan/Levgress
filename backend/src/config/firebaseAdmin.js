const admin = require('firebase-admin');
const { credential } = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

let initialized = false;

try {
  // Option 1: Environment variable containing the JSON service account string
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: credential.cert(serviceAccount),
    });
    initialized = true;
    logger.info('Firebase Admin SDK initialized successfully from environment string');
  } else {
    // Option 2: Look for local serviceAccountKey.json file
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: credential.cert(serviceAccount),
      });
      initialized = true;
      logger.info('Firebase Admin SDK initialized successfully from serviceAccountKey.json');
    } else {
      logger.warn(
        'WARNING: firebase-admin credentials not found (neither FIREBASE_SERVICE_ACCOUNT nor src/config/serviceAccountKey.json). Google Sign-In will run in local mock mode.'
      );
    }
  }
} catch (error) {
  logger.error('Failed to initialize Firebase Admin SDK:', error);
}

module.exports = {
  admin,
  isInitialized: () => initialized,
};
