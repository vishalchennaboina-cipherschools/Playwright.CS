'use strict';

/**
 * @fileoverview CourseValidator — Enterprise Course Assertions.
 *
 * SOLE RESPONSIBILITY: Playwright expect() assertions for the courses module.
 * NO user actions. NO business logic. NO data access.
 *
 * Usage:
 *   const validator = new CourseValidator(coursesPage, page);
 *   await validator.verifyCoursesLoaded();
 */

const { expect } = require('@playwright/test');

class CourseValidator {
  /**
   * @param {import('../pages/CoursesPage').CoursesPage} coursesPage
   * @param {import('@playwright/test').Page} page
   */
  constructor(coursesPage, page) {
    this.coursesPage = coursesPage;
    this.page = page;
  }

  // ─── Page-Level Assertions ───────────────────────────────────────────────

  /**
   * Verify the Courses listing page has loaded successfully.
   */
  async verifyCoursesLoaded() {
    await expect(this.page).toHaveURL(/\/courses/);
    await expect(this.coursesPage.recommendedHeading).toBeVisible({ timeout: 15000 });
  }

  /**
   * Verify that all expected section headings are visible on the courses page.
   * @param {readonly string[]} sectionNames - Array of heading texts.
   */
  async verifyPageSections(sectionNames) {
    for (const name of sectionNames) {
      await expect(
        this.page.getByRole('heading', { name })
      ).toBeVisible({ timeout: 10000 });
    }
  }

  /**
   * Verify course cards are present on the page.
   */
  async verifyCourseCardsVisible() {
    await expect(this.coursesPage.courseCards.first()).toBeVisible({ timeout: 15000 });
    const count = await this.coursesPage.getCourseCardCount();
    expect(count).toBeGreaterThan(0);
  }

  // ─── Search Assertions ──────────────────────────────────────────────────

  /**
   * Verify search results contain at least one visible course card.
   */
  async verifySearchResults() {
    await expect(this.coursesPage.courseCards.first()).toBeVisible({ timeout: 15000 });
  }

  /**
   * Verify that search returned no results or an appropriate empty state.
   */
  async verifyNoSearchResults() {
    // Either zero cards or an explicit "no results" message
    const noResults = this.page.getByText(/no.*results|no.*courses|not found/i);
    const hasNoResultsMsg = await noResults.isVisible().catch(() => false);
    if (!hasNoResultsMsg) {
      // If there's no explicit message, verify card count is 0
      const count = await this.coursesPage.getCourseCardCount();
      expect(count).toBe(0);
    }
  }

  /**
   * Verify that the search was cleared and the default listing is back.
   */
  async verifySearchCleared() {
    await expect(this.coursesPage.recommendedHeading).toBeVisible({ timeout: 15000 });
  }

  // ─── Filter Assertions ──────────────────────────────────────────────────

