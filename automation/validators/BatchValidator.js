'use strict';

/**
 * @fileoverview BatchValidator — Encapsulates assertions for Batches.
 *
 * SOLE RESPONSIBILITIES: Assertions and validation logic using expect().
 * NO Locators or explicit waits.
 */

const { expect } = require('@playwright/test');

class BatchValidator {
  /**
   * @param {import('../pages/BatchesPage').BatchesPage} batchesPage
   * @param {import('@playwright/test').Page} page
   */
  constructor(batchesPage, page) {
    this.batchesPage = batchesPage;
    this.page = page;
  }

  /**
   * Verify the My Batches page is loaded successfully.
   */
  async verifyBatchesLoaded() {
    await expect(this.page).toHaveURL('/batches');
    await expect(this.batchesPage.myBatchesHeading).toBeVisible();
  }

  /**
   * Verify a specific batch dashboard is loaded.
   * @param {string} slug 
   * @param {string} firstName 
   */
  async verifyBatchDashboardLoaded(slug, firstName) {
    await expect(this.page).toHaveURL(`/batches/${slug}`);
    await expect(this.page.getByRole('heading', { name: new RegExp(`^Hey ${firstName}`, 'i') })).toBeVisible();
  }

  /**
   * Verify the Syllabus page opens.
   * @param {string} slug 
   */
  async verifySyllabusLoaded(slug) {
    await expect(this.page).toHaveURL(`/batches/${slug}/syllabus`);
    await expect(this.batchesPage.syllabusHeading).toBeVisible();
  }

  /**
   * Verify the Lectures page opens.
   * @param {string} slug 
   */
  async verifyLecturesLoaded(slug) {
    await expect(this.page).toHaveURL(new RegExp(`/batches/${slug}/contents/.*`));
    await expect(this.batchesPage.lecturesHeading).toBeVisible();
  }

  /**
   * Verify the Calendar page opens.
   * @param {string} slug 
   */
  async verifyCalendarLoaded(slug) {
    await expect(this.page).toHaveURL(`/batches/${slug}/calendar`);
    await expect(this.batchesPage.calendarHeading).toBeVisible();
  }

  /**
   * Verify the Practice page opens.
   * @param {string} slug 
   */
  async verifyPracticeLoaded(slug) {
    await expect(this.page).toHaveURL(`/batches/${slug}/problems`);
    await expect(this.batchesPage.practiceHeading).toBeVisible();
  }

  /**
   * Verify the Practice -> Additional Practice tab opens.
   * @param {string} slug 
   */
  async verifyPracticeAdditionalLoaded(slug) {
    await expect(this.page).toHaveURL(`/batches/${slug}/problems?type=additional`);
  }

  /**
   * Verify the Practice -> Assignments tab opens.
   * @param {string} slug 
   */
  async verifyPracticeAssignmentsLoaded(slug) {
    await expect(this.page).toHaveURL(`/batches/${slug}/problems?type=assignments`);
  }

  /**
   * Verify the Tests page opens.
   * @param {string} slug 
   */
  async verifyTestsLoaded(slug) {
    await expect(this.page).toHaveURL(`/batches/${slug}/tests`);
    await expect(this.batchesPage.testsHeading).toBeVisible();
  }

  /**
   * Verify the Projects page opens.
   * @param {string} slug 
   */
  async verifyProjectsLoaded(slug) {
    await expect(this.page).toHaveURL(`/batches/${slug}/projects`);
    await expect(this.batchesPage.projectsHeading).toBeVisible();
  }

  /**
   * Verify the Resources page opens.
   * @param {string} slug 
   */
  async verifyResourcesLoaded(slug) {
    await expect(this.page).toHaveURL(`/batches/${slug}/resources`);
    await expect(this.batchesPage.resourcesHeading).toBeVisible();
  }

  /**
   * Verify the Performance page opens.
   * @param {string} slug 
   */
  async verifyPerformanceLoaded(slug) {
    await expect(this.page).toHaveURL(`/batches/${slug}/performance`);
    await expect(this.batchesPage.performanceHeading).toBeVisible();
  }

  /**
   * Verify the Updates page opens.
   * @param {string} slug 
   */
  async verifyUpdatesLoaded(slug) {
    await expect(this.page).toHaveURL(`/batches/${slug}/announcements`);
    await expect(this.batchesPage.updatesHeading).toBeVisible();
  }

  /**
   * Verify the Help & Support page opens.
   * @param {string} slug 
   */
  async verifySupportLoaded(slug) {
    await expect(this.page).toHaveURL(`/batches/${slug}/support`);
    await expect(this.batchesPage.supportHeading).toBeVisible();
  }
}

module.exports = { BatchValidator };
