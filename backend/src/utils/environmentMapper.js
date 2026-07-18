/** Maps dashboard environments to URLs. */

const { ENV_URLS } = require('./constants');

let _getEnvironments = null;

function getEnvMap() {
  if (!_getEnvironments) {
    try {
      _getEnvironments = require('../controllers/settings.controller').getEnvironments;
    } catch {
      return { ...ENV_URLS };
    }
  }
  return _getEnvironments();
}

/** Resolves the BASE_URL for an environment. */
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

/** Retrieves all environment mappings. */
function getAllEnvironments() {
  return getEnvMap();
}

module.exports = { resolveBaseUrl, getAllEnvironments };
