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
 * This is the integration point between the backend and the Playwright tests.
 * Every value consumed by automation/config/test.config.js must be set here.
 * Tests never read process.env directly — they always use the config module.
 *
 * @param {Object} params
 * @param {string} params.environment - "QA", "Production", etc.
 * @param {string} params.execId      - Execution ID (for per-run output dirs).
 * @returns {Object} Key-value env vars to spread into the child process env.
 */
function buildProcessEnv({ environment, execId }) {
  return {
    // ── Core ───────────────────────────────────────────────────────────────
    BASE_URL: resolveBaseUrl(environment),
    EXEC_ID:  execId,
    CI:       'true', // Enables machine-friendly Playwright output

    // ── Credentials ────────────────────────────────────────────────────────
    // Source from backend .env. NEVER hardcode in test files.
    TEST_EMAIL:    process.env.TEST_EMAIL    || '',
    TEST_PASSWORD: process.env.TEST_PASSWORD || '',

    // ── Test user data (account-specific values for assertions) ────────────
    TEST_DISPLAY_NAME: process.env.TEST_DISPLAY_NAME || '',
    TEST_BATCH_SLUG:   process.env.TEST_BATCH_SLUG   || '',
    TEST_CONTENT_ID:   process.env.TEST_CONTENT_ID   || '',

    // ── Timeouts (milliseconds) ────────────────────────────────────────────
    TEST_TIMEOUT:      process.env.TEST_TIMEOUT      || '80000',
    NAV_TIMEOUT:       process.env.NAV_TIMEOUT       || '60000',
    ACTION_TIMEOUT:    process.env.ACTION_TIMEOUT    || '20000',
    PAGE_WAIT_TIMEOUT: process.env.PAGE_WAIT_TIMEOUT || '1000',

    // ── Browser / artifact settings ────────────────────────────────────────
    TRACE:      process.env.TRACE      || 'on-first-retry',
    VIDEO:      process.env.VIDEO      || 'off',
    SCREENSHOT: process.env.SCREENSHOT || 'only-on-failure',
    SLOW_MO:    process.env.SLOW_MO    || '0',

    // ── Output paths ───────────────────────────────────────────────────────
    OUTPUT_DIR: process.env.OUTPUT_DIR || '/tmp/test-results',
    REPORT_DIR: process.env.REPORT_DIR || '/tmp/playwright-report',

    // ── Parallelism ────────────────────────────────────────────────────────
    RETRIES: process.env.RETRIES || '0',
    // WORKERS is intentionally omitted here — the runner passes --workers via
    // CLI args directly (execution.workers from the frontend request).
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
