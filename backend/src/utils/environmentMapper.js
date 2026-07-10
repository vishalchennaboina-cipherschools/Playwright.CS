/**
 * @fileoverview Environment → BASE_URL mapper.
 *
 * Maps dashboard environment names to the corresponding application URLs.
 * Now reads from the mutable settings store instead of frozen constants,
 * supporting user-configurable environments.
 *
 * @module utils/environmentMapper
 */

const { ENV_URLS } = require('./constants');

// Late-bind to avoid circular dependency at require time.
let _getEnvironments = null;

function getEnvMap() {
  if (!_getEnvironments) {
    try {
      _getEnvironments = require('../controllers/settings.controller').getEnvironments;
    } catch {
      // Fallback to constants if settings controller not yet loaded.
      return { ...ENV_URLS };
    }
  }
  return _getEnvironments();
}

/**
 * Resolve the BASE_URL for a given environment name.
 *
 * @param {string} environment - Environment name (e.g. "QA", "Production").
 * @returns {string} The corresponding application URL.
 * @throws {Error} If the environment is not recognised.
 */
function resolveBaseUrl(environment) {
  const envMap = getEnvMap();
  const url = envMap[environment];
  if (!url) {
    throw new Error(
      `Unknown environment "${environment}". Available: ${Object.keys(envMap).join(', ')}`,
    );
  }
  return url;
}

/**
 * Get all available environment mappings.
 *
 * @returns {Record<string, string>}
 */
function getAllEnvironments() {
  return getEnvMap();
}

module.exports = { resolveBaseUrl, getAllEnvironments };
