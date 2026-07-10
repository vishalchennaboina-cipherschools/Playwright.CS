/**
 * @fileoverview Response formatter middleware.
 *
 * Attaches convenience methods to the response object
 * so controllers can call `res.sendSuccess(data)` etc.
 *
 * @module middleware/responseFormatter
 */

const { sendSuccess, sendError, sendOk } = require('../utils/responseHelper');

/**
 * Attach helper methods to every response.
 *
 * @param {import('express').Request}      req
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} next
 */
function responseFormatter(req, res, next) {
  res.sendSuccess = (data, statusCode) => sendSuccess(res, data, statusCode);
  res.sendError = (message, statusCode, details) => sendError(res, message, statusCode, details);
  res.sendOk = (extra) => sendOk(res, extra);
  next();
}

module.exports = responseFormatter;
