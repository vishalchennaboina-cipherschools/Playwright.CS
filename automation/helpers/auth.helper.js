/**
 * @fileoverview Auth helper — reusable login fixture for test hooks.
 *
 * Provides a `loginAs` helper that performs the full login + cookie-banner
 * dismissal sequence using credentials from the central config. Import it
 * in test files that need an authenticated page.
 *
 * Usage (in a test file):
 *   const { loginAs } = require('../../helpers/auth.helper');
 *   const config      = require('../../config/test.config');
 *
 *   test.beforeEach(async ({ page }) => {
 *     await page.goto('/');
 *     await loginAs(page, config.credentials);
 *   });
 *
 * The config.credentials object is populated from env vars injected by the
 * backend service. No credentials are ever written here.
 */

'use strict';

const { LoginPage } = require('../pages/LoginPage');

/**
 * Login to the application and dismiss the cookie banner.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<void>}
 */
async function loginAs(page, credentials) {
  const loginPage = new LoginPage(page);
  await loginPage.login(credentials);
  // Wait for the SPA to finish any delayed auto-redirects (e.g. to the last visited page)
  // before we hand control back to the test. This prevents race conditions where the test
  // clicks a sidebar link, but the SPA router subsequently overwrites the URL.
  await page.waitForTimeout(2000);

  // Dismiss cookie banner that may appear after login redirect.
  await loginPage.dismissCookieBanner();
}

module.exports = { loginAs };
