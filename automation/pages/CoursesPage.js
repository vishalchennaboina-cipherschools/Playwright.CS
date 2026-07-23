'use strict';

/**
 * @fileoverview CoursesPage — Enterprise Courses Page Object for CipherSchools QA Platform.
 *
 * SOLE RESPONSIBILITIES: UI Locators and User Actions.
 * NO Assertions, NO Business Logic, NO Session Logic.
 *
 * Usage:
 *   const { CoursesPage } = require('../pages/CoursesPage');
 *   const coursesPage = new CoursesPage(page);
 *   await coursesPage.openCoursesPage();
 */

const { BasePage } = require('./BasePage');

class CoursesPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // ─── Courses Listing Page ──────────────────────────────────────────────
    this.coursesLink        = page.getByRole('link', { name: 'Courses' });
    this.recommendedHeading = page.getByRole('heading', { name: 'Recommended Courses' });
    this.latestCoursesHead  = page.getByRole('heading', { name: 'Latest Courses' });
    this.followCoursesHead  = page.getByRole('heading', { name: 'Courses from people you follow' });
    this.latestVideosHead   = page.getByRole('heading', { name: 'Latest Videos' });
    this.allCoursesHead     = page.getByRole('heading', { name: 'All Courses' });
    this.courseCards         = page.locator('[id*="_course_"][id*="_Card"]');

    // ─── Category Filter ───────────────────────────────────────────────────
    this.categoryRightArrow = page.locator('#Ctg_Right_Arrow');

    // ─── Search ────────────────────────────────────────────────────────────
    this.searchInput = page.getByPlaceholder(/search/i);
    this.searchClear = page.locator('[aria-label="Clear search"], .search-clear-btn, input[type="search"] ~ button, input[type="search"] ~ svg').first();

    // ─── Course Detail Page ────────────────────────────────────────────────
    this.courseTitle      = page.locator('h1, h2').first();
    this.instructorName   = page.locator('article').filter({ has: page.getByRole('button', { name: /Follow/i }) }).locator('h2').first();
    this.instructorLogo   = page.locator('article').filter({ has: page.getByRole('button', { name: /Follow/i }) }).locator('img').first();

    // ─── Video Player ──────────────────────────────────────────────────────
    this.videoPlayer  = page.locator('video, iframe[src*="youtube"], iframe[src*="player"], [class*="player"]').first();
    this.videoListTab = page.locator('#video-list');
    this.commentsTab  = page.locator('#comments');
    this.notesTab     = page.locator('#notes');

    // ─── Lecture Navigation ────────────────────────────────────────────────
    this.lectureList      = page.locator('#video-list li, [class*="lecture-list"] li, [class*="videoList"] li');
    this.activeLecture    = page.locator('[class*="active"][class*="lecture"], [class*="active"][class*="video"], li[class*="active"]').first();
    this.nextLectureBtn   = page.locator('[aria-label="Next"], button:has-text("Next"), [class*="next"]').first();
    this.prevLectureBtn   = page.locator('[aria-label="Previous"], button:has-text("Previous"), [class*="prev"]').first();

    // ─── Action Buttons ────────────────────────────────────────────────────
    this.likeBtn       = page.locator('#vd_Like_Btn');
    this.saveBtn       = page.locator('#vd_Save_Btn');
    this.shareText     = page.getByRole('paragraph').filter({ hasText: 'Share' });
    this.shareLinkBtn  = page.locator('[id="vd_Share_Get Link"]');
    this.badgeBtn      = page.getByRole('button', { name: 'Badge' });

    // ─── Follow / Unfollow ─────────────────────────────────────────────────
    this.followBtn     = page.getByRole('button', { name: 'Follow', exact: true });
    this.followingBtn  = page.getByRole('button', { name: 'Following', exact: true });
    this.unfollowText  = page.getByText(/Unfollow now/i);

    // ─── Enroll / Unenroll ─────────────────────────────────────────────────
    this.enrollNowBtn       = page.getByRole('button', { name: /Enroll Now/i });
    this.enrolledBtn        = page.getByRole('button', { name: /Enrolled/i });
    this.unenrollText       = page.getByText(/Unenroll now/i);
    this.continueEnrollBtn  = page.getByRole('button', { name: /Continue to Enroll/i });

    // ─── Enrollment Wizard ─────────────────────────────────────────────────
    this.wizardPrimaryBtn = page.getByTestId('button-primary');

    // ─── Progress ──────────────────────────────────────────────────────────
    this.progressBar   = page.locator('[class*="progress"], [role="progressbar"]').first();
    this.progressText  = page.locator('[class*="progress"] span, [class*="progress-text"]').first();

    // ─── Modal ─────────────────────────────────────────────────────────────
    this.modalCloseBtn = page.locator('#modal-root').getByRole('button').filter({ hasText: /^$/ });
    this.badgeHeading  = page.getByRole('heading', { name: 'Steps to Generate Badge' });

    // ─── Navigation ────────────────────────────────────────────────────────
    this.cipherSchoolsLogo = page.getByRole('link', { name: 'cipherschools-logo' });
  }

  // ─── Navigation Actions ──────────────────────────────────────────────────

  /**
   * Navigate to the Courses listing page.
   */
  async openCoursesPage() {
    await this.coursesLink.click();
  }

  /**
   * Navigate directly to a URL.
   * @param {string} url - Relative or absolute URL.
   */
  async navigateTo(url) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Click the CipherSchools logo to return to the home page.
   */
  async clickLogo() {
    await this.cipherSchoolsLogo.click();
  }

  /**
   * Go back using browser navigation.
   */
  async goBack() {
    await this.page.goBack();
  }

  // ─── Category Actions ────────────────────────────────────────────────────

  /**
   * Click a category filter link by its visible name.
   * @param {string} categoryName - e.g. 'App Development', 'Web Development'
   */
  async clickCategory(categoryName) {
    await this.page.getByRole('link', { name: new RegExp(categoryName, 'i') }).click();
  }

  /**
   * Scroll the category carousel to the right.
   * @param {number} [clicks=1] - Number of arrow clicks.
   */
  async scrollCategoryRight(clicks = 1) {
    for (let i = 0; i < clicks; i++) {
      await this.categoryRightArrow.click();
    }
  }

  // ─── Search Actions ──────────────────────────────────────────────────────

  /**
   * Type a search keyword into the search input.
   * @param {string} keyword
   */
  async searchCourse(keyword) {
    await this.searchInput.click();
    await this.searchInput.fill('');
    await this.searchInput.pressSequentially(keyword, { delay: 50 });
    await this.searchInput.press('Enter');
  }

  /**
   * Clear the search input.
   */
  async clearSearch() {
    if (await this.searchClear.isVisible()) {
      await this.searchClear.click();
    } else {
      await this.searchInput.click();
      await this.page.keyboard.press('Control+a');
      await this.page.keyboard.press('Backspace');
      await this.page.keyboard.press('Enter');
    }
  }

  // ─── Course Card Actions ─────────────────────────────────────────────────

  /**
   * Click a course card by its visible text / heading.
   * @param {string} courseName
   */
  async openCourseByName(courseName) {
    await this.page.getByRole('link', { name: new RegExp(courseName, 'i') }).first().click();
  }

  /**
   * Get the count of visible course cards.
   * @returns {Promise<number>}
   */
  async getCourseCardCount() {
    return await this.courseCards.count();
  }

  // ─── Course Detail Interactions ──────────────────────────────────────────

  /**
   * Click the Like button.
   */
  async clickLike() {
    await this.likeBtn.click({ force: true });
  }

  /**
   * Click the Save button.
   */
  async clickSave() {
    await this.saveBtn.getByText('Save').click({ force: true });
  }

  /**
   * Click the Share paragraph to open the share panel.
   */
  async clickShare() {
    await this.shareText.click({ force: true });
  }

  /**
   * Click the "Get Link" share option.
   */
  async clickGetLink() {
    await this.shareLinkBtn.waitFor({ state: 'visible', timeout: 10000 });
    // Use evaluate to avoid Playwright scrolling into view, which might close the modal
    await this.shareLinkBtn.evaluate(node => node.click());
  }

  /**
   * Click the Badge button.
   */
  async clickBadge() {
    await this.badgeBtn.click();
  }

  /**
   * Close the currently open modal.
   */
  async closeModal() {
    await this.modalCloseBtn.click();
  }

  // ─── Follow / Unfollow ───────────────────────────────────────────────────

  /**
   * Click the Follow button.
   */
  async clickFollow() {
    await this.followBtn.click({ force: true });
  }

  /**
   * Click the Following button (to trigger unfollow dropdown).
   */
  async clickFollowing() {
    await this.followingBtn.click({ force: true });
  }

  /**
   * Click the "Unfollow now" confirmation text.
   */
  async clickUnfollowNow() {
    await this.unfollowText.click({ force: true });
  }

  // ─── Enroll / Unenroll ───────────────────────────────────────────────────

  /**
   * Click the Enroll Now button.
   */
  async clickEnrollNow() {
    await this.enrollNowBtn.click({ force: true });
  }

  /**
   * Click the Enrolled button (to trigger unenroll dropdown).
   */
  async clickEnrolled() {
    await this.enrolledBtn.click({ force: true });
  }

  /**
   * Click the "Unenroll now" confirmation text.
   */
  async clickUnenrollNow() {
    await this.unenrollText.click({ force: true });
  }

  /**
   * Click the "Continue to Enroll" button.
   */
  async clickContinueToEnroll() {
    await this.continueEnrollBtn.click();
  }

  /**
   * Dismiss the enrollment wizard step by clicking the primary button.
   */
  async dismissWizardStep() {
    await this.wizardPrimaryBtn.click();
  }

  // ─── Lecture Navigation ──────────────────────────────────────────────────

  /**
   * Click the Video List tab.
   */
  async clickVideoListTab() {
    await this.videoListTab.click();
  }

  /**
   * Click the Comments tab.
   */
  async clickCommentsTab() {
    await this.commentsTab.click();
  }

  /**
   * Click the Notes tab.
   */
  async clickNotesTab() {
    await this.notesTab.click();
  }

  /**
   * Click next lecture.
   */
  async clickNextLecture() {
    const nextBtn = this.page.locator('[aria-label="Next"], button:has-text("Next")').first();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click({ force: true });
    } else {
      // Fallback: Click the first available class link in the syllabus. 
      // Ensure the href starts with /courses/ to avoid matching hidden social share links
      // that contain the URL.
      await this.page.locator('a[href^="/courses/"][href*="/class-"]').first().click({ force: true });
    }
  }

  /**
   * Click previous lecture.
   */
  async clickPrevLecture() {
    const prevBtn = this.page.locator('[aria-label="Previous"], button:has-text("Previous")').first();
    if (await prevBtn.isVisible().catch(() => false)) {
      await prevBtn.click({ force: true });
    } else {
      // Fallback: use browser back to simulate returning to the previous lecture
      await this.page.goBack();
    }
  }

  // ─── State Retrieval (for service-layer logic) ───────────────────────────

  /**
   * Check if the Like button is in an "active" / "liked" state.
   * @returns {Promise<boolean>}
   */
  async isLiked() {
    const classes = await this.likeBtn.getAttribute('class') || '';
    const ariaPressed = await this.likeBtn.getAttribute('aria-pressed') || '';
    const svg = this.likeBtn.locator('svg, path').first();
    const fill = await svg.getAttribute('fill').catch(() => '') || '';
    return classes.includes('active') ||
           classes.includes('liked') ||
           ariaPressed === 'true' ||
           (fill !== 'none' && fill !== '' && fill !== 'currentColor');
  }

  /**
   * Check if the current user is following the instructor.
   * @returns {Promise<boolean>}
   */
  async isFollowing() {
    const btn = this.followBtn.or(this.followingBtn).first();
    await btn.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    return await this.followingBtn.isVisible().catch(() => false);
  }

  /**
   * Check if the course is saved / bookmarked.
   * @returns {Promise<boolean>}
   */
  async isSaved() {
    const classes = await this.saveBtn.getAttribute('class') || '';
    const ariaPressed = await this.saveBtn.getAttribute('aria-pressed') || '';
    const svg = this.saveBtn.locator('svg, path').first();
    const fill = await svg.getAttribute('fill').catch(() => '') || '';
    return classes.includes('active') ||
           classes.includes('saved') ||
           ariaPressed === 'true' ||
           (fill !== 'none' && fill !== '' && fill !== 'currentColor');
  }

  /**
   * Check if the user is already enrolled.
   * @returns {Promise<boolean>}
   */
  async isEnrolled() {
    await Promise.race([
      this.enrolledBtn.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
      this.enrollNowBtn.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {})
    ]);
    return await this.enrolledBtn.isVisible().catch(() => false);
  }

  /**
   * Get the current page URL.
   * @returns {Promise<string>}
   */
  async getCurrentUrl() {
    return this.page.url();
  }

  /**
   * Get the text content of the course title.
   * @returns {Promise<string>}
   */
  async getCourseTitle() {
    return (await this.courseTitle.textContent() || '').trim();
  }

  /**
   * Get the text content of the active/current lecture item.
   * @returns {Promise<string>}
   */
  async getActiveLectureText() {
    return (await this.activeLecture.textContent() || '').trim();
  }

  /**
   * Get the progress bar percentage text.
   * @returns {Promise<string>}
   */
  async getProgressText() {
    return (await this.progressText.textContent() || '').trim();
  }

  /**
   * Reload the current page.
   */
  async reloadPage() {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
  }
}

module.exports = { CoursesPage };
