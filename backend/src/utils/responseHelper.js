/** Provides standardised HTTP response helpers. */

/** Sends a successful JSON response. */
function sendSuccess(res, data, statusCode = 200) {
  res.status(statusCode).json(data);
}

/** Sends a JSON error response. */
function sendError(res, message, statusCode = 500, details = undefined) {
  const body = { error: message };
  if (details !== undefined) body.details = details;
  res.status(statusCode).json(body);
}

/** Sends a simple acknowledgment response. */
function sendOk(res, extra = {}) {
  res.json({ ok: true, ...extra });
}

module.exports = { sendSuccess, sendError, sendOk };
