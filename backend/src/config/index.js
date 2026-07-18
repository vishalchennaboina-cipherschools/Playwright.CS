/** Loads and exposes environment configurations. */

const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

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

  logLevel: process.env.LOG_LEVEL || 'info',

  logDir: path.resolve(
    __dirname,
    '../..',
    process.env.LOG_DIR || 'logs',
  ),

  logToFile: process.env.LOG_TO_FILE !== 'false',
  logToConsole: process.env.LOG_TO_CONSOLE !== 'false',

  mongoUri: process.env.MONGODB_URI,

  outputDir: path.join(
    path.resolve(__dirname, '../..', process.env.PLAYWRIGHT_PROJECT_PATH || '../automation'), 
    'test-results'
  ),

  reportDir: path.join(
    path.resolve(__dirname, '../..', process.env.PLAYWRIGHT_PROJECT_PATH || '../automation'), 
    'playwright-report'
  ),
});

module.exports = config;
