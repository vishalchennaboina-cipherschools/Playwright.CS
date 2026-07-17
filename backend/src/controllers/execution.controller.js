/**
 * @fileoverview Execution controller.
 *
 * Thin controller layer - validates, delegates to services, returns responses.
 * No business logic lives here.
 *
 * @module controllers/execution.controller
 */

const executionStore = require('../services/executionStore');
const historyService = require('../services/historyService');
const playwrightRunner = require('../services/playwrightRunner');
const artifactScanner = require('../services/artifactScanner');
const { createExecution } = require('../utils/executionHelper');
const { sendSuccess, sendOk, sendError } = require('../utils/responseHelper');
const logger = require('../utils/logger');

/**
 * POST /api/executions
 * Start a new Playwright execution.
 */
async function startExecution(req, res, next) {
  try {
    const { suite, environment, browser, mode, workers, specFile } = req.body;

    const execution = createExecution({
      suite,
      environment,
      browser,
      mode,
      workers,
      specFile,
    });

    await executionStore.create(execution);
    playwrightRunner.spawnExecution(execution);

    logger.info(`[Controller] Started execution ${execution.id}`);
    sendSuccess(res, await executionStore.get(execution.id), 201);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/executions
 * List all executions (live + history merged, newest first).
 */
async function listExecutions(_req, res, next) {
  try {
    // Merge live executions with history, deduplicating by ID.
    const live = await executionStore.getAll();
    const history = await historyService.list();
    const seen = new Set();
    const merged = [];

    // Live/persisted execution entries first (they have more detailed data).
    for (const exec of live) {
      seen.add(exec.id);
      merged.push(exec);
    }

    // Then history entries not already in live.
    for (const exec of history) {
      if (!seen.has(exec.id)) {
        merged.push(exec);
      }
    }

    // Sort newest first.
    merged.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    sendSuccess(res, merged);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/executions/:id
 * Get a single execution's full detail (for live polling).
 */
async function getExecution(req, res, next) {
  try {
    const { id } = req.params;

    // Check execution store first (live cache, then MongoDB).
    const live = await executionStore.get(id);
    if (live) return sendSuccess(res, live);

    // Fall back to history.
    const hist = await historyService.getById(id);
    if (hist) return sendSuccess(res, hist);

    return sendError(res, `Execution ${id} not found`, 404);
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/executions/:id/stop
 * Stop a running execution.
 */
async function stopExecution(req, res, next) {
  try {
    const { id } = req.params;

    const exec = await executionStore.get(id);
    if (!exec) {
      return sendError(res, `Execution ${id} not found`, 404);
    }

    if (exec.status !== 'running') {
      return sendOk(res, { status: exec.status });
    }

    await playwrightRunner.stopExecution(id);
    const updated = await executionStore.get(id);

    return sendOk(res, { status: updated?.status || 'aborted' });
  } catch (err) {
    return next(err);
  }
}

/**
 * DELETE /api/executions/:id
 * Delete a single execution from store, history, and artifacts.
 */
async function deleteExecution(req, res, next) {
  try {
    const { id } = req.params;

    const removedExecution = await executionStore.remove(id);
    const removedHistory = await historyService.remove(id);
    await artifactScanner.removeByExecId(id);

    if (!removedExecution && !removedHistory) {
      return sendError(res, `Execution ${id} not found`, 404);
    }

    logger.info(`[Controller] Deleted execution ${id}`);
    return sendOk(res, {
      deletedCount: 1,
      id,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * DELETE /api/executions
 * Batch delete executions or delete all.
 * Expects ?all=true OR { ids: ['id1', 'id2'] }
 */
async function deleteExecutions(req, res, next) {
  try {
    const { all } = req.query;
    const { ids } = req.body;

    if (all === 'true') {
      // Clear live store entirely
      await executionStore.clear();
      // Clear history
      const count = await historyService.removeAll();
      // Clear artifacts
      await artifactScanner.removeAll();

      logger.info(`[Controller] Deleted all historical executions`);
      return sendOk(res, { deletedCount: count });
    }

    if (Array.isArray(ids) && ids.length > 0) {
      let totalDeleted = 0;
      for (const id of ids) {
        const remExec = await executionStore.remove(id);
        if (remExec) totalDeleted++;
      }
      const historyCount = await historyService.removeMany(ids);
      totalDeleted += historyCount;
      
      await artifactScanner.removeByExecIds(ids);

      logger.info(`[Controller] Deleted ${totalDeleted} selected executions`);
      return sendOk(res, { deletedCount: totalDeleted });
    }

    return sendError(res, `Must provide ?all=true or an array of ids in body`, 400);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  startExecution,
  listExecutions,
  getExecution,
  stopExecution,
  deleteExecution,
  deleteExecutions,
};
