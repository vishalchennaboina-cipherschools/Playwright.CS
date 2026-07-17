// @ts-check
// tests/CS-smoke/practice.spec.js

const { test, expect } = require('@playwright/test');
const { BasePage } = require('../../pages/BasePage');

test.describe('Practice tests', () => {
  test.beforeEach(async ({ page }) => {
    const basePage = new BasePage(page);
    await basePage.dismissCookieBanner();
  });

  test('Verify practice tab / CipherLabs page', async ({ page }) => {
    await page.goto('/');

    const basePage = new BasePage(page);
    await basePage.goToPractice();
    await expect(page).toHaveURL('/practice');
    await expect(page.getByRole('heading', { name: 'Master the Art of' })).toBeVisible();

    await page.getByRole('link', { name: 'Start Practicing Now' }).click();
    await expect(page).toHaveURL('/practice/problems');
    await expect(page.getByRole('heading', { name: 'Problem Set' })).toBeVisible();

    // Open a problem
    await page.locator('a:has-text("Practice")').first().click();
    await expect(page).toHaveURL(/\/practice\/problems\/.+/);

    await expect(page.getByRole('button', { name: 'Run Code' })).toBeVisible();
  });
});
