// @ts-check
// playwright.config.js
//
// ALL values come from the central config module (config/test.config.js).
// That module reads environment variables injected by the backend's
// environmentService.buildProcessEnv(). Nothing is hardcoded here.
//
// To run locally: copy automation/.env.example → automation/.env and fill in values.

'use strict';

// Pure CommonJS — no ESM bridge needed. package.json has "type": "commonjs"
// so this .js file is treated as CJS by Node, matching test.config.js.
const { defineConfig, devices } = require('@playwright/test');
const cfg = require('./config/test.config');
const evidenceConfig = require('./config/evidence.config');

module.exports = defineConfig({
  testDir: './tests',

  // ── Output ──────────────────────────────────────────────────────────────
  // Paths come from env vars (OUTPUT_DIR / REPORT_DIR).
  // Backend sets these to /tmp/* in CI; locally they default to ./test-results.
  outputDir: cfg.paths.testResults,

  // ── Parallelism ──────────────────────────────────────────────────────────
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: cfg.retries,
  // workers must be a number (not a raw string). parseInt gives Playwright
  // the numeric count it expects; undefined falls back to Playwright's default.
  workers: cfg.workers !== undefined ? parseInt(cfg.workers, 10) : undefined,

  // ── Reporter ─────────────────────────────────────────────────────────────
  reporter: [
    ['./reporters/EvidenceReporter.js'],
    [
      'html',
      {
        outputFolder: cfg.paths.reportOutput,
        open: 'never',
      },
    ],
    ['list'], // machine-readable output for the backend log parser
  ],

  // ── Global timeout ───────────────────────────────────────────────────────
  // Comes from TEST_TIMEOUT env var (default 80 s).
  // Tests must NOT call test.setTimeout() — override here if needed.
  timeout: cfg.timeouts.test,

  // ── Shared use options ───────────────────────────────────────────────────
  use: {
    // Base URL — all page.goto('/path') calls resolve against this.
    // Injected by backend as BASE_URL based on the selected environment.
    baseURL: cfg.baseUrl,

    // Timeouts
    actionTimeout:     cfg.timeouts.action,
    navigationTimeout: cfg.timeouts.navigation,

    // Artifacts (configurable via evidence.config.js overriding test.config.js).
    trace: evidenceConfig.captureTraces ? 'on' : /** @type {any} */ (cfg.browser.trace),
    video: evidenceConfig.captureVideos ? 'on' : /** @type {any} */ (cfg.browser.video),
    screenshot: evidenceConfig.captureScreenshots === 'ALL' ? 'on' : 
                evidenceConfig.captureScreenshots === 'FAILURES_ONLY' ? 'only-on-failure' : 'off',

    // Browser context options (only spread when set)
    ...(cfg.browser.locale   ? { locale:   cfg.browser.locale }   : {}),
    ...(cfg.browser.viewport ? { viewport: /** @type {any} */ (cfg.browser.viewport) } : {}),
    // slowMo goes directly in the use block (not inside launchOptions).
    ...(cfg.browser.slowMo   ? { slowMo:   cfg.browser.slowMo }   : {}),
  },

  // ── Projects (browsers) ──────────────────────────────────────────────────
  // The backend passes --project=<name> on the CLI when launching tests.
  // All browser projects are defined here so the CLI flag resolves correctly.
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.js/,
    },
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    // Firefox
    // Enable after backend execution engine supports Firefox and it's validated for production.
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    
    // Edge
    // Enable after full cross-browser test validation.
    // {
    //   name: 'msedge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    
    // WebKit
    // Enable after browser mapping implementation in the backend and production validation.
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});
