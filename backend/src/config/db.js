/**
 * @fileoverview MongoDB connection configuration.
 *
 * Exposes methods to connect to and disconnect from the MongoDB database
 * using Mongoose. Integrates with the application logger.
 *
 * @module db
 */

const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

/**
 * Establish a connection to the MongoDB database.
 * Throws an error if the connection string is missing or invalid.
 *
 * @returns {Promise<void>}
 */
async function connectDB() {
  if (!config.mongoUri) {
    logger.error('[DB] MONGODB_URI is not defined in the environment variables.');
    throw new Error('MONGODB_URI missing');
  }

  try {
    // Mongoose handles connection retries internally with its connection pool.
    // serverSelectionTimeoutMS dictates how long to try initial connection/reconnection
    // before throwing an error.
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    
    logger.success('[DB] Successfully connected to MongoDB');
  } catch (error) {
    logger.error('[DB] Failed to connect to MongoDB', error);
    throw error;
  }
}

// ── Connection Events ────────────────────────────────────────────────────────

mongoose.connection.on('disconnected', () => {
  logger.warn('[DB] MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.success('[DB] MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error('[DB] MongoDB connection error', err);
});

/**
 * Gracefully disconnect from the MongoDB database.
 *
 * @returns {Promise<void>}
 */
async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.disconnect();
      logger.info('[DB] MongoDB connection closed gracefully');
    } catch (error) {
      logger.error('[DB] Error during MongoDB disconnection', error);
    }
  }
}

module.exports = { connectDB, disconnectDB };
