// @ts-check
// tests/CS-smoke/navigation.spec.js

const { test, expect } = require('@playwright/test');
const { BasePage } = require('../../pages/BasePage');

test.describe('Navigation tests', () => {
  test.beforeEach(async ({ page }) => {
    const basePage = new BasePage(page);
    await basePage.dismissCookieBanner();
  });

  test('Verify side navigation bar', async ({ page }) => {
    await page.goto('/');

    const basePage = new BasePage(page);

    await basePage.goToCourses();
    await expect(page).toHaveURL('/courses');
    await expect(page.getByRole('heading', { name: 'Recommended Courses' })).toBeVisible();

    await basePage.goToBatches();
    await expect(page).toHaveURL('/batches');
    await expect(page.getByRole('heading', { name: 'My Batches' })).toBeVisible();

    await basePage.goToPractice();
    await expect(page).toHaveURL('/practice');
    await expect(page.getByRole('heading', { name: 'Master the Art of' })).toBeVisible();

    await basePage.goToRewards();
    await expect(page).toHaveURL('/rewards');
    await expect(page.getByRole('heading', { name: /What are CipherPoints/i })).toBeVisible();

    await basePage.goToResume();
    await expect(page).toHaveURL('/resume-builder');
    await expect(page.getByRole('heading', { name: 'Make an ATS-Friendly Resume in Minutes' })).toBeVisible();
  });
});
