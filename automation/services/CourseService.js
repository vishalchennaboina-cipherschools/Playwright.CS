'use strict';

/**
 * @fileoverview CourseService — Course Business Logic & Workflows.
 *
 * The single authoritative service for course-related test workflows.
 * Orchestrates CoursesPage interactions with business-level intent.
 *
 * SOLE RESPONSIBILITIES:
 *   - Multi-step business workflows (search, filter, toggle-like, enroll)
 *   - State detection and restoration (ensure account state never changes)
 *
 * NOT responsible for:
 *   - UI Locators         → CoursesPage
 *   - Assertions          → CourseValidator
 *   - Test Data           → data/courseTestData
 *
 * Dependencies:
 *   CoursesPage    → pages/CoursesPage.js   (UI actions)
 *   logger         → utils/logger           (structured logging)
 */

const { CoursesPage } = require('../pages/CoursesPage');
const logger          = require('../utils/logger');

const CATEGORY = 'COURSES';

class CourseService {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page        = page;
    this.coursesPage = new CoursesPage(page);
  }

  // ─── Navigation ──────────────────────────────────────────────────────────

  /**
   * Navigate to the Courses listing page and wait for it to load.
   */
  async openCoursesPage() {
    const start = Date.now();
    logger.info('Opening Courses page', { category: CATEGORY });

    await this.page.goto('/');
    await this.coursesPage.dismissCookieBanner();
    await this.coursesPage.openCoursesPage();
    await this.coursesPage.recommendedHeading.waitFor({ state: 'visible', timeout: 15000 });

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    logger.info(`Courses page loaded in ${duration}s`, { category: CATEGORY });
  }

  /**
   * Open a verified CipherSchools course by its URL and wait for the page to settle.
   * @param {Object} course - Course object from courseTestData.verifiedCourses
   * @param {string} course.url
   * @param {string} course.name
   */
  async openVerifiedCourse(course) {
    logger.info(`Opening verified course: ${course.name}`, { category: CATEGORY });
    await this.coursesPage.navigateTo(course.url);

    // Wait for the video player area or course title to become visible
    await this.coursesPage.videoPlayer.or(this.coursesPage.courseTitle)
      .first()
      .waitFor({ state: 'visible', timeout: 20000 });

    logger.info(`Course opened: ${course.name}`, { category: CATEGORY });
  }

  // ─── Search ──────────────────────────────────────────────────────────────

  /**
   * Search for a course using a keyword.
   * @param {string} keyword
   */
  async searchCourse(keyword) {
    logger.info(`Searching for: "${keyword}"`, { category: CATEGORY });
    await this.coursesPage.searchCourse(keyword);

    // Allow search results to render
    await this.page.waitForLoadState('networkidle').catch(() => {});
    logger.info(`Search completed for: "${keyword}"`, { category: CATEGORY });
  }

  /**
   * Clear the search input and wait for the default listing to reappear.
   */
  async clearSearch() {
    logger.info('Clearing search', { category: CATEGORY });
    await this.coursesPage.clearSearch();
    
    // Explicitly click Courses to reset the SPA view
    await this.coursesPage.coursesLink.click();

    // Wait for default course listing to reappear
    await this.coursesPage.recommendedHeading.waitFor({ state: 'visible', timeout: 15000 });
    logger.info('Search cleared', { category: CATEGORY });
  }

  // ─── Filter ──────────────────────────────────────────────────────────────

  /**
   * Apply a category filter.
   * @param {Object} category - Category object from courseTestData.categories
   * @param {string} category.name
   * @param {string} category.slug
   */
  async filterCourse(category) {
    logger.info(`Applying filter: ${category.name}`, { category: CATEGORY });
    await this.coursesPage.clickCategory(category.name);
    await this.page.waitForURL(`**/courses/${category.slug}`, { timeout: 15000 });
    logger.info(`Filter applied: ${category.name}`, { category: CATEGORY });
  }

  /**
   * Clear the category filter by navigating back to the main courses page.
   */
  async clearFilter() {
    logger.info('Clearing category filter', { category: CATEGORY });
    await this.coursesPage.clickLogo();
    await this.coursesPage.openCoursesPage();
    await this.coursesPage.recommendedHeading.waitFor({ state: 'visible', timeout: 15000 });
    logger.info('Filter cleared', { category: CATEGORY });
  }

  // ─── Like / Unlike (State-Safe Toggle) ───────────────────────────────────

  /**
   * Toggle the Like state safely and return to the original state afterward.
   *
   * Flow:
   *   1. Detect current state (liked or not).
   *   2. Toggle once → verify the opposite state.
   *   3. Toggle again → verify original state is restored.
   *
   * @returns {Promise<{wasLiked: boolean}>} The original state before toggling.
   */
  async toggleLikeSafely() {
    const wasLiked = await this.coursesPage.isLiked();
    logger.info(`Like state before toggle: ${wasLiked ? 'LIKED' : 'NOT LIKED'}`, { category: CATEGORY });

    // First toggle → opposite state
    await this.coursesPage.clickLike();
    await this.page.waitForTimeout(1000); // Allow UI animation / API response

    logger.debug('Like toggled once', { category: CATEGORY });
    return { wasLiked };
  }

  /**
   * Restore the Like state to its original value.
   * @param {boolean} wasLiked - The original state to restore.
   */
  async restoreLikeState(wasLiked) {
    const current = await this.coursesPage.isLiked();
    if (current !== wasLiked) {
      await this.coursesPage.clickLike();
      await this.page.waitForTimeout(1000);
      logger.info('Like state restored', { category: CATEGORY });
    } else {
      logger.info('Like state already matches original — no restoration needed', { category: CATEGORY });
    }
  }

  // ─── Follow / Unfollow (State-Safe Toggle) ───────────────────────────────

  /**
   * Toggle the Follow state safely and return to the original state afterward.
   *
   * @returns {Promise<{wasFollowing: boolean}>}
   */
  async toggleFollowSafely() {
    const wasFollowing = await this.coursesPage.isFollowing();
    logger.info(`Follow state before toggle: ${wasFollowing ? 'FOLLOWING' : 'NOT FOLLOWING'}`, { category: CATEGORY });

    if (wasFollowing) {
      await this.coursesPage.clickFollowing();
      await this.coursesPage.clickUnfollowNow();
    } else {
      await this.coursesPage.clickFollow();
    }

    await this.page.waitForTimeout(1000);
    logger.debug('Follow toggled once', { category: CATEGORY });
    return { wasFollowing };
  }

  /**
   * Restore the Follow state to its original value.
   * @param {boolean} wasFollowing
   */
  async restoreFollowState(wasFollowing) {
    const current = await this.coursesPage.isFollowing();
    if (current !== wasFollowing) {
      if (current) {
        // Currently following, need to unfollow
        await this.coursesPage.clickFollowing();
        await this.coursesPage.clickUnfollowNow();
      } else {
        // Currently not following, need to follow
        await this.coursesPage.clickFollow();
      }
      await this.page.waitForTimeout(1000);
      logger.info('Follow state restored', { category: CATEGORY });
    } else {
      logger.info('Follow state already matches original — no restoration needed', { category: CATEGORY });
    }
  }

  // ─── Save / Unsave (State-Safe Toggle) ───────────────────────────────────

  /**
   * Toggle the Save/Bookmark state safely.
   *
   * @returns {Promise<{wasSaved: boolean}>}
   */
  async toggleSaveSafely() {
    const wasSaved = await this.coursesPage.isSaved();
    logger.info(`Save state before toggle: ${wasSaved ? 'SAVED' : 'NOT SAVED'}`, { category: CATEGORY });

    await this.coursesPage.clickSave();
    await this.page.waitForTimeout(1000);

    logger.debug('Save toggled once', { category: CATEGORY });
    return { wasSaved };
  }

  /**
   * Restore the Save state to its original value.
   * @param {boolean} wasSaved
   */
  async restoreSaveState(wasSaved) {
    const current = await this.coursesPage.isSaved();
    if (current !== wasSaved) {
      await this.coursesPage.clickSave();
      await this.page.waitForTimeout(1000);
      logger.info('Save state restored', { category: CATEGORY });
    } else {
      logger.info('Save state already matches original — no restoration needed', { category: CATEGORY });
    }
  }

  // ─── Enrollment ──────────────────────────────────────────────────────────

  /**
   * Start learning / enroll in a course.
   * Handles the enrollment wizard if it appears.
   */
  async startCourse() {
    logger.info('Starting course enrollment', { category: CATEGORY });

    const isEnrolled = await this.coursesPage.isEnrolled();
    if (isEnrolled) {
      logger.info('Already enrolled — skipping enrollment', { category: CATEGORY });
      return;
    }

    await this.coursesPage.clickEnrollNow();
    await this.coursesPage.clickContinueToEnroll();

    // Dismiss each enrollment wizard step
    for (let i = 0; i < 4; i++) {
      await this.coursesPage.wizardPrimaryBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      const isVisible = await this.coursesPage.wizardPrimaryBtn.isVisible().catch(() => false);
      if (isVisible) {
        await this.coursesPage.dismissWizardStep();
      }
    }

    logger.info('Course enrollment completed', { category: CATEGORY });
  }

  /**
   * Continue learning for an already-enrolled course.
   * Verifies enrollment state first.
   *
   * @returns {Promise<boolean>} true if the user was enrolled and could continue.
   */
  async continueCourse() {
    logger.info('Continuing course', { category: CATEGORY });
    const isEnrolled = await this.coursesPage.isEnrolled();
    if (!isEnrolled) {
      logger.warn('Not enrolled — cannot continue', { category: CATEGORY });
      return false;
    }
    // Clicking on the video list to continue watching
    await this.coursesPage.clickVideoListTab();
    logger.info('Continuing course — video list opened', { category: CATEGORY });
    return true;
  }

  // ─── Lecture Navigation ──────────────────────────────────────────────────

  /**
   * Navigate to the next lecture.
   */
  async goToNextLecture() {
    logger.info('Navigating to next lecture', { category: CATEGORY });
    await this.coursesPage.clickNextLecture();
    await this.page.waitForLoadState('domcontentloaded');
    logger.info('Navigated to next lecture', { category: CATEGORY });
  }

  /**
   * Navigate to the previous lecture.
   */
  async goToPrevLecture() {
    logger.info('Navigating to previous lecture', { category: CATEGORY });
    await this.coursesPage.clickPrevLecture();
    await this.page.waitForLoadState('domcontentloaded');
    logger.info('Navigated to previous lecture', { category: CATEGORY });
  }

  // ─── Share ───────────────────────────────────────────────────────────────

  /**
   * Share a course by copying the link.
   */
  async shareCourse() {
    logger.info('Sharing course', { category: CATEGORY });
    await this.coursesPage.clickShare();
    await this.coursesPage.clickGetLink();
    logger.info('Course link copied', { category: CATEGORY });
  }

  // ─── Badge ───────────────────────────────────────────────────────────────

  /**
   * Open and close the badge modal.
   */
  async viewBadge() {
    logger.info('Viewing badge', { category: CATEGORY });
    await this.coursesPage.clickBadge();
    await this.coursesPage.badgeHeading.waitFor({ state: 'visible', timeout: 5000 });
    await this.coursesPage.closeModal();
    logger.info('Badge modal closed', { category: CATEGORY });
  }

  // ─── Utility ─────────────────────────────────────────────────────────────

  /**
   * Restore all toggleable states to their original values.
   * @param {Object} originalStates
   * @param {boolean} [originalStates.wasLiked]
   * @param {boolean} [originalStates.wasFollowing]
   * @param {boolean} [originalStates.wasSaved]
   */
  async restoreOriginalState(originalStates) {
    logger.info('Restoring all original states', { category: CATEGORY });

    if (originalStates.wasLiked !== undefined) {
      await this.restoreLikeState(originalStates.wasLiked);
    }
    if (originalStates.wasFollowing !== undefined) {
      await this.restoreFollowState(originalStates.wasFollowing);
    }
    if (originalStates.wasSaved !== undefined) {
      await this.restoreSaveState(originalStates.wasSaved);
    }

    logger.info('All original states restored', { category: CATEGORY });
  }
}

module.exports = { CourseService };
