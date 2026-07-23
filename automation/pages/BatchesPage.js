'use strict';

/**
 * @fileoverview BatchesPage — Enterprise Batches Page Object for CipherSchools QA Platform.
 *
 * SOLE RESPONSIBILITIES: UI Locators and User Actions.
 * NO Assertions, NO Business Logic, NO Session Logic.
 */

const { BasePage } = require('./BasePage');

class BatchesPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // ─── Batches Listing Page ──────────────────────────────────────────────
    this.myBatchesHeading = page.getByRole('heading', { name: 'My Batches' });
    this.firstBatchLink   = page.locator('a[href^="/batches/"]').first();

    // ─── Batch Dashboard ───────────────────────────────────────────────────
    this.syllabusTab      = page.getByRole('link', { name: 'Syllabus', exact: true });
    this.lecturesTab      = page.getByRole('link', { name: 'Lectures', exact: true });
    this.calendarTab      = page.getByRole('link', { name: 'Calendar', exact: true });
    this.practiceTab      = page.getByRole('link', { name: 'Practice', exact: true });
    this.testsTab         = page.getByRole('link', { name: 'Tests', exact: true });
    this.projectsTab      = page.getByRole('link', { name: 'Projects', exact: true });
    this.resourcesTab     = page.getByRole('link', { name: 'Resources', exact: true });
    this.performanceTab   = page.getByRole('link', { name: 'Performance', exact: true });
    this.updatesTab       = page.getByRole('link', { name: 'Updates', exact: true });
    this.supportTab       = page.getByRole('link', { name: 'Help & Support', exact: true });

    // ─── Practice Sub-Tabs ─────────────────────────────────────────────────
    this.problemsTab      = page.locator('#tab-problems');
    this.assignmentsTab   = page.locator('#tab-assignments');

    // ─── Headings ──────────────────────────────────────────────────────────
    this.syllabusHeading     = page.getByRole('heading', { name: 'Syllabus', exact: true });
    this.lecturesHeading     = page.getByRole('heading', { name: 'Lecture Stages' });
    this.calendarHeading     = page.getByRole('heading', { name: 'My Calendar' });
    this.practiceHeading     = page.getByRole('heading', { name: 'Practice' });
    this.testsHeading        = page.getByRole('heading', { name: 'Proctored Test' });
    this.projectsHeading     = page.getByRole('heading', { name: 'Projects' });
    this.resourcesHeading    = page.getByRole('heading', { name: 'Resources', exact: true });
    this.performanceHeading  = page.getByRole('heading', { name: 'Student Performance' });
    this.updatesHeading      = page.getByRole('heading', { name: 'Updates' });
    this.supportHeading      = page.getByRole('heading', { name: 'Quick Troubleshoot' });
  }

  // ─── Navigations & Actions ─────────────────────────────────────────────

  async clickFirstBatch() {
    await this.firstBatchLink.click();
  }

  async clickSyllabusTab() {
    await this.syllabusTab.click();
  }

  async clickLecturesTab() {
    await this.lecturesTab.click();
  }

  async clickCalendarTab() {
    await this.calendarTab.click();
  }

  async clickPracticeTab() {
    await this.practiceTab.click();
  }

  async clickTestsTab() {
    await this.testsTab.click();
  }

  async clickProjectsTab() {
    await this.projectsTab.click();
  }

  async clickResourcesTab() {
    await this.resourcesTab.click();
  }

  async clickPerformanceTab() {
    await this.performanceTab.click();
  }

  async clickUpdatesTab() {
    await this.updatesTab.click();
  }

  async clickSupportTab() {
    await this.supportTab.click();
  }

  async clickProblemsSubTab() {
    await this.problemsTab.click();
  }

  async clickAssignmentsSubTab() {
    await this.assignmentsTab.click();
  }

  /**
   * Get the batch slug from the first batch link dynamically.
   * @returns {Promise<string>}
   */
  async getFirstBatchSlug() {
    const href = await this.firstBatchLink.getAttribute('href') || '';
    return href.split('/').pop() || '';
  }
}

module.exports = { BatchesPage };
