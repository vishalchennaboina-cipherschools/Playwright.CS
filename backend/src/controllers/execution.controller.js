/**
 * @fileoverview Execution controller.
 *
 * Thin controller layer — validates, delegates to services, returns responses.
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
async function startExecution(req, res) {
  const { suite, environment, browser, mode, workers, specFile } = req.body;

  const execution = createExecution({
    suite,
    environment,
    browser,
    mode,
    workers,
    specFile,
  });

  executionStore.create(execution);
  playwrightRunner.spawnExecution(execution);

  logger.info(`[Controller] Started execution ${execution.id}`);
  sendSuccess(res, executionStore.get(execution.id), 201);
}

/**
 * GET /api/executions
 * List all executions (live + history merged, newest first).
 */
async function listExecutions(_req, res) {
  // Merge live executions with history, deduplicating by ID.
  const live = executionStore.getAll();
  const history = historyService.list();
  const seen = new Set();
  const merged = [];

  // Live entries first (they have more detailed data).
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
}

/**
 * GET /api/executions/:id
 * Get a single execution's full detail (for live polling).
 */
async function getExecution(req, res) {
  const { id } = req.params;

  // Check live store first (has logs, progress, etc.).
  const live = executionStore.get(id);
  if (live) return sendSuccess(res, live);

  // Fall back to history.
  const hist = historyService.getById(id);
  if (hist) return sendSuccess(res, hist);

  sendError(res, `Execution ${id} not found`, 404);
}

/**
 * POST /api/executions/:id/stop
 * Stop a running execution.
 */
async function stopExecution(req, res) {
  const { id } = req.params;

  const exec = executionStore.get(id);
  if (!exec) {
    return sendError(res, `Execution ${id} not found`, 404);
  }

  if (exec.status !== 'running') {
    return sendOk(res, { status: exec.status });
  }

  playwrightRunner.stopExecution(id);
  const updated = executionStore.get(id);

  sendOk(res, { status: updated?.status || 'aborted' });
}

/**
 * DELETE /api/executions/:id
 * Delete an execution from store and history.
 */
async function deleteExecution(req, res) {
  const { id } = req.params;

  executionStore.remove(id);
  historyService.remove(id);
  artifactScanner.removeByExecId(id);

  sendOk(res);
}

module.exports = {
  startExecution,
  listExecutions,
  getExecution,
  stopExecution,
  deleteExecution,
};
