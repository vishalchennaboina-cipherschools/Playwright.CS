/** Bootstraps the HTTP and Socket.IO server. */

const http = require('node:http');
const createApp = require('./app');
const config = require('./config');
const { createSocketServer } = require('./socket');
const logger = require('./utils/logger');
const { ensureDir } = require('./utils/fileHelper');
const { connectDB, disconnectDB } = require('./config/db');

async function bootstrap() {
  await ensureDir(config.uploadsDir);
  await ensureDir(`${config.uploadsDir}/reports`);
  await ensureDir(`${config.uploadsDir}/screenshots`);
  await ensureDir(`${config.uploadsDir}/videos`);
  await ensureDir(`${config.uploadsDir}/traces`);
  await ensureDir(`${config.uploadsDir}/logs`);

  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  createSocketServer(server, config.corsOrigins);

  server.listen(config.port, config.host, () => {
    const meta = { category: logger.CATEGORIES.SERVER };
    logger.success(`Playwright Automation Backend running`, meta);
    logger.info(`REST API:    http://${config.host}:${config.port}`, meta);
    logger.info(`Socket.IO:   http://${config.host}:${config.port}`, meta);
    logger.info(`Health:      http://${config.host}:${config.port}/health`, meta);
    logger.info(`Uploads:     http://${config.host}:${config.port}/uploads`, meta);
    logger.info(`Environment: ${config.nodeEnv}`, meta);
    logger.info(`CORS:        ${config.corsOrigins.join(', ')}`, meta);
    logger.info(`Playwright:  ${config.playwrightProjectPath}`, meta);
  });

  function shutdown(signal) {
    logger.warn(`Received ${signal}. Shutting down gracefully…`, { category: logger.CATEGORIES.SERVER });

    server.close(async () => {
      logger.info('HTTP server closed', { category: logger.CATEGORIES.SERVER });
      await disconnectDB();
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout', { category: logger.CATEGORIES.SERVER });
      process.exit(1);
    }, 10_000);
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { category: logger.CATEGORIES.SERVER, error: err });
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { category: logger.CATEGORIES.SERVER, reason });
  });
}

bootstrap().catch((err) => {
  logger.error('Failed to start server:', {
    category: logger.CATEGORIES.SERVER,
    error: err
  });
  process.exit(1);
});
