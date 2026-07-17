/**
 * @fileoverview HTTP + Socket.IO server bootstrap.
 *
 * Creates the HTTP server from the Express app, attaches Socket.IO,
 * starts listening, and handles graceful shutdown.
 *
 * @module server
 */

const http = require('node:http');
const createApp = require('./app');
const config = require('./config');
const { createSocketServer } = require('./socket');
const logger = require('./utils/logger');
const { ensureDir } = require('./utils/fileHelper');
const { connectDB, disconnectDB } = require('./config/db');

async function bootstrap() {
  // Ensure upload directories exist.
  await ensureDir(config.uploadsDir);
  await ensureDir(`${config.uploadsDir}/reports`);
  await ensureDir(`${config.uploadsDir}/screenshots`);
  await ensureDir(`${config.uploadsDir}/videos`);
  await ensureDir(`${config.uploadsDir}/traces`);
  await ensureDir(`${config.uploadsDir}/logs`);

  // Connect to MongoDB
  await connectDB();

  // Create Express app.
  const app = createApp();

  // Create HTTP server.
  const server = http.createServer(app);

  // Attach Socket.IO.
  createSocketServer(server, config.corsOrigins);

  // Start listening.
  server.listen(config.port, config.host, () => {
    logger.success(`[Server] Playwright Automation Backend running`);
    logger.info(`[Server] REST API:    http://${config.host}:${config.port}`);
    logger.info(`[Server] Socket.IO:   http://${config.host}:${config.port}`);
    logger.info(`[Server] Health:      http://${config.host}:${config.port}/health`);
    logger.info(`[Server] Uploads:     http://${config.host}:${config.port}/uploads`);
    logger.info(`[Server] Environment: ${config.nodeEnv}`);
    logger.info(`[Server] CORS:        ${config.corsOrigins.join(', ')}`);
    logger.info(`[Server] Playwright:  ${config.playwrightProjectPath}`);
  });

  // ── Graceful shutdown ──────────────────────────────────────────────────

  function shutdown(signal) {
    logger.warn(`[Server] Received ${signal}. Shutting down gracefully…`);

    server.close(async () => {
      logger.info('[Server] HTTP server closed');
      await disconnectDB();
      process.exit(0);
    });

    // Force exit after 10 seconds.
    setTimeout(() => {
      logger.error('[Server] Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Catch uncaught exceptions.
  process.on('uncaughtException', (err) => {
    logger.error('[Server] Uncaught exception', err);
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('[Server] Unhandled rejection', reason);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
