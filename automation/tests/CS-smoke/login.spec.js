// @ts-check
// tests/CS-smoke/login.spec.js
//
// Smoke test suite — login verification.
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

// ─── Suite 1: App title ──────────────────────────────────────────────────────
test('CipherSchools — verify app title', async ({ page }) => {
  // baseURL is set in playwright.config.js from BASE_URL env var.
  await page.goto('/');
  await expect(page).toHaveTitle(/Best Free Programming Courses Online | Learning Platform for All/);
});

// ─── Suite 2: Login ──────────────────────────────────────────────────────────
test('Login with valid credentials', async ({ page }) => {
  await page.goto('/');

  // Credentials come from config (env vars injected by backend) — never hardcoded.
  await loginAs(page, config.credentials);

  // Assert successful login
  await expect(page.getByText('Login Successful')).toBeVisible();
});