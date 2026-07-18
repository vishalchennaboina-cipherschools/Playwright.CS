/** Masks sensitive values in log metadata recursively. */

'use strict';

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'secret',
  'cookie',
  'session',
  'authorization',
  'credentials'
]);

/** Checks if a key name suggests sensitive content. */
function isSensitiveKey(key) {
  if (typeof key !== 'string') return false;
  const lowerKey = key.toLowerCase();
  for (const sensitive of SENSITIVE_KEYS) {
    if (lowerKey.includes(sensitive)) {
      return true;
    }
  }
  return false;
}

/** Recursively masks sensitive fields in an object. */
function maskSensitiveData(data) {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveData(item));
  }

  if (typeof data === 'object' && !Buffer.isBuffer(data) && !(data instanceof Date)) {
    const masked = {};
    for (const [key, value] of Object.entries(data)) {
      if (isSensitiveKey(key)) {
        masked[key] = '***MASKED***';
      } else {
        masked[key] = maskSensitiveData(value);
      }
    }
    return masked;
  }

  return data;
}

module.exports = {
  maskSensitiveData,
  isSensitiveKey
};
