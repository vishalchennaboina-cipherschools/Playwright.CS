/**
 * @fileoverview Centralized logger.
 *
 * Provides levelled logging (DEBUG, INFO, WARN, ERROR, SUCCESS) to both
 * the console and a rotating log file inside the configured log directory.
 *
 * Usage:
 *   const logger = require('./logger');
 *   logger.info('Server started on port 4000');
 *   logger.error('Failed to spawn Playwright', err);
 *
 * @module utils/logger
 */

const fs = require('node:fs');
const path = require('node:path');
const config = require('../config');
const { LOG_LEVELS } = require('./constants');

// ── Ensure log directory exists ──────────────────────────────────────────────

fs.mkdirSync(config.logDir, { recursive: true });

const logFilePath = path.join(config.logDir, 'server.log');

// ── Internal helpers ─────────────────────────────────────────────────────────

const LEVEL_NAMES = Object.freeze({
  [LOG_LEVELS.DEBUG]: 'DEBUG',
  [LOG_LEVELS.INFO]: 'INFO',
  [LOG_LEVELS.WARN]: 'WARN',
  [LOG_LEVELS.ERROR]: 'ERROR',
  [LOG_LEVELS.SUCCESS]: 'SUCCESS',
});

const LEVEL_COLORS = Object.freeze({
  [LOG_LEVELS.DEBUG]: '\x1b[90m',   // gray
  [LOG_LEVELS.INFO]: '\x1b[36m',    // cyan
  [LOG_LEVELS.WARN]: '\x1b[33m',    // yellow
  [LOG_LEVELS.ERROR]: '\x1b[31m',   // red
  [LOG_LEVELS.SUCCESS]: '\x1b[32m', // green
});

const RESET = '\x1b[0m';

/**
 * Resolve the configured log level string to its numeric value.
 * @returns {number}
 */
function resolveMinLevel() {
  const key = (config.logLevel || 'debug').toUpperCase();
  return LOG_LEVELS[key] ?? LOG_LEVELS.DEBUG;
}

const minLevel = resolveMinLevel();

/**
 * Format a timestamp for log output.
 * @returns {string} ISO-like local timestamp.
 */
function timestamp() {
  return new Date().toISOString();
}

/**
 * Write a single log entry.
 *
 * @param {number} level   - Numeric log level from LOG_LEVELS.
 * @param {string} message - Primary message.
 * @param {*}      [data]  - Optional additional data (Error, object, etc.).
 */
function write(level, message, data) {
  if (level < minLevel) return;

  const label = LEVEL_NAMES[level] || 'LOG';
  const ts = timestamp();
  const color = LEVEL_COLORS[level] || '';

  // Console output (coloured)
  const prefix = `${color}[${label}]${RESET}`;
  const line = `${ts} ${prefix} ${message}`;
  if (level >= LOG_LEVELS.ERROR) {
    console.error(line, data !== undefined ? data : '');
  } else if (level >= LOG_LEVELS.WARN) {
    console.warn(line, data !== undefined ? data : '');
  } else {
    console.log(line, data !== undefined ? data : '');
  }

  // File output (plain text, append)
  const fileLine = `${ts} [${label}] ${message}${data !== undefined ? ` ${data instanceof Error ? data.stack : JSON.stringify(data)}` : ''}\n`;
  fs.appendFile(logFilePath, fileLine, () => {});
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * @type {Object} logger
 * @property {function} debug   - Log at DEBUG level.
 * @property {function} info    - Log at INFO level.
 * @property {function} warn    - Log at WARN level.
 * @property {function} error   - Log at ERROR level.
 * @property {function} success - Log at SUCCESS level.
 */
const logger = {
  debug: (msg, data) => write(LOG_LEVELS.DEBUG, msg, data),
  info: (msg, data) => write(LOG_LEVELS.INFO, msg, data),
  warn: (msg, data) => write(LOG_LEVELS.WARN, msg, data),
  error: (msg, data) => write(LOG_LEVELS.ERROR, msg, data),
  success: (msg, data) => write(LOG_LEVELS.SUCCESS, msg, data),
};

module.exports = logger;
