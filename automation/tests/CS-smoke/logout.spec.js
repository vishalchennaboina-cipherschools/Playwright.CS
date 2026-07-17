// @ts-check
// tests/CS-smoke/logout.spec.js

const { test, expect } = require('@playwright/test');
const { BasePage } = require('../../pages/BasePage');

test.describe('Logout flow tests', () => {
  test.beforeEach(async ({ page }) => {
    const basePage = new BasePage(page);
    await basePage.dismissCookieBanner();
  });

  test('Logout test', async ({ page }) => {
    await page.goto('/');

    await page.locator('li').filter({ hasText: 'Logout' }).click();
    await expect(page.getByText(/Successfully Logged out|Successfully logged Out/i)).toBeVisible();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('img', { name: /signin|register/i }).first()).toBeVisible();
  });
});
