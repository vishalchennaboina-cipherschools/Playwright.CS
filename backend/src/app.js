/** Configures the Express application. */

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('node:path');

const config = require('./config');
const { correlationMiddleware } = require('./middleware/correlation');
const createRequestLogger = require('./middleware/requestLogger');
const createSecurityMiddleware = require('./middleware/security');
const responseFormatter = require('./middleware/responseFormatter');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const executionRoutes = require('./routes/execution.routes');
const artifactRoutes  = require('./routes/artifact.routes');
const settingsRoutes  = require('./routes/settings.routes');
const specRoutes      = require('./routes/spec.routes');
const profileRoutes   = require('./routes/profile.routes');

const logger = require('./utils/logger');

function createApp() {
  const app = express();

  const securityMiddleware = createSecurityMiddleware();
  for (const mw of securityMiddleware) {
    app.use(mw);
  }

  app.use(
    cors({
      origin: config.corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  app.use(compression());

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use(correlationMiddleware);
  app.use(createRequestLogger(config.nodeEnv));

  app.use(responseFormatter);

  // Serves generated artifacts.
  app.use(
    '/uploads',
    express.static(config.uploadsDir, {
      maxAge: '7d',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.zip')) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Content-Type', 'application/zip');
        }
      },
    }),
  );

  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/executions', executionRoutes);
  app.use('/api/profiles',   profileRoutes);
  app.use('/api', artifactRoutes);
  app.use('/api', settingsRoutes);
  app.use('/api', specRoutes);

  app.use(notFound);
  app.use(errorHandler);

  logger.info('[App] Express application configured');

  return app;
}

module.exports = createApp;
