/**
 * @fileoverview Socket.IO server setup.
 *
 * Creates and configures the Socket.IO server instance,
 * registers connection handlers, and integrates with the
 * socket service for event broadcasting.
 *
 * @module socket/index
 */

const { Server } = require('socket.io');
const socketService = require('../services/socketService');
const logger = require('../utils/logger');

/**
 * Attach Socket.IO to an HTTP server.
 *
 * @param {import('http').Server} httpServer - Node HTTP server instance.
 * @param {string[]}              corsOrigins - Allowed CORS origins.
 * @returns {import('socket.io').Server} The Socket.IO server instance.
 */
function createSocketServer(httpServer, corsOrigins) {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Graceful degradation: start with WebSocket, fall back to polling.
    transports: ['websocket', 'polling'],
  });

  // ── Connection lifecycle ─────────────────────────────────────────────────

  io.on('connection', (socket) => {
    logger.info(`[Socket] Client connected: ${socket.id}`);

    socket.on('disconnect', (reason) => {
      logger.debug(`[Socket] Client disconnected: ${socket.id} (${reason})`);
    });

    // Future: subscribe to a specific execution room.
    socket.on('join-execution', (execId) => {
      socket.join(`exec:${execId}`);
      logger.debug(`[Socket] ${socket.id} joined room exec:${execId}`);
    });

    socket.on('leave-execution', (execId) => {
      socket.leave(`exec:${execId}`);
      logger.debug(`[Socket] ${socket.id} left room exec:${execId}`);
    });
  });

  // Register the io instance with the socket service.
  socketService.init(io);

  logger.success('[Socket] Socket.IO server initialised');
  return io;
}

module.exports = { createSocketServer };
