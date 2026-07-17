// @ts-check
// tests/cipherschools/new.spec.js
//
// Quick login smoke test.
//
// ─── Configuration contract ────────────────────────────────────────────────
// No URLs, credentials, or timeouts are hardcoded here.
// All values come from config/test.config.js (env vars injected by backend).
// ──────────────────────────────────────────────────────────────────────────

const { test, expect } = require('@playwright/test');
const { loginAs } = require('../../helpers/auth.helper');
const config = require('../../config/test.config');

// Opt out of global auth state so this smoke test tests the actual login UI
test.use({ storageState: { cookies: [], origins: [] } });

test('Login with valid credentials', async ({ page }) => {
  // baseURL is set in playwright.config.js from the BASE_URL env var.
  await page.goto('/');

  // Credentials come from config (env vars) — never hardcoded.
  await loginAs(page, config.credentials);

  // Assert successful login
  await expect(page.getByText('Login Successful')).toBeVisible();
});