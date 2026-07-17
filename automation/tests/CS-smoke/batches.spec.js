// @ts-check
// tests/CS-smoke/batches.spec.js

const { test, expect } = require('@playwright/test');
const { BasePage } = require('../../pages/BasePage');
const config = require('../../config/test.config');

test.describe('Batches tests', () => {
  test.beforeEach(async ({ page }) => {
    const basePage = new BasePage(page);
    await basePage.dismissCookieBanner();
  });

  test('Verify batches page', async ({ page }) => {
    await page.goto('/');

    const basePage = new BasePage(page);
    // Use expect.toPass to retry the click in case SPA hydration swallows the first click
    await expect(async () => {
      await basePage.goToBatches();
      await expect(page).toHaveURL('/batches');
    }).toPass({ timeout: 15000 });
    
    await expect(page.getByRole('heading', { name: 'My Batches' })).toBeVisible();

    // Open the first available batch link dynamically
    const firstBatchLink = page.locator('a[href^="/batches/"]').first();
    const batchHref = await firstBatchLink.getAttribute('href') || '';
    const batchSlug = batchHref.split('/').pop() || '';
    
    if (!batchSlug) {
      throw new Error('No batches found for the user');
    }
    
    await firstBatchLink.click();
    await expect(page).toHaveURL(`/batches/${batchSlug}`);
    await expect(page.getByRole('heading', { name: new RegExp(`^Hey ${config.testData.displayName.split(' ')[0]}`, 'i') })).toBeVisible();

    // Syllabus
    await basePage.goToSyllabus();
    await expect(page).toHaveURL(`/batches/${batchSlug}/syllabus`);
    await expect(page.getByRole('heading', { name: 'Syllabus' })).toBeVisible();

    // Lectures
    await page.getByRole('link', { name: 'Lectures' }).click();
    await expect(page).toHaveURL(new RegExp(`/batches/${batchSlug}/contents/.*`));
    await expect(page.getByRole('heading', { name: 'Lecture Stages' })).toBeVisible();

    // Calendar
    await page.getByRole('link', { name: 'Calendar' }).click();
    await expect(page).toHaveURL(`/batches/${batchSlug}/calendar`);
    await expect(page.getByRole('heading', { name: 'My Calendar' })).toBeVisible();

    // Practice
    await page.getByRole('link', { name: 'Practice', exact: true }).click();
    await expect(page).toHaveURL(`/batches/${batchSlug}/problems`);
    await expect(page.getByRole('heading', { name: 'Practice' })).toBeVisible();

    // Practice sub-sections
    await page.locator('#tab-problems').click();
    await expect(page).toHaveURL(`/batches/${batchSlug}/problems?type=additional`);

    await page.locator('#tab-assignments').click();
    await expect(page).toHaveURL(`/batches/${batchSlug}/problems?type=assignments`);

    // Tests
    await page.getByRole('link', { name: 'Tests' }).click();
    await expect(page).toHaveURL(`/batches/${batchSlug}/tests`);
    await expect(page.getByRole('heading', { name: 'Proctored Test' })).toBeVisible();

    // Projects
    await page.getByRole('link', { name: 'Projects' }).click();
    await expect(page).toHaveURL(`/batches/${batchSlug}/projects`);
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();

    // Resources
    await page.getByRole('link', { name: 'Resources' }).click();
    await expect(page).toHaveURL(`/batches/${batchSlug}/resources`);
    await expect(page.getByRole('heading', { name: 'Resources', exact: true })).toBeVisible();

    // Performance
    await page.getByRole('link', { name: 'Performance' }).click();
    await expect(page).toHaveURL(`/batches/${batchSlug}/performance`);
    await expect(page.getByRole('heading', { name: 'Student Performance' })).toBeVisible();

    // Updates
    await page.getByRole('link', { name: 'Updates' }).click();
    await expect(page).toHaveURL(`/batches/${batchSlug}/announcements`);
    await expect(page.getByRole('heading', { name: 'Updates' })).toBeVisible();

    // Help & Support
    await page.getByRole('link', { name: 'Help & Support' }).click();
    await expect(page).toHaveURL(`/batches/${batchSlug}/support`);
    await expect(page.getByRole('heading', { name: 'Quick Troubleshoot' })).toBeVisible();

    // Dismiss cookie banner before clicking My Batches link
    await basePage.dismissCookieBanner();

    // Back to My Batches
    await basePage.goToBatches();
    await expect(page).toHaveURL('/batches');
    await expect(page.getByRole('heading', { name: 'My Batches' })).toBeVisible();
  });
});
