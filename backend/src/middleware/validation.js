/**
 * @fileoverview Request body validation middleware.
 *
 * Provides lightweight validation for incoming payloads
 * without external schema libraries (keeping deps minimal).
 * When a richer solution is needed, swap in Joi or Zod.
 *
 * @module middleware/validation
 */

const { BROWSERS, MODES } = require('../utils/constants');

/**
 * Validate the POST /api/executions request body.
 *
 * @param {import('express').Request}      req
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} next
 */
function validateStartExecution(req, res, next) {
  const { suite, environment, browser, mode, workers } = req.body;
  const errors = [];

  // Suite is now dynamic (folder name from spec discovery) — just needs to be non-empty.
  if (!suite || typeof suite !== 'string' || suite.trim().length === 0) {
    errors.push('Suite (test folder) is required.');
  }

  // Environment is dynamic (user-configurable) — just needs to be non-empty.
  if (!environment || typeof environment !== 'string' || environment.trim().length === 0) {
    errors.push('Environment is required.');
  }

  if (!browser || !Object.values(BROWSERS).includes(browser)) {
    errors.push(`Invalid browser "${browser}". Allowed: ${Object.values(BROWSERS).join(', ')}`);
  }

  if (!mode || !Object.values(MODES).includes(mode)) {
    errors.push(`Invalid mode "${mode}". Allowed: ${Object.values(MODES).join(', ')}`);
  }

  const w = Number(workers);
  if (!Number.isFinite(w) || w < 1 || w > 16) {
    errors.push(`Invalid workers "${workers}". Must be a number between 1 and 16.`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  // Normalise workers to a number for downstream consumers.
  req.body.workers = w;
  next();
}

/**
 * Validate that :id param is a non-empty string.
 *
 * @param {import('express').Request}      req
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} next
 */
function validateExecId(req, res, next) {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return res.status(400).json({ error: 'Missing or invalid execution id.' });
  }
  next();
}

module.exports = { validateStartExecution, validateExecId };
