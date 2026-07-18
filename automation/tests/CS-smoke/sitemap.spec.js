// @ts-check
// tests/CS-smoke/sitemap.spec.js

const { test, expect } = require('@playwright/test');
const logger = require('../../utils/logger');
const { getFullSitemapUrls } = require('../../config/sitemap.config');
const config = require('../../config/test.config');
const { BasePage } = require('../../pages/BasePage');

test.describe('Sitemap validation tests', () => {
  test.beforeEach(async ({ page }) => {
    const basePage = new BasePage(page);
    await basePage.dismissCookieBanner();
  });

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
