/** Configures the MongoDB connection. */

const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

/** Establishes a connection to MongoDB. */
async function connectDB() {
  if (!config.mongoUri) {
    logger.error('MONGODB_URI is not defined in the environment variables.', { category: logger.CATEGORIES.DATABASE });
    throw new Error('MONGODB_URI missing');
  }

  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    
    logger.success('Successfully connected to MongoDB', { category: logger.CATEGORIES.DATABASE });
  } catch (error) {
    logger.error('Failed to connect to MongoDB', { category: logger.CATEGORIES.DATABASE, error });
    throw error;
  }
}

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected', { category: logger.CATEGORIES.DATABASE });
});

mongoose.connection.on('reconnected', () => {
  logger.success('MongoDB reconnected', { category: logger.CATEGORIES.DATABASE });
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error', { category: logger.CATEGORIES.DATABASE, error: err });
});

/** Gracefully disconnects from MongoDB. */
async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.disconnect();
      logger.info('MongoDB connection closed gracefully', { category: logger.CATEGORIES.DATABASE });
    } catch (error) {
      logger.error('Error during MongoDB disconnection', { category: logger.CATEGORIES.DATABASE, error });
    }
  }
}

module.exports = { connectDB, disconnectDB };
