/**
 * @fileoverview Express application factory.
 *
 * Builds and configures the Express app with all middleware, routes,
 * and error handlers. The app is exported separately from the HTTP
 * server so it can be used in tests without starting the server.
 *
 * @module app
 */

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('node:path');

const config = require('./config');
const createRequestLogger = require('./middleware/requestLogger');
const createSecurityMiddleware = require('./middleware/security');
const responseFormatter = require('./middleware/responseFormatter');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

// Routes
const executionRoutes = require('./routes/execution.routes');
const artifactRoutes = require('./routes/artifact.routes');
const settingsRoutes = require('./routes/settings.routes');
const specRoutes = require('./routes/spec.routes');

const logger = require('./utils/logger');

/**
 * Create and configure the Express application.
 *
 * @returns {import('express').Express}
 */
function createApp() {
  const app = express();

  // ── Security ───────────────────────────────────────────────────────────
  const securityMiddleware = createSecurityMiddleware();
  for (const mw of securityMiddleware) {
    app.use(mw);
  }

  // ── CORS ───────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: config.corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // ── Compression ────────────────────────────────────────────────────────
  app.use(compression());

  // ── Body parsing ───────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ── Request logging ────────────────────────────────────────────────────
  app.use(createRequestLogger(config.nodeEnv));

  // ── Response formatter ─────────────────────────────────────────────────
  app.use(responseFormatter);

  // ── Static files (artifact serving) ────────────────────────────────────
  // Serves /uploads/* from the uploads directory.
  app.use(
    '/uploads',
    express.static(config.uploadsDir, {
      maxAge: '7d',
      setHeaders: (res, filePath) => {
        // Trace ZIPs need CORS for trace.playwright.dev
        if (filePath.endsWith('.zip')) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Content-Type', 'application/zip');
        }
      },
    }),
  );

  // ── Health check ───────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // ── API routes ─────────────────────────────────────────────────────────
  app.use('/api/executions', executionRoutes);
  app.use('/api', artifactRoutes);
  app.use('/api', settingsRoutes);
  app.use('/api', specRoutes);

  // ── 404 fallback ───────────────────────────────────────────────────────
  app.use(notFound);

  // ── Global error handler (must be last) ────────────────────────────────
  app.use(errorHandler);

  logger.info('[App] Express application configured');

  return app;
}

module.exports = createApp;
