/**
 * @fileoverview Execution helper utilities.
 *
 * Generates execution IDs, creates initial execution objects,
 * and provides helpers for stdout parsing.
 *
 * @module utils/executionHelper
 */

const { nanoid } = require('nanoid');
const { EXEC_STATUS } = require('./constants');
const specDiscovery = require('../services/specDiscovery');

/**
 * Generate a unique execution ID.
 * Format matches frontend convention: "exec_" + 5 random chars.
 *
 * @returns {string} e.g. "exec_a3bX9"
 */
function generateExecId() {
  return `exec_${nanoid(5)}`;
}

/**
 * Create the initial execution detail object.
 *
 * @param {Object}  params
 * @param {string}  params.suite       - Test folder name (e.g. "E2E").
 * @param {string}  params.environment - Environment name (e.g. "QA").
 * @param {string}  params.browser     - "Chrome", "Firefox", or "Edge".
 * @param {string}  params.mode        - "Headless" or "Headed".
 * @param {number}  params.workers     - Number of parallel workers.
 * @param {string}  [params.specFile]  - Optional specific spec file path.
 * @param {string}  [params.triggeredBy='dashboard'] - Who triggered the run.
 * @returns {Object} ExecutionDetail matching the frontend contract.
 */
function createExecution({ suite, environment, browser, mode, workers, specFile, triggeredBy = 'dashboard' }) {
  return {
    id: generateExecId(),
    suite,
    environment,
    browser,
    mode,
    workers,
    specFile: specFile || undefined,
    status: EXEC_STATUS.RUNNING,
    startedAt: new Date().toISOString(),
    duration: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    triggeredBy,
    logs: [],
    progress: 0,
    currentFile: '',
    currentTest: '',
    currentStep: 'initializing',
    totalPlanned: 0,
  };
}

/**
 * Resolve the spec files for a given suite (folder name).
 * Uses dynamic spec discovery — no hardcoded suite-to-file mapping.
 *
 * @param {string}  suite    - Folder name (e.g. "E2E").
 * @param {string}  [specFile] - Optional single file override (relative path).
 * @returns {Promise<string[]>} Array of spec file paths relative to the framework root.
 */
async function resolveSpecFiles(suite, specFile) {
  if (specFile) return [specFile];

  const tree = await specDiscovery.discoverSpecs();
  const folder = tree.folders.find((f) => f.name === suite);
  if (!folder) return [];

  return folder.files.map((f) => f.relativePath);
}

/**
 * Create a log line in the frontend's expected format.
 *
 * @param {string} text  - Log message text.
 * @param {'info'|'pass'|'fail'|'warn'} [level='info'] - Log level.
 * @returns {{ ts: number, level: string, text: string }}
 */
function createLogLine(text, level = 'info') {
  return {
    ts: Date.now(),
    level,
    text,
  };
}

/**
 * Detect the log level from a Playwright stdout line.
 *
 * @param {string} line - Raw stdout line.
 * @returns {'info'|'pass'|'fail'|'warn'}
 */
function detectLogLevel(line) {
  if (line.includes('✓') || /passed/i.test(line)) return 'pass';
  if (line.includes('✗') || /fail|error/i.test(line)) return 'fail';
  if (/warn/i.test(line)) return 'warn';
  return 'info';
}

module.exports = {
  generateExecId,
  createExecution,
  resolveSpecFiles,
  createLogLine,
  detectLogLevel,
};