  /**
   * Verify the category filter was applied successfully.
   * @param {Object} category
   * @param {string} category.slug
   * @param {string} category.heading
   */
  async verifyFilterResults(category) {
    await expect(this.page).toHaveURL(new RegExp(`/courses/${category.slug}`));
    await expect(
      this.page.getByRole('heading', { name: category.heading, exact: true })
    ).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify the filter was cleared and the main courses page is restored.
   */
  async verifyFilterCleared() {
    await expect(this.page).toHaveURL(/\/courses$/);
    await expect(this.coursesPage.recommendedHeading).toBeVisible({ timeout: 15000 });
  }

  // ─── Course Detail Assertions ────────────────────────────────────────────

  /**
   * Verify a course detail page has opened.
   * @param {string} [expectedUrlFragment] - Optional URL fragment to match.
   */
  async verifyCourseOpened(expectedUrlFragment) {
    if (expectedUrlFragment) {
      await expect(this.page).toHaveURL(new RegExp(expectedUrlFragment));
    }
    // Course title should be visible
    await expect(this.coursesPage.courseTitle).toBeVisible({ timeout: 15000 });
  }

  /**
   * Verify the course title is not empty.
   */
  async verifyCourseTitle() {
    const title = await this.coursesPage.getCourseTitle();
    expect(title.length).toBeGreaterThan(0);
  }

  /**
   * Verify the instructor information is visible.
   */
  async verifyInstructor() {
    const instructorEl = this.coursesPage.instructorName.or(this.coursesPage.instructorLogo);
    await expect(instructorEl.first()).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify the video player is visible.
   */
  async verifyVideoVisible() {
    await expect(this.coursesPage.videoPlayer).toBeVisible({ timeout: 20000 });
  }

  // ─── Like State Assertions ──────────────────────────────────────────────

  /**
   * Verify the Like button reflects the expected state.
   * @param {boolean} expectedLiked - true if the course should be liked.
   */
  async verifyLikeState(expectedLiked) {
    await expect.poll(
      async () => await this.coursesPage.isLiked(),
      { message: `Expected like state to be ${expectedLiked}`, timeout: 5000 }
    ).toBe(expectedLiked);
  }

  // ─── Follow State Assertions ────────────────────────────────────────────

  /**
   * Verify the Follow button reflects the expected state.
   * @param {boolean} expectedFollowing - true if the user should be following.
   */
  async verifyFollowState(expectedFollowing) {
    if (expectedFollowing) {
      await expect(this.coursesPage.followingBtn).toBeVisible({ timeout: 5000 });
    } else {
      await expect(this.coursesPage.followBtn).toBeVisible({ timeout: 5000 });
    }
  }

  // ─── Save State Assertions ──────────────────────────────────────────────

  /**
   * Verify the Save button reflects the expected state.
   * @param {boolean} expectedSaved - true if the course should be saved.
   */
  async verifySaveState(expectedSaved) {
    await expect.poll(
      async () => await this.coursesPage.isSaved(),
      { message: `Expected save state to be ${expectedSaved}`, timeout: 5000 }
    ).toBe(expectedSaved);
  }

  // ─── Progress Assertions ────────────────────────────────────────────────

  /**
   * Verify that progress information is displayed.
   */
  async verifyProgressUpdated() {
    const progressEl = this.coursesPage.progressBar.or(this.coursesPage.progressText);
    await expect(progressEl.first()).toBeVisible({ timeout: 10000 });
  }

  // ─── Lecture Assertions ──────────────────────────────────────────────────

  /**
   * Verify the video list / lecture panel is visible.
   */
  async verifyLectureListVisible() {
    await expect(this.coursesPage.videoListTab).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify the lecture changed by comparing URL or active lecture text.
   * @param {string} previousUrl - The URL before the navigation.
   */
  async verifyLectureChanged(previousUrl) {
    await expect.poll(
      async () => this.page.url(),
      { message: 'Expected URL to change after lecture navigation', timeout: 10000 }
    ).not.toBe(previousUrl);
  }

  // ─── Share Assertions ───────────────────────────────────────────────────

  /**
   * Verify the share link button is visible (share panel is open).
   */
  async verifySharePanelOpen() {
    await expect(this.coursesPage.shareLinkBtn).toBeVisible({ timeout: 5000 });
  }

  // ─── Badge Assertions ──────────────────────────────────────────────────

  /**
   * Verify the badge modal is visible.
   */
  async verifyBadgeModalVisible() {
    await expect(this.coursesPage.badgeHeading).toBeVisible({ timeout: 5000 });
  }

  // ─── Enrollment Assertions ──────────────────────────────────────────────

  /**
   * Verify the user is enrolled in the course.
   */
  async verifyEnrolled() {
    await expect(this.coursesPage.enrolledBtn).toBeVisible({ timeout: 15000 });
  }

  /**
   * Verify the user is not enrolled (Enroll Now button visible).
   */
  async verifyNotEnrolled() {
    await expect(this.coursesPage.enrollNowBtn).toBeVisible({ timeout: 10000 });
  }

  // ─── Navigation Assertions ──────────────────────────────────────────────

  /**
   * Verify navigation back to the courses page.
   */
  async verifyBackNavigation() {
    await expect(this.page).toHaveURL(/\/courses/);
  }

  /**
   * Verify the page was refreshed successfully (content is still visible).
   */
  async verifyPageAfterRefresh() {
    await expect(this.coursesPage.courseTitle.or(this.coursesPage.recommendedHeading).first()).toBeVisible({ timeout: 15000 });
  }

  // ─── Tabs Assertions ───────────────────────────────────────────────────

  // Verify the Comments tab heading is visible.

  async verifyCommentsTabVisible() {
    await expect(this.page.getByRole('heading', { name: 'Comments' })).toBeVisible({ timeout: 10000 });
  }

  // Verify the Notes tab heading is visible.

  async verifyNotesTabVisible() {
    await expect(this.page.getByRole('heading', { name: /Make your course notes/i })).toBeVisible({ timeout: 10000 });
  }
}

module.exports = { CourseValidator };
