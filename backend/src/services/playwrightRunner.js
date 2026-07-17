/**
 * @fileoverview Playwright test runner service.
 *
 * Builds Playwright commands, spawns child processes, parses stdout/stderr,
 * tracks execution progress, and updates the execution store in real time.
 *
 * This service NEVER modifies the Playwright framework - it only executes it.
 *
 * @module services/playwrightRunner
 */

const { spawn } = require('node:child_process');
const path = require('node:path');
const config = require('../config');
const executionStore = require('./executionStore');
const historyService = require('./historyService');
const socketService = require('./socketService');
const { EXEC_STATUS, BROWSER_PROJECT_MAP } = require('../utils/constants');
const artifactScanner = require('./artifactScanner');
const { createLogLine, detectLogLevel, resolveSpecFiles } = require('../utils/executionHelper');
const { calcDuration } = require('../utils/durationFormatter');
const { buildProcessEnv } = require('./environmentService');
const logger = require('../utils/logger');

/**
 * Map of active child processes.
 * @type {Map<string, import('child_process').ChildProcess>}
 */
const activeProcesses = new Map();

/**
 * Build the Playwright CLI command and arguments.
 *
 * @param {Object} execution - The execution detail object.
 * @returns {Promise<{ command: string, args: string[], cwd: string }>}
 */
async function buildCommand(execution) {
  const cwd = config.playwrightProjectPath;
  const command = path.join(cwd, 'node_modules', '.bin', process.platform === 'win32' ? 'playwright.cmd' : 'playwright');
  const args = ['test'];

  // Spec files (now resolved dynamically)
  const files = await resolveSpecFiles(execution.suite, execution.specFile);
  if (files.length > 0 && !files.includes('tests/**/*.spec.js')) {
    args.push(...files);
  }

  // Browser project
  const project = BROWSER_PROJECT_MAP[execution.browser];
  if (project) {
    args.push(`--project=${project}`);
  }

  // Workers
  args.push(`--workers=${execution.workers}`);

  // Headed mode
  const allowHeaded = process.env.PLAYWRIGHT_HEADED === 'true';

  if (execution.mode === 'Headed') {
    if (allowHeaded) {
      args.push('--headed');
    } else {
      logger.warn(
        '[Runner] Running in headless mode because PLAYWRIGHT_HEADED is disabled.',
      );
    }
  }

  // Reporter - always include list for parseable stdout
  args.push('--reporter=list');

  return { command, args, cwd };
}

/**
 * Parse a Playwright stdout line and extract progress information.
 *
 * Playwright list reporter format examples:
 *   "  checkmark  1 [chromium] > tests/auth/login.spec.js:12 > user can log in (812ms)"
 *   "  fail mark  2 [chromium] > tests/auth/login.spec.js:12 > user can log in (812ms)"
 *   "  -  3 [chromium] > tests/auth/login.spec.js:12 > user can log in"
 *   "  4 passed"
 *   "  1 failed"
 *   "  2 skipped"
 *
 * @param {string} line     - Raw stdout line.
 * @param {Object} execution - Current execution state (mutated in-place).
 * @returns {{ shouldUpdate: boolean, logLine: Object }}
 */
