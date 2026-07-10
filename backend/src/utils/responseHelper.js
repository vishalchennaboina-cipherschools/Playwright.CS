/**
 * @fileoverview Standardised HTTP response helpers.
 *
 * Every controller uses these helpers so the response shape is consistent
 * across the entire API. The frontend expects raw data (not wrapped),
 * so `sendSuccess` sends the data directly as JSON.
 *
 * @module utils/responseHelper
 */

/**
 * Send a successful JSON response.
 *
 * @param {import('express').Response} res    - Express response object.
 * @param {*}                          data   - Payload to send as JSON body.
 * @param {number}                     [statusCode=200] - HTTP status code.
 */
function sendSuccess(res, data, statusCode = 200) {
  res.status(statusCode).json(data);
}

/**
 * Send a JSON error response.
 *
 * @param {import('express').Response} res          - Express response object.
 * @param {string}                     message      - Human-readable error message.
 * @param {number}                     [statusCode=500] - HTTP status code.
 * @param {*}                          [details]    - Optional error details.
 */
function sendError(res, message, statusCode = 500, details = undefined) {
  const body = { error: message };
  if (details !== undefined) body.details = details;
  res.status(statusCode).json(body);
}

/**
 * Send a simple acknowledgment response (e.g. for delete, stop).
 * Matches the frontend's `{ ok: true }` expectation.
 *
 * @param {import('express').Response} res       - Express response object.
 * @param {Object}                     [extra]   - Additional fields to merge (e.g. { status: 'aborted' }).
 */
function sendOk(res, extra = {}) {
  res.json({ ok: true, ...extra });
}

module.exports = { sendSuccess, sendError, sendOk };
