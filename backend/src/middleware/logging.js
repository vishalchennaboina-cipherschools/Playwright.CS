/** Intercepts incoming HTTP requests and logs their details. */

'use strict';

const logger = require('../utils/logger');

/** Logs HTTP requests and responses. */
function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const elapsedMs = Number(end - start) / 1e6;

    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    // Do NOT log request bodies to prevent leaking passwords.
    logger[level](`${req.method} ${req.originalUrl}`, {
      category: logger.CATEGORIES.API,
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: res.statusCode,
      responseTimeMs: elapsedMs.toFixed(2),
    });
  });

  next();
}

module.exports = requestLogger;
