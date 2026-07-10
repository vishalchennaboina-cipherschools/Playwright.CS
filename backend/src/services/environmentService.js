/**
 * @fileoverview Environment service.
 *
 * Maps dashboard environment names to application URLs and provides
 * environment variable injection for Playwright child processes.
 *
 * @module services/environmentService
 */

const { resolveBaseUrl, getAllEnvironments } = require('../utils/environmentMapper');

/**
 * Build the environment variables to inject into the Playwright child process.
 *
 * @param {Object} params
 * @param {string} params.environment - "QA" or "Production".
 * @param {string} params.execId      - Execution ID (for per-run output dirs).
 * @returns {Object} Key-value env vars to spread into the child process env.
 */
function buildProcessEnv({ environment, execId }) {
  return {
    BASE_URL: resolveBaseUrl(environment),
    EXEC_ID: execId,
    CI: 'true', // Enables machine-friendly Playwright output
  };
}

/**
 * Get available environments for the settings endpoint.
 *
 * @returns {Record<string, string>}
 */
function getEnvironments() {
  return getAllEnvironments();
}

module.exports = { buildProcessEnv, getEnvironments };
