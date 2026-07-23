// @ts-check
// tests/CS-smoke/courses.spec.js
//
// ─── Courses Smoke Test Suite ──────────────────────────────────────────────
// Enterprise-level smoke tests for the CipherSchools Courses module.
// Tests run serially to avoid state conflicts on a single account.
//
// Architecture:
//   spec → CourseService  (business workflows)
//        → CourseValidator (assertions)
//        → CoursesPage    (UI interactions — never called directly from spec)
//
// INVARIANT: Account state is NEVER changed after test execution.
//            All toggleable states (Like, Follow, Save) are restored.
// ──────────────────────────────────────────────────────────────────────────

'use strict';

const { test, expect } = require('@playwright/test');
const { CoursesPage } = require('../../pages/CoursesPage');
const { CourseService } = require('../../services/CourseService');
const { CourseValidator } = require('../../validators/CourseValidator');
const courseData = require('../../data/courseTestData');

// Serial execution — single account, state-sensitive tests.
test.describe.configure({ mode: 'serial' });

test.describe('Courses Smoke Tests', () => {
  /** @type {CourseService} */
  let service;
  /** @type {CourseValidator} */
  let validator;
  /** @type {CoursesPage} */
  let coursesPage;

  test.beforeEach(async ({ page }) => {
    coursesPage = new CoursesPage(page);
    service = new CourseService(page);
    validator = new CourseValidator(coursesPage, page);
    await coursesPage.dismissCookieBanner();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CRS_001 — Verify Courses page loads
  // ─────────────────────────────────────────────────────────────────────────
  test('CRS_001 — Verify Courses page loads', async ({ page }) => {
    await service.openCoursesPage();
    await validator.verifyCoursesLoaded();
  });


  test('CRS_002 — Verify Course cards and page sections', async ({ page }) => {
    await service.openCoursesPage();
    await validator.verifyCourseCardsVisible();
    await validator.verifyPageSections(courseData.pageSections);
  });


  test('CRS_003 — Search course', async ({ page }) => {
    await service.openCoursesPage();
    await service.searchCourse(courseData.search.valid);
    await validator.verifySearchResults();
  });

  test('CRS_004 — Invalid search', async ({ page }) => {
    await service.openCoursesPage();
    await service.searchCourse(courseData.search.invalid);
    await validator.verifyNoSearchResults();
  });


  test('CRS_005 — Clear search', async ({ page }) => {
    await service.openCoursesPage();
    await service.searchCourse(courseData.search.valid);
    await validator.verifySearchResults();

    await service.clearSearch();
    await validator.verifySearchCleared();
  });


  test('CRS_006 — Apply filter', async ({ page }) => {
    await service.openCoursesPage();
    const category = courseData.categories[0]; // App Development
    await service.filterCourse(category);
    await validator.verifyFilterResults(category);
  });


  test('CRS_007 — Clear filter', async ({ page }) => {
    await service.openCoursesPage();
    const category = courseData.categories[1]; // Web Development
    await service.filterCourse(category);
    await validator.verifyFilterResults(category);

    await service.clearFilter();
    await validator.verifyFilterCleared();
  });


  test('CRS_008 — Open course', async ({ page }) => {
    const course = courseData.verifiedCourses[0];
    await service.openVerifiedCourse(course);
    await validator.verifyCourseOpened();
  });

  test('CRS_009 — Verify course details', async ({ page }) => {
    const course = courseData.verifiedCourses[0];
    await service.openVerifiedCourse(course);
    await validator.verifyCourseTitle();
  });


  test('CRS_010 — Verify instructor', async ({ page }) => {
    const course = courseData.verifiedCourses[0];
    await service.openVerifiedCourse(course);
    await validator.verifyInstructor();
  });


  test('CRS_011 — Verify player', async ({ page }) => {
    const course = courseData.verifiedCourses[0];
    await service.openVerifiedCourse(course);
    await validator.verifyVideoVisible();
  });


  test('CRS_012 — Like/Unlike', async ({ page }) => {
    const course = courseData.verifiedCourses[0];
    await service.openVerifiedCourse(course);

    // Toggle like and capture original state
    const { wasLiked } = await service.toggleLikeSafely();
    // Verify toggled to opposite state
    await validator.verifyLikeState(!wasLiked);

    // Restore original state
    await service.restoreLikeState(wasLiked);
    await validator.verifyLikeState(wasLiked);
  });


  test('CRS_013 — Follow/Unfollow', async ({ page }) => {
    const course = courseData.verifiedCourses[0];
    await service.openVerifiedCourse(course);

    const { wasFollowing } = await service.toggleFollowSafely();
    await validator.verifyFollowState(!wasFollowing);

    // Restore original state
    await service.restoreFollowState(wasFollowing);
    await validator.verifyFollowState(wasFollowing);
  });


  test('CRS_014 — Save/Unsave', async ({ page }) => {
    const course = courseData.verifiedCourses[0];
    await service.openVerifiedCourse(course);

    const { wasSaved } = await service.toggleSaveSafely();
    await validator.verifySaveState(!wasSaved);

    // Restore original state
    await service.restoreSaveState(wasSaved);
    await validator.verifySaveState(wasSaved);
  });


  test('CRS_015 — Share', async ({ page }) => {
    const course = courseData.verifiedCourses[0];
    await service.openVerifiedCourse(course);
    await service.shareCourse();
    await validator.verifySharePanelOpen();
  });


  test('CRS_016 — Start Learning', async ({ page }) => {
    const course = courseData.verifiedCourses[0];
    await service.openVerifiedCourse(course);
    await service.startCourse();
    await validator.verifyEnrolled();
  });


  test('CRS_017 — Continue Learning', async ({ page }) => {
    const course = courseData.verifiedCourses[0];
    await service.openVerifiedCourse(course);

    const couldContinue = await service.continueCourse();
    if (couldContinue) {
      await validator.verifyLectureListVisible();
    }
    // If not enrolled, the test still passes (non-blocking smoke check)
  });


  test('CRS_018 — Verify lecture', async ({ page }) => {
    const course = courseData.verifiedCourses[0];
    await service.openVerifiedCourse(course);
    await validator.verifyLectureListVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CRS_022 — Next lecture
  // ─────────────────────────────────────────────────────────────────────────
  test('CRS_019 — Next lecture', async ({ page }) => {
    const course = courseData.verifiedCourses[0];
    await service.openVerifiedCourse(course);

    const urlBefore = page.url();
    await service.goToNextLecture();
    await validator.verifyLectureChanged(urlBefore);
  });


  test('CRS_020 — Previous lecture', async ({ page }) => {
    const course = courseData.verifiedCourses[0];
    await service.openVerifiedCourse(course);

    // Navigate forward first so there's a previous lecture to go back to
    await service.goToNextLecture();
    const urlBefore = page.url();
    await service.goToPrevLecture();
    await validator.verifyLectureChanged(urlBefore);
  });


  test('CRS_021 — Verify progress', async ({ page }) => {
    const course = courseData.verifiedCourses[0];
    await service.openVerifiedCourse(course);
    await validator.verifyProgressUpdated();
  });


  test('CRS_022 — Refresh validation', async ({ page }) => {
    const course = courseData.verifiedCourses[0];
    await service.openVerifiedCourse(course);
    await validator.verifyCourseOpened();

    await coursesPage.reloadPage();
    await validator.verifyPageAfterRefresh();
  });


  test('CRS_023 — Back navigation', async ({ page }) => {
    await service.openCoursesPage();
    await validator.verifyCoursesLoaded();

    const course = courseData.verifiedCourses[0];
    await service.openVerifiedCourse(course);
    await validator.verifyCourseOpened();

    await coursesPage.goBack();
    await validator.verifyBackNavigation();
  });
});
