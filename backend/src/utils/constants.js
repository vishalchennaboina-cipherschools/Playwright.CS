/** Application-wide constants. */

const EXEC_STATUS = Object.freeze({
  RUNNING: 'running',
  PASSED: 'passed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
  ABORTED: 'aborted',
});

const ENVIRONMENTS = Object.freeze({
  QA: 'QA',
  PRODUCTION: 'Production',
});

const ENV_URLS = Object.freeze({
  QA: 'https://qa.cipherschools.com',
  Production: 'https://www.cipherschools.com',
});

const BROWSERS = Object.freeze({
  CHROME: 'Chrome',
  FIREFOX: 'Firefox',
  EDGE: 'Edge',
});

const BROWSER_PROJECT_MAP = Object.freeze({
  Chrome: 'chromium',
  Firefox: 'firefox',
  Edge: 'msedge',
});

const MODES = Object.freeze({
  HEADLESS: 'Headless',
  HEADED: 'Headed',
});

const SUITES = Object.freeze([
  'Smoke',
  'Regression',
  'Authentication',
  'Courses',
  'Batches',
  'Practice',
  'Rewards',
  'Full Regression',
]);

const SUITE_FILES = Object.freeze({
  Smoke: ['tests/smoke/home.spec.js', 'tests/smoke/nav.spec.js'],
  Regression: ['tests/regression/checkout.spec.js', 'tests/regression/profile.spec.js'],
  Authentication: ['tests/auth/login.spec.js', 'tests/auth/signup.spec.js', 'tests/auth/reset.spec.js'],
  Courses: ['tests/courses/enroll.spec.js', 'tests/courses/playback.spec.js'],
  Batches: ['tests/batches/join.spec.js', 'tests/batches/schedule.spec.js'],
  Practice: ['tests/practice/editor.spec.js', 'tests/practice/submit.spec.js'],
  Rewards: ['tests/rewards/claim.spec.js'],
  'Full Regression': ['tests/**/*.spec.js'],
});

const LOG_LEVELS = Object.freeze({
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SUCCESS: 4,
});

const SOCKET_EVENTS = Object.freeze({
  EXECUTION_STARTED: 'execution-started',
  EXECUTION_PROGRESS: 'execution-progress',
  EXECUTION_LOG: 'execution-log',
  EXECUTION_REPORT: 'execution-report',
  EXECUTION_SCREENSHOT: 'execution-screenshot',
  EXECUTION_VIDEO: 'execution-video',
  EXECUTION_TRACE: 'execution-trace',
  EXECUTION_COMPLETED: 'execution-completed',
  EXECUTION_ERROR: 'execution-error',
});

const ARTIFACT_TYPES = Object.freeze({
  REPORT: 'report',
  SCREENSHOT: 'screenshot',
  VIDEO: 'video',
  TRACE: 'trace',
  LOG: 'log',
});

const EXT_TO_ARTIFACT = Object.freeze({
  '.html': ARTIFACT_TYPES.REPORT,
  '.png': ARTIFACT_TYPES.SCREENSHOT,
  '.jpg': ARTIFACT_TYPES.SCREENSHOT,
  '.jpeg': ARTIFACT_TYPES.SCREENSHOT,
  '.webm': ARTIFACT_TYPES.VIDEO,
  '.mp4': ARTIFACT_TYPES.VIDEO,
  '.zip': ARTIFACT_TYPES.TRACE,
  '.log': ARTIFACT_TYPES.LOG,
  '.txt': ARTIFACT_TYPES.LOG,
});

const POLL_INTERVAL_MS = 1200;

module.exports = {
  EXEC_STATUS,
  ENVIRONMENTS,
  ENV_URLS,
  BROWSERS,
  BROWSER_PROJECT_MAP,
  MODES,
  SUITES,
  SUITE_FILES,
  LOG_LEVELS,
  SOCKET_EVENTS,
  ARTIFACT_TYPES,
  EXT_TO_ARTIFACT,
  POLL_INTERVAL_MS,
};
