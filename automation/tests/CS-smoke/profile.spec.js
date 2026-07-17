// @ts-check
// tests/CS-smoke/profile.spec.js

const { test, expect } = require('@playwright/test');
const { BasePage } = require('../../pages/BasePage');
const config = require('../../config/test.config');

test.describe('Profile tests', () => {
  test.beforeEach(async ({ page }) => {
    const basePage = new BasePage(page);
    await basePage.dismissCookieBanner();
  });

  test('Verify profile subsections', async ({ page }) => {
    await page.goto('/profile');
    
    // My Profile sub-page
    await page.locator('#ps-my-profile').click();
    await expect(page).toHaveURL(/\/profile(\/me)?/);
    await expect(page.getByRole('heading', { name: /About Me/i }).first()).toBeVisible({ timeout: 15000 });

    // Enrolled Courses
    await page.getByRole('link', { name: 'Enrolled Courses' }).click();
    await expect(page).toHaveURL('/profile/enrollments?publicPage=1&restrictedPage=1');
    await expect(page.getByRole('heading', { name: 'Premium courses' })).toBeVisible();

    // Certificates
    await page.getByRole('link', { name: 'Certificates' }).click();
    await expect(page).toHaveURL('/profile/certificates');
    await expect(page.getByRole('heading', { name: 'Certificates & Badges' })).toBeVisible();

    // Wishlist
    await page.getByRole('link', { name: 'Wishlist' }).click();
    await expect(page).toHaveURL('/profile/wishlist');
    await expect(page.getByRole('heading', { name: 'Wishlist videos' })).toBeVisible();

    // Liked Videos
    await page.getByRole('link', { name: 'Liked Videos' }).click();
    await expect(page).toHaveURL('/profile/liked-videos');
    await expect(page.getByRole('heading', { name: 'Liked videos' })).toBeVisible();
  });
});
