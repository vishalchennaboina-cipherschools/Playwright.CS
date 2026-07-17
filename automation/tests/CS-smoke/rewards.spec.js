// @ts-check
// tests/CS-smoke/rewards.spec.js

const { test, expect } = require('@playwright/test');
const { BasePage } = require('../../pages/BasePage');

test.describe('Rewards tests', () => {
  test.beforeEach(async ({ page }) => {
    const basePage = new BasePage(page);
    await basePage.dismissCookieBanner();
  });

  test('Verify rewards page', async ({ page }) => {
    await page.goto('/');

    const basePage = new BasePage(page);
    await basePage.goToRewards();
    await expect(page).toHaveURL('/rewards');
    await expect(page.getByRole('heading', { name: /What are CipherPoints/i })).toBeVisible();
  });
});
