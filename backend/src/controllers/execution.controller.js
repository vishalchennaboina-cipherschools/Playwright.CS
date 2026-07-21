/** Handles execution endpoints. */

const executionStore = require('../services/executionStore');
const historyService = require('../services/historyService');
const playwrightRunner = require('../services/playwrightRunner');
const evidenceManager = require('../services/evidenceManager');
const artifactScanner = require('../services/artifactScanner');
const { createExecution } = require('../utils/executionHelper');
const { sendSuccess, sendOk, sendError } = require('../utils/responseHelper');
const logger = require('../utils/logger');

/** Retrieves test evidence for a given execution. */
async function getExecutionEvidence(req, res, next) {
  try {
    const { id } = req.params;
    const evidence = await evidenceManager.getEvidenceByExecution(id);
    return sendSuccess(res, evidence);
  } catch (err) {
    return next(err);
  }
}

/** Starts a new Playwright execution. */
async function startExecution(req, res, next) {
  try {
    const { suite, environment, browser, mode, workers, specFile, email, password, customUrl, profile } = req.body;

    const execution = createExecution({
      suite,
      environment,
      browser,
      mode,
      workers,
      specFile,
      email:     email     || '',
      profile:   profile   || '',
      customUrl: customUrl || '',
    });

    await executionStore.create(execution);

    /** Attaches runtime password transiently for the runner. */
    execution._runtimePassword = password || '';

    playwrightRunner.spawnExecution(execution);

    logger.info(`[Controller] Started execution ${execution.id}`);
    sendSuccess(res, await executionStore.get(execution.id), 201);
  } catch (err) {
    next(err);
  }
}

/** Lists all executions. */
async function listExecutions(_req, res, next) {
  try {
    const live = await executionStore.getAll();
    const history = await historyService.list();
    const seen = new Set();
    const merged = [];

    for (const exec of live) {
      seen.add(exec.id);
      merged.push(exec);
    }

    for (const exec of history) {
      if (!seen.has(exec.id)) {
        merged.push(exec);
      }
    }

    merged.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    sendSuccess(res, merged);
  } catch (err) {
    next(err);
  }
}

/** Retrieves a single execution's full detail. */
async function getExecution(req, res, next) {
  try {
    const { id } = req.params;

    const live = await executionStore.get(id);
    if (live) return sendSuccess(res, live);

    const hist = await historyService.getById(id);
    if (hist) return sendSuccess(res, hist);

    return sendError(res, `Execution ${id} not found`, 404);
  } catch (err) {
    return next(err);
  }
}

/** Stops a running execution. */
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

/** Deletes a single execution from store, history, and artifacts. */
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

/** Batch deletes executions. */
async function deleteExecutions(req, res, next) {
  try {
    const { all } = req.query;
    const { ids } = req.body;

    if (all === 'true') {
      await executionStore.clear();
      const count = await historyService.removeAll();
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
      await evidenceManager.removeByExecIds(ids);

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
  getExecutionEvidence,
  stopExecution,
  deleteExecution,
  deleteExecutions,
};
