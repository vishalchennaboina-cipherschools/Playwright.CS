/**
 * @fileoverview Global error-handling middleware.
 *
 * Catches any error thrown or passed via `next(err)` from upstream
 * middleware / route handlers. Logs the error and sends a consistent
 * JSON response to the client.
 *
 * Must be registered LAST in the middleware stack (after all routes).
 *
 * @module middleware/errorHandler
 */

const logger = require('../utils/logger');

/**
 * Express error-handling middleware (4-argument signature).
 *
 * @param {Error}                      err  - The error that was thrown or passed.
 * @param {import('express').Request}  req  - Express request.
 * @param {import('express').Response} res  - Express response.
 * @param {import('express').NextFunction} _next - Next function (unused but required).
 */
function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  logger.error(`[${req.method}] ${req.originalUrl} → ${statusCode}: ${message}`, err);

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
