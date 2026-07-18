/** Creates and configures the Socket.IO server instance. */

const { Server } = require('socket.io');
const socketService = require('../services/socketService');
const logger = require('../utils/logger');

/** Attaches Socket.IO to an HTTP server. */
function createSocketServer(httpServer, corsOrigins) {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`, { category: logger.CATEGORIES.SOCKET });

    socket.on('disconnect', (reason) => {
      logger.debug(`Client disconnected: ${socket.id} (${reason})`, { category: logger.CATEGORIES.SOCKET });
    });

    socket.on('join-execution', (execId) => {
      socket.join(`exec:${execId}`);
      logger.debug(`${socket.id} joined room exec:${execId}`, { category: logger.CATEGORIES.SOCKET });
    });

    socket.on('leave-execution', (execId) => {
      socket.leave(`exec:${execId}`);
      logger.debug(`${socket.id} left room exec:${execId}`, { category: logger.CATEGORIES.SOCKET });
    });
  });

  socketService.init(io);

  logger.success('Socket.IO server initialised', { category: logger.CATEGORIES.SOCKET });
  return io;
}

module.exports = { createSocketServer };
