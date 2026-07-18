/** Configures Helmet security headers. */

const helmet = require('helmet');

/** Creates security middleware for the Express app. */
function createSecurityMiddleware() {
  return [
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
      xFrameOptions: false,
    }),
  ];
}

module.exports = createSecurityMiddleware;
