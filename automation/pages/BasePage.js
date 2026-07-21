/**
 * @fileoverview BasePage — shared helpers for all page objects.
 *
 * Contains logic that is common across multiple pages:
 *   - Cookie/consent banner dismissal
 *   - Sidebar navigation helpers
 *
 * All page objects extend BasePage so they inherit these utilities.
 */

'use strict';

class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    /** @type {import('@playwright/test').Page} */
    this.page = page;
  }

  /**
   * Dismiss the cookie / consent banner if it is visible.
   *
   * The banner appears on the first visit to any page. Accepting or dismissing
   * it is a pre-condition for many navigation actions (it occludes elements).
   * This method is safe to call even when the banner is not present.
   *
   * @returns {Promise<void>}
   */
  async dismissCookieBanner() {
    const banner = this.page
      .locator('section')
      .filter({ hasText: /Accept All|Reject All|Customise/i })
      .first();

    const isVisible = await banner.isVisible().catch(() => false);
    if (isVisible) {
      await this.page
        .getByRole('button', { name: 'Accept All' })
        .click()
        .catch(() => {
          // Banner may have auto-dismissed between the isVisible check and the click.
        });
    }

  }

  /**
   * Navigate to the Courses section via the sidebar.
   * @returns {Promise<void>}
   */
  async goToCourses() {
    await this.page.locator('a[href="/courses"]').first().click();
  }

  /**
   * Navigate to the Batches section via the sidebar.
   * @returns {Promise<void>}
   */
  async goToBatches() {
    await this.page.locator('a[href="/batches"]').first().click();
  }

  /**
   * Navigate to the Practice section via the sidebar.
   * @returns {Promise<void>}
   */
  async goToPractice() {
    await this.page.locator('a[href="/practice"]').first().click();
  }

  /**
   * Navigate to the Rewards section via the sidebar.
   * @returns {Promise<void>}
   */
  async goToRewards() {
    // Might link to /rewards or /rewards/cipherpoints depending on the UI
    await this.page.locator('a[href^="/rewards"]').first().click();
  }

  /**
   * Navigate to the Resume Builder via the sidebar.
   * @returns {Promise<void>}
   */
  async goToResume() {
    await this.page.locator('a[href="/resume-builder"]').first().click();
  }

  /**
   * Navigate to the Syllabus page within a batch context.
   * @returns {Promise<void>}
   */
  async goToSyllabus() {
    await this.page.getByRole('link', { name: 'Syllabus' }).first().click();
  }
}

module.exports = { BasePage };
