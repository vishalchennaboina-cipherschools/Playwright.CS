/**
 * @fileoverview Centralized configuration module.
 *
 * Reads environment variables (via dotenv) and exposes a frozen config object.
 * Every module imports config from here instead of reading process.env directly.
 * This makes it trivial to swap sources (e.g. Vault, SSM) in the future.
 *
 * @module config
 */

const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

/**
 * @typedef {Object} AppConfig
 * @property {string}  nodeEnv              - Current environment (development | production | test).
 * @property {number}  port                 - HTTP server port.
 * @property {string}  host                 - Bind address.
 * @property {string[]} corsOrigins         - Allowed CORS origins.
 * @property {string}  playwrightProjectPath - Absolute path to the Playwright framework root.
 * @property {string}  uploadsDir           - Root directory for generated artifacts.
 * @property {string}  logLevel             - Logging verbosity (debug | info | warn | error).
 * @property {string}  logDir               - Directory for log file output.
 */

/** @type {AppConfig} */
const config = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4000,
  host: process.env.HOST || '0.0.0.0',

  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:8080')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  playwrightProjectPath: path.resolve(
    __dirname,
    '../..',
    process.env.PLAYWRIGHT_PROJECT_PATH || '../automation',
  ),

  uploadsDir: path.resolve(
    __dirname,
    '../..',
    process.env.UPLOADS_DIR || 'uploads',
  ),

  logLevel: process.env.LOG_LEVEL || 'debug',

  logDir: path.resolve(
    __dirname,
    '../..',
    process.env.LOG_DIR || 'uploads/logs',
  ),
});

module.exports = config;
