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
const historyService = require('../services/historyService');
const { sendSuccess } = require('../utils/responseHelper');

/**
 * GET /api/reports
 */
async function listReports(_req, res, next) {
  try {
    sendSuccess(res, await artifactScanner.listReports());
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/screenshots
 */
async function listScreenshots(_req, res, next) {
  try {
    sendSuccess(res, await artifactScanner.listScreenshots());
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/videos
 */
async function listVideos(_req, res, next) {
  try {
    sendSuccess(res, await artifactScanner.listVideos());
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/traces
 */
async function listTraces(_req, res, next) {
  try {
    sendSuccess(res, await artifactScanner.listTraces());
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/logs
 * Return logs from the most recent execution (live or persisted).
 */
async function listLogs(_req, res, next) {
  try {
    // Check executions first (live cache plus persisted records).
    const executions = await executionStore.getAll();
    if (executions.length > 0) {
      const latest = executions[0]; // Already sorted newest-first
      if (latest.logs && latest.logs.length > 0) {
        return sendSuccess(res, latest.logs);
      }
    }
    
    // Fall back to history if no live execution is found
    const history = await historyService.list();
    if (history.length > 0) {
      const latestHist = history[0];
      if (latestHist.logs && latestHist.logs.length > 0) {
        return sendSuccess(res, latestHist.logs);
      }
    }

    // No logs available.
    return sendSuccess(res, []);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listReports,
  listScreenshots,
  listVideos,
  listTraces,
  listLogs,
};
