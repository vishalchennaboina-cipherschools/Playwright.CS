/** Provides environment variable injection for Playwright child processes. */

const path = require('node:path');
const config = require('../config');
const { resolveBaseUrl, getAllEnvironments } = require('../utils/environmentMapper');

/** Builds environment variables for the Playwright child process. */
function buildProcessEnv({ environment, execId, email, password, customUrl }) {
  let baseUrl;
  if (customUrl && customUrl.trim()) {
    baseUrl = customUrl.trim();
  } else {
    baseUrl = resolveBaseUrl(environment);
  }

  return {
    BASE_URL: baseUrl,
    EXEC_ID:  execId,
    CI:       'true',

    TEST_EMAIL:    email    || process.env.TEST_EMAIL    || '',
    TEST_PASSWORD: password || process.env.TEST_PASSWORD || '',

    TEST_DISPLAY_NAME: process.env.TEST_DISPLAY_NAME || '',
    TEST_BATCH_SLUG:   process.env.TEST_BATCH_SLUG   || '',
    TEST_CONTENT_ID:   process.env.TEST_CONTENT_ID   || '',

    TEST_TIMEOUT:      process.env.TEST_TIMEOUT      || '80000',
    NAV_TIMEOUT:       process.env.NAV_TIMEOUT       || '60000',
    ACTION_TIMEOUT:    process.env.ACTION_TIMEOUT    || '20000',
    PAGE_WAIT_TIMEOUT: process.env.PAGE_WAIT_TIMEOUT || '1000',

    TRACE:      process.env.TRACE      || 'on-first-retry',
    VIDEO:      process.env.VIDEO      || 'off',
    SCREENSHOT: process.env.SCREENSHOT || 'only-on-failure',
    SLOW_MO:    process.env.SLOW_MO    || '0',

    OUTPUT_DIR: path.join(config.outputDir, execId),
    REPORT_DIR: path.join(config.reportDir, execId),

    RETRIES: process.env.RETRIES || '0',
  };
}

/** Retrieves available environments. */
function getEnvironments() {
  return getAllEnvironments();
}

module.exports = { buildProcessEnv, getEnvironments };
