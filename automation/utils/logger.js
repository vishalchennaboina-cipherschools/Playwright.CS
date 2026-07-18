/**
 * @fileoverview Playwright Automation Logger
 *
 * Provides structured logging for Playwright tests.
 * This logger reads EXEC_ID from the environment and injects it
 * into all log messages. It allows logs to be correlated with the
 * backend execution record.
 */

const fs = require('fs');
const path = require('path');

const EXEC_ID = process.env.EXEC_ID || 'MANUAL-RUN';

// Define levels to match backend
const LEVELS = {
  FATAL: { value: 0, color: '\x1b[41m\x1b[37m' },
  ERROR: { value: 1, color: '\x1b[31m' },
  WARN:  { value: 2, color: '\x1b[33m' },
  SUCCESS: { value: 3, color: '\x1b[32m' },
  INFO:  { value: 4, color: '\x1b[36m' },
  DEBUG: { value: 5, color: '\x1b[90m' },
  TRACE: { value: 6, color: '\x1b[37m' }
};

const RESET_COLOR = '\x1b[0m';
const CURRENT_LEVEL = LEVELS[process.env.LOG_LEVEL?.toUpperCase()]?.value ?? LEVELS.INFO.value;

/**
 * Format and emit a log message.
 * @param {string} levelName
 * @param {string} category
 * @param {string} message
 * @param {Object} metadata
 */
function log(levelName, category, message, metadata = {}) {
  const level = LEVELS[levelName];
  if (level.value > CURRENT_LEVEL) return;

  const timestamp = new Date().toISOString();
  
  // Clean metadata
  const cleanMeta = { ...metadata };
  if (cleanMeta.category) delete cleanMeta.category;
  
  // Structure: [TIMESTAMP] [LEVEL] [CATEGORY] [EXEC: ID] Message
  let out = `[${timestamp}] [${levelName}] [${category}] [Exec: ${EXEC_ID}] ${message}`;

  if (Object.keys(cleanMeta).length > 0) {
    if (cleanMeta.error && cleanMeta.error.stack) {
      out += `\n${cleanMeta.error.stack}`;
    } else {
      out += `\nMetadata: ${JSON.stringify(cleanMeta, null, 2)}`;
    }
  }

  // Console output
  const color = level.color;
  if (levelName === 'ERROR' || levelName === 'FATAL') {
    console.error(`${color}${out}${RESET_COLOR}`);
  } else {
    // using console.log because process.stdout may not play well with Playwright reporters
    console.log(`${color}${out}${RESET_COLOR}`);
  }
}

const logger = {
  CATEGORIES: {
    PLAYWRIGHT: 'PLAYWRIGHT',
    UI: 'UI',
    CONFIG: 'CONFIG',
    AUTH: 'AUTH',
  },
  
  fatal:   (msg, meta = {}) => log('FATAL',   meta.category || logger.CATEGORIES.PLAYWRIGHT, msg, meta),
  error:   (msg, meta = {}) => log('ERROR',   meta.category || logger.CATEGORIES.PLAYWRIGHT, msg, meta),
  warn:    (msg, meta = {}) => log('WARN',    meta.category || logger.CATEGORIES.PLAYWRIGHT, msg, meta),
  success: (msg, meta = {}) => log('SUCCESS', meta.category || logger.CATEGORIES.PLAYWRIGHT, msg, meta),
  info:    (msg, meta = {}) => log('INFO',    meta.category || logger.CATEGORIES.PLAYWRIGHT, msg, meta),
  debug:   (msg, meta = {}) => log('DEBUG',   meta.category || logger.CATEGORIES.PLAYWRIGHT, msg, meta),
  trace:   (msg, meta = {}) => log('TRACE',   meta.category || logger.CATEGORIES.PLAYWRIGHT, msg, meta),
};

module.exports = logger;
