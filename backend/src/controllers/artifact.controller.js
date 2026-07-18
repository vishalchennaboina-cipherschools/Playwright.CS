/** Handles artifact listing endpoints. */

const artifactScanner = require('../services/artifactScanner');
const executionStore = require('../services/executionStore');
const historyService = require('../services/historyService');
const { sendSuccess } = require('../utils/responseHelper');

/** Retrieves HTML reports. */
async function listReports(_req, res, next) {
  try {
    sendSuccess(res, await artifactScanner.listReports());
  } catch (err) {
    next(err);
  }
}

/** Retrieves screenshots. */
async function listScreenshots(_req, res, next) {
  try {
    sendSuccess(res, await artifactScanner.listScreenshots());
  } catch (err) {
    next(err);
  }
}

/** Retrieves videos. */
async function listVideos(_req, res, next) {
  try {
    sendSuccess(res, await artifactScanner.listVideos());
  } catch (err) {
    next(err);
  }
}

/** Retrieves traces. */
async function listTraces(_req, res, next) {
  try {
    sendSuccess(res, await artifactScanner.listTraces());
  } catch (err) {
    next(err);
  }
}

/** Retrieves logs from the most recent execution. */
async function listLogs(_req, res, next) {
  try {
    const executions = await executionStore.getAll();
    if (executions.length > 0) {
      const latest = executions[0];
      if (latest.logs && latest.logs.length > 0) {
        return sendSuccess(res, latest.logs);
      }
    }
    
    const history = await historyService.list();
    if (history.length > 0) {
      const latestHist = history[0];
      if (latestHist.logs && latestHist.logs.length > 0) {
        return sendSuccess(res, latestHist.logs);
      }
    }

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
