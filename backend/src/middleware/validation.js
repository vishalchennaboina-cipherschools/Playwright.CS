/** Validates incoming payloads. */

const { BROWSERS, MODES } = require('../utils/constants');

/** Validates the execution request body. */
function validateStartExecution(req, res, next) {
  const { suite, environment, browser, mode, workers } = req.body;
  const errors = [];

  if (!suite || typeof suite !== 'string' || suite.trim().length === 0) {
    errors.push('Suite (test folder) is required.');
  }

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

  req.body.workers = w;
  next();
}

/** Validates the execution ID parameter. */
function validateExecId(req, res, next) {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return res.status(400).json({ error: 'Missing or invalid execution id.' });
  }
  next();
}

module.exports = { validateStartExecution, validateExecId };