function parseLine(line, execution) {
  const trimmed = line.trim();
  if (!trimmed) return { shouldUpdate: false, logLine: null };

  const logLine = createLogLine(trimmed, detectLogLevel(trimmed));

  // Detect spec file + test name: "[chromium] > path/to/spec.js:N > test name"
  const specMatch = trimmed.match(/\[[\w-]+\]\s+(?:\u203a|>)\s+(.+?):(\d+)\s+(?:\u203a|>)\s+(.+?)(?:\s+\(|$)/);
  if (specMatch) {
    execution.currentFile = specMatch[1];
    execution.currentTest = specMatch[3].replace(/\s*\([\d.]+[ms]+\)\s*$/, '');
    execution.currentStep = 'running';
  }

  // Detect pass: checkmark or square root symbol.
  if (/\u2713|\u221a/.test(trimmed)) {
    execution.passed += 1;
    logLine.level = 'pass';
  }

  // Detect fail: common cross/fail symbols.
  if (/\u2717|\u00d7|\u2718/.test(trimmed)) {
    execution.failed += 1;
    logLine.level = 'fail';
  }

  // Detect skip: starts with "-" followed by number, or "skipped"
  if (/^\s*-\s+\d+/.test(trimmed) || /skipped/i.test(trimmed)) {
    execution.skipped += 1;
  }

  // Detect summary line: "N passed", "N failed", "N skipped" at end
  const summaryMatch = trimmed.match(/(\d+)\s+passed/);
  if (summaryMatch) {
    execution.passed = parseInt(summaryMatch[1], 10);
  }
  const failMatch = trimmed.match(/(\d+)\s+failed/);
  if (failMatch) {
    execution.failed = parseInt(failMatch[1], 10);
  }
  const skipMatch = trimmed.match(/(\d+)\s+skipped/);
  if (skipMatch) {
    execution.skipped = parseInt(skipMatch[1], 10);
  }

  // Detect total planned: "Running N tests using N workers"
  const totalMatch = trimmed.match(/Running\s+(\d+)\s+tests?/i);
  if (totalMatch) {
    execution.totalPlanned = parseInt(totalMatch[1], 10);
  }

  // Calculate progress
  const completed = execution.passed + execution.failed + execution.skipped;
  if (execution.totalPlanned > 0) {
    execution.progress = Math.min(100, Math.round((completed / execution.totalPlanned) * 100));
  }

  return { shouldUpdate: true, logLine };
}

/**
 * Spawn a Playwright test execution.
 *
 * This function is non-blocking - it starts the child process and returns
 * immediately. Progress is tracked via stdout parsing and store updates.
 *
 * @param {Object} execution - Full ExecutionDetail object (already in store).
 */
async function spawnExecution(execution) {
  const { command, args, cwd } = await buildCommand(execution);
  const envVars = buildProcessEnv({
    environment: execution.environment,
    execId: execution.id,
  });

  logger.info(`[Runner] Spawning: ${command} ${args.join(' ')}`, { cwd, env: envVars });

  // Add initial log
  const initLog = createLogLine(
    `-> ${command} ${args.join(' ')}`,
    'info',
  );
  await executionStore.appendLog(execution.id, initLog);
  socketService.emitLog(execution.id, initLog);

  const envLog = createLogLine(
    `Loading configuration for ${execution.environment} environment (${envVars.BASE_URL})`,
    'info',
  );
  await executionStore.appendLog(execution.id, envLog);
  socketService.emitLog(execution.id, envLog);

  const workerLog = createLogLine(
    `Launching ${execution.workers} workers - ${execution.browser} - ${execution.mode.toLowerCase()}`,
    'info',
  );
  await executionStore.appendLog(execution.id, workerLog);
  socketService.emitLog(execution.id, workerLog);

  let child;

  try {
    child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...envVars },
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    logger.error(`[Runner] Failed to spawn process for ${execution.id}`, err);
    const errorLog = createLogLine(`Failed to start: ${err.message}`, 'fail');
    await executionStore.appendLog(execution.id, errorLog);
    await executionStore.update(execution.id, {
      status: EXEC_STATUS.FAILED,
      duration: calcDuration(execution.startedAt),
      currentStep: 'spawn failed',
    });
    const finalExec = await executionStore.get(execution.id);
    await historyService.record(finalExec);
    await executionStore.remove(execution.id);
    socketService.emitError(execution.id, err.message);
    return;
  }

  activeProcesses.set(execution.id, child);

  // stdout handler
  child.stdout.on('data', async (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;

      const current = await executionStore.get(execution.id);
      if (!current) continue;

      const { shouldUpdate, logLine } = parseLine(line, current);

      if (shouldUpdate && logLine) {
        await executionStore.appendLog(execution.id, logLine);
        await executionStore.update(execution.id, {
          passed: current.passed,
          failed: current.failed,
          skipped: current.skipped,
          progress: current.progress,
          totalPlanned: current.totalPlanned,
          currentFile: current.currentFile,
          currentTest: current.currentTest,
          currentStep: current.currentStep,
          duration: calcDuration(execution.startedAt),
        });

        socketService.emitLog(execution.id, logLine);
        socketService.emitProgress(execution.id, {
          progress: current.progress,
          passed: current.passed,
          failed: current.failed,
          skipped: current.skipped,
          currentFile: current.currentFile,
          currentTest: current.currentTest,
          currentStep: current.currentStep,
        });
      }
    }
  });

  // stderr handler
  child.stderr.on('data', async (data) => {
    const text = data.toString().trim();
    if (!text) return;

    const logLine = createLogLine(text, 'warn');
    await executionStore.appendLog(execution.id, logLine);
    socketService.emitLog(execution.id, logLine);
  });

  // Process exit
  child.on('close', async (code) => {
    activeProcesses.delete(execution.id);

    const current = await executionStore.get(execution.id);
    if (!current) return;

    // If already aborted (user stopped), don't override status.
    if (current.status === EXEC_STATUS.ABORTED) {
      await historyService.record(current);
      await executionStore.remove(execution.id);
      socketService.emitCompleted(current);
      return;
    }

    const finalStatus = code === 0 ? EXEC_STATUS.PASSED : EXEC_STATUS.FAILED;
    const duration = calcDuration(execution.startedAt);

    const summaryLine = createLogLine(
      `${finalStatus.toUpperCase()} ${current.passed} passed - ${current.failed} failed - ${current.skipped} skipped (${Math.floor(duration / 60)}m ${duration % 60}s)`,
      finalStatus === EXEC_STATUS.PASSED ? 'pass' : 'fail',
    );

    await executionStore.appendLog(execution.id, summaryLine);
    await executionStore.update(execution.id, {
      status: finalStatus,
      duration,
      progress: 100,
      currentStep: 'finished',
    });

    const finalExec = await executionStore.get(execution.id);
    await historyService.record(finalExec);
    await executionStore.remove(execution.id);
    socketService.emitCompleted(finalExec);

    logger.success(`[Runner] Execution ${execution.id} completed: ${finalStatus} in ${duration}s`);

    // Scan for artifacts after execution completes
    artifactScanner.scanAndRegister(
      execution.id,
      execution.suite,
      execution.environment,
      finalStatus,
    ).catch((err) => {
      logger.warn(`[Runner] Artifact scan failed for ${execution.id}: ${err.message}`);
    });
  });

  // Process error (e.g. ENOENT)
  child.on('error', async (err) => {
    activeProcesses.delete(execution.id);
    logger.error(`[Runner] Process error for ${execution.id}`, err);

    const errorLog = createLogLine(`Process error: ${err.message}`, 'fail');
    await executionStore.appendLog(execution.id, errorLog);
    await executionStore.update(execution.id, {
      status: EXEC_STATUS.FAILED,
      duration: calcDuration(execution.startedAt),
      currentStep: 'process error',
    });

    const finalExec = await executionStore.get(execution.id);
    await historyService.record(finalExec);
    await executionStore.remove(execution.id);
    socketService.emitError(execution.id, err.message);
  });

  // Emit started event
  socketService.emitStarted(execution);
}

