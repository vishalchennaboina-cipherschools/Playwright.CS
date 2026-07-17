// @ts-check
// tests/CS-smoke/resume.spec.js

const { test, expect } = require('@playwright/test');
const { BasePage } = require('../../pages/BasePage');

test.describe('Resume Builder tests', () => {
  test.beforeEach(async ({ page }) => {
    const basePage = new BasePage(page);
    await basePage.dismissCookieBanner();
  });

  test('Verify resume builder page', async ({ page }) => {
    await page.goto('/');

    const basePage = new BasePage(page);
    await basePage.goToResume();
    await expect(page).toHaveURL('/resume-builder');
    await expect(page.getByRole('heading', { name: 'Make an ATS-Friendly Resume in Minutes' })).toBeVisible();
  });
});
