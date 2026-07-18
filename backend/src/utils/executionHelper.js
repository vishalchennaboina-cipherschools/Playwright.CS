/** Generates execution properties and handles logs. */

const { nanoid } = require('nanoid');
const { EXEC_STATUS } = require('./constants');
const specDiscovery = require('../services/specDiscovery');

/** Generates a unique execution ID. */
function generateExecId() {
  return `exec_${nanoid(5)}`;
}

/** Creates the initial execution detail object. */
function createExecution({ suite, environment, browser, mode, workers, specFile, triggeredBy = 'dashboard', email = '', profile = '', customUrl = '' }) {
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
    email:     email     || '',
    profile:   profile   || '',
    customUrl: customUrl || '',
    logs: [],
    progress: 0,
    currentFile: '',
    currentTest: '',
    currentStep: 'initializing',
    totalPlanned: 0,
  };
}

/** Resolves the spec files for a given suite. */
async function resolveSpecFiles(suite, specFile) {
  if (specFile) return [specFile];

  const tree = await specDiscovery.discoverSpecs();
  const folder = tree.folders.find((f) => f.name === suite);
  if (!folder) return [];

  return folder.files.map((f) => f.relativePath);
}

/** Creates a log line object. */
function createLogLine(text, level = 'info') {
  return {
    ts: Date.now(),
    level,
    text,
  };
}

/** Detects the log level from stdout text. */
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
