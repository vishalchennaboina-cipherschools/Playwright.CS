/**
 * @fileoverview 404 "Not Found" fallback middleware.
 *
 * Registered after all routes. If no route matched, this sends
 * a structured 404 JSON response.
 *
 * @module middleware/notFound
 */

/**
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
function notFound(req, res) {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = notFound;
