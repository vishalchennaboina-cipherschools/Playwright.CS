/**
 * @fileoverview Artifact controller.
 *
 * Thin controller for artifact listing endpoints.
 * Delegates entirely to the artifactScanner service.
 *
 * @module controllers/artifact.controller
 */

const artifactScanner = require('../services/artifactScanner');
const executionStore = require('../services/executionStore');
const { sendSuccess } = require('../utils/responseHelper');

/**
 * GET /api/reports
 */
async function listReports(_req, res) {
  sendSuccess(res, artifactScanner.listReports());
}

/**
 * GET /api/screenshots
 */
async function listScreenshots(_req, res) {
  sendSuccess(res, artifactScanner.listScreenshots());
}

/**
 * GET /api/videos
 */
async function listVideos(_req, res) {
  sendSuccess(res, artifactScanner.listVideos());
}

/**
 * GET /api/traces
 */
async function listTraces(_req, res) {
  sendSuccess(res, artifactScanner.listTraces());
}

/**
 * GET /api/logs
 * Return logs from the most recent execution (live or completed).
 */
async function listLogs(_req, res) {
  // Check live executions first (they have the most up-to-date logs)
  const allLive = executionStore.getAll();
  if (allLive.length > 0) {
    const latest = allLive[0]; // Already sorted newest-first
    if (latest.logs && latest.logs.length > 0) {
      return sendSuccess(res, latest.logs);
    }
  }
  // No live logs available
  sendSuccess(res, []);
}

module.exports = {
  listReports,
  listScreenshots,
  listVideos,
  listTraces,
  listLogs,
};
