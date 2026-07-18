/** Attaches convenience methods to the response object. */

const { sendSuccess, sendError, sendOk } = require('../utils/responseHelper');

/** Attaches helper methods to every response. */
function responseFormatter(req, res, next) {
  res.sendSuccess = (data, statusCode) => sendSuccess(res, data, statusCode);
  res.sendError = (message, statusCode, details) => sendError(res, message, statusCode, details);
  res.sendOk = (extra) => sendOk(res, extra);
  next();
}

module.exports = responseFormatter;
