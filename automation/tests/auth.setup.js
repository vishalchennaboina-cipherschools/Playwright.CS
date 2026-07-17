// @ts-check
// tests/auth.setup.js
//
// ─── Global Authentication Setup ───────────────────────────────────────────
// This setup project logs in once and saves the authentication state
// (cookies/localStorage) so that all subsequent tests start authenticated.
// ──────────────────────────────────────────────────────────────────────────

const { test: setup } = require('@playwright/test');
const { loginAs } = require('../helpers/auth.helper');
const config = require('../config/test.config');

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Go to homepage
  await page.goto('/');

  // Perform the login UI flow
  await loginAs(page, config.credentials);

  // Save the authenticated state
  await page.context().storageState({ path: authFile });
});
