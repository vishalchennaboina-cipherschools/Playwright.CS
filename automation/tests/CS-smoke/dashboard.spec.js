// @ts-check
// tests/CS-smoke/dashboard.spec.js

const { test, expect } = require('@playwright/test');
const { BasePage } = require('../../pages/BasePage');
const config = require('../../config/test.config');

test.describe('Dashboard tests', () => {
  test.beforeEach(async ({ page }) => {
    const basePage = new BasePage(page);
    await basePage.dismissCookieBanner();
  });

  test('Verify dashboard page after login', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the SPA to hydrate so that clicks on the router links aren't swallowed.
    await page.waitForLoadState('networkidle');

    // Navigate to profile / dashboard
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL('/profile');

    // Profile heading should show the configured display name
    await expect(
      page.getByRole('heading', { name: config.testData.displayName })
    ).toBeVisible();
  });
});
