'use strict';

/**
 * @fileoverview BatchService — Encapsulates business workflows for Batches.
 *
 * SOLE RESPONSIBILITIES: Business logic, workflow orchestration.
 * NO Assertions, NO raw locators.
 */

const { BatchesPage } = require('../pages/BatchesPage');
const config = require('../config/test.config');

class BatchService {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.batchesPage = new BatchesPage(page);
  }

  /**
   * Navigate directly to the Batches page via URL.
   */
  async openBatchesPage() {
    const { expect } = require('@playwright/test');
    await this.page.goto('/');
    
    // Use expect.toPass to retry the click in case SPA hydration swallows the first click
    await expect(async () => {
      await this.batchesPage.goToBatches();
      await expect(this.page).toHaveURL('/batches');
    }).toPass({ timeout: 15000 });
  }

  /**
   * Click the first batch and return its slug.
   * @returns {Promise<string>}
   */
  async openFirstBatch() {
    const slug = await this.batchesPage.getFirstBatchSlug();
    if (!slug) {
      throw new Error('No batches found for the user');
    }
    await this.batchesPage.clickFirstBatch();
    return slug;
  }

  /**
   * Navigate to the Syllabus tab.
   */
  async navigateToSyllabus() {
    await this.batchesPage.clickSyllabusTab();
  }

  /**
   * Navigate to the Lectures tab.
   */
  async navigateToLectures() {
    await this.batchesPage.clickLecturesTab();
  }

  /**
   * Navigate to the Calendar tab.
   */
  async navigateToCalendar() {
    await this.batchesPage.clickCalendarTab();
  }

  /**
   * Navigate to the Practice tab.
   */
  async navigateToPractice() {
    await this.batchesPage.clickPracticeTab();
  }

  /**
   * Navigate to the Tests tab.
   */
  async navigateToTests() {
    await this.batchesPage.clickTestsTab();
  }

  /**
   * Navigate to the Projects tab.
   */
  async navigateToProjects() {
    await this.batchesPage.clickProjectsTab();
  }

  /**
   * Navigate to the Resources tab.
   */
  async navigateToResources() {
    await this.batchesPage.clickResourcesTab();
  }

  /**
   * Navigate to the Performance tab.
   */
  async navigateToPerformance() {
    await this.batchesPage.clickPerformanceTab();
  }

  /**
   * Navigate to the Updates tab.
   */
  async navigateToUpdates() {
    await this.batchesPage.clickUpdatesTab();
  }

  /**
   * Navigate to the Support tab.
   */
  async navigateToSupport() {
    await this.batchesPage.clickSupportTab();
  }

  /**
   * Navigate to the Practice -> Problems sub-tab.
   */
  async navigateToPracticeProblems() {
    await this.batchesPage.clickProblemsSubTab();
  }

  /**
   * Navigate to the Practice -> Assignments sub-tab.
   */
  async navigateToPracticeAssignments() {
    await this.batchesPage.clickAssignmentsSubTab();
  }

  /**
   * Get the expected user's first name for the batch dashboard greeting.
   * @returns {string}
   */
  getFirstName() {
    return config.testData.displayName.split(' ')[0];
  }
}

module.exports = { BatchService };
