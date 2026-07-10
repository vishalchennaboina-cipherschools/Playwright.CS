/**
 * @fileoverview Socket.IO service.
 *
 * Holds the Socket.IO server instance and provides typed emit helpers.
 * All real-time communication flows through this service so the rest
 * of the codebase never touches `io` directly.
 *
 * @module services/socketService
 */

const { SOCKET_EVENTS } = require('../utils/constants');
const logger = require('../utils/logger');

/** @type {import('socket.io').Server|null} */
let io = null;

/**
 * Initialise the service with the Socket.IO server instance.
 *
 * @param {import('socket.io').Server} socketServer
 */
function init(socketServer) {
  io = socketServer;
  logger.info('[Socket] Service initialised');
}

/**
 * Get the raw Socket.IO server (for advanced use).
 *
 * @returns {import('socket.io').Server|null}
 */
function getIO() {
  return io;
}

// ── Typed event emitters ─────────────────────────────────────────────────────

/**
 * Emit an event to all connected clients.
 *
 * @param {string} event - Event name.
 * @param {*}      data  - Payload.
 */
function broadcast(event, data) {
  if (!io) return;
  io.emit(event, data);
}

/** @param {Object} execution */
function emitStarted(execution) {
  broadcast(SOCKET_EVENTS.EXECUTION_STARTED, execution);
}

/**
 * @param {string} execId
 * @param {Object} progress - { progress, passed, failed, skipped, currentFile, currentTest, currentStep }
 */
function emitProgress(execId, progress) {
  broadcast(SOCKET_EVENTS.EXECUTION_PROGRESS, { execId, ...progress });
}

/**
 * @param {string} execId
 * @param {{ ts: number, level: string, text: string }} logLine
 */
function emitLog(execId, logLine) {
  broadcast(SOCKET_EVENTS.EXECUTION_LOG, { execId, ...logLine });
}

/** @param {Object} report */
function emitReport(report) {
  broadcast(SOCKET_EVENTS.EXECUTION_REPORT, report);
}

/** @param {Object} screenshot */
function emitScreenshot(screenshot) {
  broadcast(SOCKET_EVENTS.EXECUTION_SCREENSHOT, screenshot);
}

/** @param {Object} video */
function emitVideo(video) {
  broadcast(SOCKET_EVENTS.EXECUTION_VIDEO, video);
}

/** @param {Object} trace */
function emitTrace(trace) {
  broadcast(SOCKET_EVENTS.EXECUTION_TRACE, trace);
}

/** @param {Object} execution - Final execution state. */
function emitCompleted(execution) {
  broadcast(SOCKET_EVENTS.EXECUTION_COMPLETED, execution);
}

/**
 * @param {string} execId
 * @param {string} message
 */
function emitError(execId, message) {
  broadcast(SOCKET_EVENTS.EXECUTION_ERROR, { execId, error: message });
}

module.exports = {
  init,
  getIO,
  broadcast,
  emitStarted,
  emitProgress,
  emitLog,
  emitReport,
  emitScreenshot,
  emitVideo,
  emitTrace,
  emitCompleted,
  emitError,
};
