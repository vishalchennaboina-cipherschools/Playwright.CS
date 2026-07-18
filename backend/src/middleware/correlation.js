/** Uses AsyncLocalStorage to generate and store a unique Request ID. */

'use strict';

const { AsyncLocalStorage } = require('node:async_hooks');
const crypto = require('node:crypto');

const correlationStore = new AsyncLocalStorage();

/** Generates a Request ID. */
function generateRequestId() {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const shortId = crypto.randomUUID().split('-')[0];
  return `REQ-${date}-${shortId}`;
}

/** Wraps the request in an AsyncLocalStorage context. */
function correlationMiddleware(req, res, next) {
  const requestId = req.headers['x-request-id'] || generateRequestId();
  
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  const store = new Map();
  store.set('requestId', requestId);

  correlationStore.run(store, () => {
    next();
  });
}

/** Retrieves the current Request ID. */
function getRequestId() {
  const store = correlationStore.getStore();
  return store ? store.get('requestId') : undefined;
}

module.exports = {
  correlationMiddleware,
  getRequestId,
  correlationStore
};