/**
 * Stop a running execution by killing its child process.
 *
 * @param {string} execId - Execution ID.
 * @returns {boolean} True if the process was found and killed.
 */
async function stopExecution(execId) {
  const child = activeProcesses.get(execId);
  if (!child) return false;

  logger.info(`[Runner] Stopping execution ${execId}`);

  // Update store before killing so the close handler sees "aborted".
  await executionStore.update(execId, {
    status: EXEC_STATUS.ABORTED,
    duration: calcDuration((await executionStore.get(execId))?.startedAt),
    currentStep: 'aborted by user',
  });

  const abortLog = createLogLine('Execution aborted by user', 'warn');
  await executionStore.appendLog(execId, abortLog);

  if (process.platform === 'win32') {
    const { exec } = require('child_process');
    exec(`taskkill /pid ${child.pid} /T /F`, (err) => {
      if (err) logger.error(`[Runner] Failed to kill process tree: ${err.message}`);
    });
  } else {
    child.kill('SIGTERM');

    // Force kill after 5 seconds if still alive.
    setTimeout(() => {
      if (activeProcesses.has(execId)) {
        child.kill('SIGKILL');
        activeProcesses.delete(execId);
      }
    }, 5000);
  }

  return true;
}

/**
 * Check if an execution is currently active (process running).
 *
 * @param {string} execId
 * @returns {boolean}
 */
function isRunning(execId) {
  return activeProcesses.has(execId);
}

module.exports = { spawnExecution, stopExecution, isRunning };
