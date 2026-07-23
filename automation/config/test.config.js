/**
 * @fileoverview Central test configuration.
 *
 * All configurable values live here. Tests NEVER hardcode URLs, credentials,
 * timeouts, paths, or user data — they always import from this module.
 *
 * At runtime this module is populated by environment variables injected by
 * the backend's `buildProcessEnv()` service. For local development, add a
 * `.env` file next to `playwright.config.js` (see `.env.example`).
 *
 * Flow:
 *   Frontend → selects environment/browser/workers
 *   Backend  → resolves BASE_URL + injects all env vars
 *   Playwright → reads this config → tests stay env-agnostic
 */

'use strict';

// Load .env file for local development (no-op in CI / when vars already set)
require('dotenv').config();

/** @returns {number} Parse an env var as int with a fallback default */
function envInt(key, fallback) {
  const val = parseInt(process.env[key], 10);
  return Number.isFinite(val) ? val : fallback;
}

/** @returns {string|undefined} Parse an env var, returning undefined if absent */
function envOpt(key) {
  const val = process.env[key];
  return val && val.trim() ? val.trim() : undefined;
}

/**
 * @typedef {Object} TestConfig
 * @property {string}   baseUrl              - Application root URL (e.g. https://qa.cipherschools.com)
 * @property {Object}   credentials          - Login credentials for the test user
 * @property {string}   credentials.email    - Test user email
 * @property {string}   credentials.password - Test user password
 * @property {Object}   testData             - User-specific data tied to the test account
 * @property {string}   testData.displayName - Expected display name after login
 * @property {Object}   timeouts             - All timeout values in milliseconds
 * @property {number}   timeouts.test        - Global per-test timeout
 * @property {number}   timeouts.navigation  - Page navigation timeout
 * @property {number}   timeouts.action      - Per-action timeout (clicks, fills, etc.)
 * @property {number}   timeouts.pageWait    - Polling wait between page visits
 * @property {Object}   browser              - Playwright browser/context settings
 * @property {string}   browser.trace        - Trace recording mode
 * @property {string}   browser.video        - Video recording mode
 * @property {string}   browser.screenshot   - Screenshot mode
 * @property {boolean}  browser.headless     - Headless mode flag
 * @property {number}   browser.slowMo       - Slow motion delay in ms
 * @property {string|undefined} browser.locale   - Browser locale
 * @property {Object|undefined} browser.viewport - { width, height } or undefined
 * @property {Object}   paths                - Output directory paths
 * @property {string}   paths.testResults    - Directory for raw test-results artifacts
 * @property {string}   paths.reportOutput   - Directory for HTML report
 * @property {number}   retries              - Number of test retries on failure
 * @property {string|undefined} workers      - Parallel worker count (string for Playwright config)
 */

/** @type {TestConfig} */
const config = Object.freeze({
  // ─── Base URL ────────────────────────────────────────────────────────────
  // Injected by backend environmentService.buildProcessEnv() as BASE_URL.
  baseUrl: process.env.BASE_URL || 'https://qa.cipherschools.com',

  // ─── Credentials ─────────────────────────────────────────────────────────
  // Injected by backend. NEVER hard-code email/password in test files.
  credentials: Object.freeze({
    email: process.env.VALID_EMAIL || '',
    password: process.env.STUDENT_PASSWORD || '',
  }),

  // ─── Test Data ───────────────────────────────────────────────────────────
  // Account-specific data for the test user. Changes here reflect everywhere.
  testData: Object.freeze({
    displayName: process.env.TEST_DISPLAY_NAME || '',
  }),

  // ─── Timeouts ────────────────────────────────────────────────────────────
  // All durations in milliseconds. No magic numbers in test files.
  timeouts: Object.freeze({
    test: envInt('TEST_TIMEOUT', 80000),
    navigation: envInt('NAV_TIMEOUT', 60000),
    action: envInt('ACTION_TIMEOUT', 20000),
    pageWait: envInt('PAGE_WAIT_TIMEOUT', 1000),
  }),

  // ─── Browser / Context ───────────────────────────────────────────────────
  browser: Object.freeze({
    trace: process.env.TRACE || 'on-first-retry',
    video: process.env.VIDEO || 'off',
    screenshot: process.env.SCREENSHOT || 'only-on-failure',
    headless: process.env.HEADLESS !== 'false', // default true; pass HEADLESS=false for headed
    slowMo: envInt('SLOW_MO', 0),
    locale: envOpt('LOCALE'),
    viewport: envOpt('VIEWPORT') ? JSON.parse(process.env.VIEWPORT) : undefined,
  }),

  // ─── Output Paths ────────────────────────────────────────────────────────
  // Must work on both Linux (Docker/Render) and Windows (local dev).
  paths: Object.freeze({
    testResults: process.env.OUTPUT_DIR || '/tmp/test-results',
    reportOutput: process.env.REPORT_DIR || '/tmp/playwright-report',
  }),

  // ─── Parallelism & Retries ───────────────────────────────────────────────
  retries: envInt('RETRIES', 0),
  workers: envOpt('WORKERS'), // undefined = Playwright default
});

module.exports = config;
