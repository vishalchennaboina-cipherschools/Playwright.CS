// @ts-check
// tests/CS-smoke/login.spec.js

const { test, expect } = require('@playwright/test');
const { loginAs } = require('../../helpers/auth.helper');
const config = require('../../config/test.config');

test.describe('Login flow', () => {
  // Opt out of the global authenticated state to test the UI login directly.
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Login with valid credentials', async ({ page }) => {
    await page.goto('/');
    // We do NOT inject anti-modal script here because login modal uses #modal-root
    await loginAs(page, config.credentials);
    await expect(page.getByText('Login Successful')).toBeVisible();
  });
});