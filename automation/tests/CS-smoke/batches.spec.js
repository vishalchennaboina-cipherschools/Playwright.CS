// @ts-check
// tests/CS-smoke/batches.spec.js
//
// ─── Batches Smoke Test Suite ──────────────────────────────────────────────
// Enterprise-level smoke tests for the CipherSchools Batches module.
// Tests run serially to avoid state conflicts on a single account.
//
// Architecture:
//   spec → BatchService  (business workflows)
//        → BatchValidator (assertions)
//        → BatchesPage    (UI interactions — never called directly from spec)
// ──────────────────────────────────────────────────────────────────────────

'use strict';

const { test } = require('@playwright/test');
const { BatchesPage } = require('../../pages/BatchesPage');
const { BatchService } = require('../../services/BatchService');
const { BatchValidator } = require('../../validators/BatchValidator');

// Serial execution — single account, state-sensitive tests.
test.describe.configure({ mode: 'serial' });

test.describe('Batches Smoke Tests', () => {
  /** @type {BatchService} */
  let service;
  /** @type {BatchValidator} */
  let validator;
  /** @type {BatchesPage} */
  let batchesPage;

  let sharedBatchSlug = '';
  let sharedFirstName = '';

  test.beforeEach(async ({ page }) => {
    batchesPage = new BatchesPage(page);
    service = new BatchService(page);
    validator = new BatchValidator(batchesPage, page);
    await batchesPage.dismissCookieBanner();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // BAT_SMK_001 — Verify My Batches page loads successfully
  // ─────────────────────────────────────────────────────────────────────────
  test('BAT_SMK_001 — Verify My Batches page loads successfully', async () => {
    await service.openBatchesPage();
    await validator.verifyBatchesLoaded();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // BAT_SMK_002 — Verify enrolled batches are displayed
  // ─────────────────────────────────────────────────────────────────────────
  test('BAT_SMK_002 — Verify enrolled batches are displayed', async () => {
    await service.openBatchesPage();
    // The first batch link serves as verification that enrolled batches are displayed
    sharedBatchSlug = await batchesPage.getFirstBatchSlug();
    if (!sharedBatchSlug) {
      throw new Error('No batches found for the user');
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // BAT_SMK_003 — Verify user can open a batch
  // ─────────────────────────────────────────────────────────────────────────
  test('BAT_SMK_003 — Verify user can open a batch', async () => {
    await service.openBatchesPage();
    sharedBatchSlug = await service.openFirstBatch();
    sharedFirstName = service.getFirstName();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // BAT_SMK_004 — Verify Batch Dashboard loads correctly
  // ─────────────────────────────────────────────────────────────────────────
  test('BAT_SMK_004 — Verify Batch Dashboard loads correctly', async () => {
    await service.openBatchesPage();
    await service.openFirstBatch();
    await validator.verifyBatchDashboardLoaded(sharedBatchSlug, sharedFirstName);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // BAT_SMK_005 — Verify Syllabus page opens
  // ─────────────────────────────────────────────────────────────────────────
  test('BAT_SMK_005 — Verify Syllabus page opens', async () => {
    await service.openBatchesPage();
    await service.openFirstBatch();
    await service.navigateToSyllabus();
    await validator.verifySyllabusLoaded(sharedBatchSlug);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // BAT_SMK_006 — Verify Lecture page opens
  // ─────────────────────────────────────────────────────────────────────────
  test('BAT_SMK_006 — Verify Lecture page opens', async () => {
    await service.openBatchesPage();
    await service.openFirstBatch();
    await service.navigateToLectures();
    await validator.verifyLecturesLoaded(sharedBatchSlug);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // BAT_SMK_007 — Verify Calendar page opens
  // ─────────────────────────────────────────────────────────────────────────
  test('BAT_SMK_007 — Verify Calendar page opens', async () => {
    await service.openBatchesPage();
    await service.openFirstBatch();
    await service.navigateToCalendar();
    await validator.verifyCalendarLoaded(sharedBatchSlug);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // BAT_SMK_008 — Verify Practice page opens
  // ─────────────────────────────────────────────────────────────────────────
  test('BAT_SMK_008 — Verify Practice page opens', async () => {
    await service.openBatchesPage();
    await service.openFirstBatch();
    await service.navigateToPractice();
    await validator.verifyPracticeLoaded(sharedBatchSlug);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // BAT_SMK_009 — Verify Additional Practice tab opens
  // ─────────────────────────────────────────────────────────────────────────
  test('BAT_SMK_009 — Verify Additional Practice tab opens', async () => {
    await service.openBatchesPage();
    await service.openFirstBatch();
    await service.navigateToPractice();
    await service.navigateToPracticeProblems();
    await validator.verifyPracticeAdditionalLoaded(sharedBatchSlug);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // BAT_SMK_010 — Verify Assignments tab opens
  // ─────────────────────────────────────────────────────────────────────────
  test('BAT_SMK_010 — Verify Assignments tab opens', async () => {
    await service.openBatchesPage();
    await service.openFirstBatch();
    await service.navigateToPractice();
    await service.navigateToPracticeAssignments();
    await validator.verifyPracticeAssignmentsLoaded(sharedBatchSlug);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // BAT_SMK_011 — Verify Tests page opens
  // ─────────────────────────────────────────────────────────────────────────
  test('BAT_SMK_011 — Verify Tests page opens', async () => {
    await service.openBatchesPage();
    await service.openFirstBatch();
    await service.navigateToTests();
    await validator.verifyTestsLoaded(sharedBatchSlug);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // BAT_SMK_012 — Verify Projects page opens
  // ─────────────────────────────────────────────────────────────────────────
  test('BAT_SMK_012 — Verify Projects page opens', async () => {
    await service.openBatchesPage();
    await service.openFirstBatch();
    await service.navigateToProjects();
    await validator.verifyProjectsLoaded(sharedBatchSlug);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // BAT_SMK_013 — Verify Resources page opens
  // ─────────────────────────────────────────────────────────────────────────
  test('BAT_SMK_013 — Verify Resources page opens', async () => {
    await service.openBatchesPage();
    await service.openFirstBatch();
    await service.navigateToResources();
    await validator.verifyResourcesLoaded(sharedBatchSlug);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // BAT_SMK_014 — Verify Performance page opens
  // ─────────────────────────────────────────────────────────────────────────
  test('BAT_SMK_014 — Verify Performance page opens', async () => {
    await service.openBatchesPage();
    await service.openFirstBatch();
    await service.navigateToPerformance();
    await validator.verifyPerformanceLoaded(sharedBatchSlug);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // BAT_SMK_015 — Verify Updates page opens
  // ─────────────────────────────────────────────────────────────────────────
  test('BAT_SMK_015 — Verify Updates page opens', async () => {
    await service.openBatchesPage();
    await service.openFirstBatch();
    await service.navigateToUpdates();
    await validator.verifyUpdatesLoaded(sharedBatchSlug);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // BAT_SMK_016 — Verify Help & Support page opens
  // ─────────────────────────────────────────────────────────────────────────
  test('BAT_SMK_016 — Verify Help & Support page opens', async () => {
    await service.openBatchesPage();
    await service.openFirstBatch();
    await service.navigateToSupport();
    await validator.verifySupportLoaded(sharedBatchSlug);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // BAT_SMK_017 — Verify user can navigate back to My Batches
  // ─────────────────────────────────────────────────────────────────────────
  test('BAT_SMK_017 — Verify user can navigate back to My Batches', async () => {
    await service.openBatchesPage();
    await service.openFirstBatch();
    await batchesPage.dismissCookieBanner();
    await batchesPage.goToBatches();
    await validator.verifyBatchesLoaded();
  });
});
