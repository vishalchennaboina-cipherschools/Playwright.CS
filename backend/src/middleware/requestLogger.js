/**
 * @fileoverview Custom request logger (morgan token format).
 *
 * Uses morgan to log each incoming request in a compact, coloured format.
 * In production, switches to the standard "combined" format.
 *
 * @module middleware/requestLogger
 */

const morgan = require('morgan');

/**
 * Create the morgan middleware for the current environment.
 *
 * @param {string} nodeEnv - "development" | "production" | "test".
 * @returns {import('express').RequestHandler}
 */
function createRequestLogger(nodeEnv) {
  if (nodeEnv === 'test') {
    // Silence request logs during tests.
    return (_req, _res, next) => next();
  }

  const format =
    nodeEnv === 'production'
      ? 'combined'
      : ':method :url :status :response-time ms - :res[content-length]';

  return morgan(format);
}

module.exports = createRequestLogger;
