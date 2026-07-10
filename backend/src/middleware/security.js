/**
 * @fileoverview Security middleware bundle.
 *
 * Configures Helmet (security headers) and prepares for future
 * rate-limiting and auth middleware.
 *
 * @module middleware/security
 */

const helmet = require('helmet');

/**
 * Create an array of security middleware for the Express app.
 *
 * @returns {import('express').RequestHandler[]}
 */
function createSecurityMiddleware() {
  return [
    helmet({
      // Allow cross-origin for artifact serving (screenshots, videos, traces)
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      // Disable CSP for now — the backend is an API, not serving HTML pages
      contentSecurityPolicy: false,
    }),
  ];
}

module.exports = createSecurityMiddleware;
