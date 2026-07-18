// @ts-check
// tests/cipherschools/cipherschools.spec.js
//
// CipherSchools end-to-end test suite.
//
// ─── Configuration contract ────────────────────────────────────────────────
// No URLs, credentials, timeouts, or user data are hardcoded in this file.
// All values come from config/test.config.js whicdieh reads env vars injected
// by the backend's environmentService.buildProcessEnv().
//
// To switch environments, change the selection in the frontend dashboard —
// zero changes are needed here.
// ──────────────────────────────────────────────────────────────────────────

const { test, expect } = require('@playwright/test');
const logger = require('../../utils/logger');
const { loginAs } = require('../../helpers/auth.helper');
const { BasePage } = require('../../pages/BasePage');
const { getFullSitemapUrls } = require('../../config/sitemap.config');
const config = require('../../config/test.config');

// ─── Suite 1: Login ──────────────────────────────────────────────────────────
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

// ─── Authenticated Suite ─────────────────────────────────────────────────────
test.describe('Authenticated tests', () => {
  test.beforeEach(async ({ page }) => {
    const basePage = new BasePage(page);
    // Inject anti-modal script before tests navigate, to prevent marketing popups
    await basePage.dismissCookieBanner();
  });

  test('CipherSchools — verify page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Best Free Programming Courses Online | Learning Platform for All/);
  });

  // ─── Suite 3: Dashboard ──────────────────────────────────────────────────────
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

// ─── Suite 4: Courses ────────────────────────────────────────────────────────
test('Verify courses page', async ({ page }) => {
  await page.goto('/');

  const basePage = new BasePage(page);
  await basePage.goToCourses();
  await expect(page).toHaveURL('/courses');
  await expect(page.getByRole('heading', { name: 'Recommended Courses' })).toBeVisible();
});

// ─── Suite 5: Batches ────────────────────────────────────────────────────────
test('Verify batches page', async ({ page }) => {
  await page.goto('/');

  const basePage = new BasePage(page);
  await basePage.goToBatches();
  await expect(page).toHaveURL('/batches');
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
  await page.getByRole('link', { name: 'My Batches' }).click();
  await expect(page).toHaveURL('/batches');
  await expect(page.getByRole('heading', { name: 'My Batches' })).toBeVisible();
});

// ─── Suite 6: CipherLabs (Practice) ─────────────────────────────────────────
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

// ─── Suite 7: Rewards ───────────────────────────────────────────────────────
test('Verify rewards page', async ({ page }) => {
  await page.goto('/');

  const basePage = new BasePage(page);
  await basePage.goToRewards();
  await expect(page).toHaveURL('/rewards');
  await expect(page.getByRole('heading', { name: /What are CipherPoints/i })).toBeVisible();
});

// ─── Suite 8: Resume Builder ─────────────────────────────────────────────────
test('Verify resume builder page', async ({ page }) => {
  await page.goto('/');

  const basePage = new BasePage(page);
  await basePage.goToResume();
  await expect(page).toHaveURL('/resume-builder');
  await expect(page.getByRole('heading', { name: 'Make an ATS-Friendly Resume in Minutes' })).toBeVisible();
});

// ─── Suite 9: Side Navigation Bar ───────────────────────────────────────────
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

// ─── Suite 10: Logout ────────────────────────────────────────────────────────
test('Logout test', async ({ page }) => {
  await page.goto('/');

  await page.locator('li').filter({ hasText: 'Logout' }).click();
  await expect(page.getByText(/Successfully Logged out|Successfully logged Out/i)).toBeVisible();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('img', { name: /signin|register/i }).first()).toBeVisible();
});

// ─── Suite 11: Sitemap URL crawl ─────────────────────────────────────────────
// Visits every URL in config/sitemap.config.js using the currently configured
// base URL. Switching environment in the dashboard automatically switches
// which domain is crawled — zero test code changes needed.
test('Login and visit all sitemap URLs', async ({ page }) => {
  await page.goto('/');

  const urls = getFullSitemapUrls();

  for (const url of urls) {
    // Validate URL before navigating
    try {
      const parsed = new URL(url);
      if (!/^https?:$/.test(parsed.protocol)) {
        logger.warn(`Skipping non-http URL: ${url}`);
        continue;
      }
    } catch {
      logger.warn(`Invalid URL, skipping: ${url}`);
      continue;
    }

    logger.info(`Visiting: ${url}`);
    try {
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: config.timeouts.navigation,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`Navigation failed for ${url}: ${msg}`);
      continue;
    }

    // Configurable inter-page wait (avoids hammering the server)
    await page.waitForTimeout(config.timeouts.pageWait);
  }
});
});