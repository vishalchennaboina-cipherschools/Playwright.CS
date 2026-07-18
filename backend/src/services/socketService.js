/** Handles Socket.IO real-time communication. */

const { SOCKET_EVENTS } = require('../utils/constants');
const logger = require('../utils/logger');

let io = null;

/** Initializes the service with the Socket.IO server instance. */
function init(socketServer) {
  io = socketServer;
  logger.info('[Socket] Service initialised');
}

/** Retrieves the raw Socket.IO server. */
function getIO() {
  return io;
}

/** Emits an event to all connected clients. */
function broadcast(event, data) {
  if (!io) return;
  io.emit(event, data);
}

function emitStarted(execution) {
  broadcast(SOCKET_EVENTS.EXECUTION_STARTED, execution);
}

function emitProgress(execId, progress) {
  broadcast(SOCKET_EVENTS.EXECUTION_PROGRESS, { execId, ...progress });
}

function emitLog(execId, logLine) {
  broadcast(SOCKET_EVENTS.EXECUTION_LOG, { execId, ...logLine });
}

function emitReport(report) {
  broadcast(SOCKET_EVENTS.EXECUTION_REPORT, report);
}

function emitScreenshot(screenshot) {
  broadcast(SOCKET_EVENTS.EXECUTION_SCREENSHOT, screenshot);
}

function emitVideo(video) {
  broadcast(SOCKET_EVENTS.EXECUTION_VIDEO, video);
}

function emitTrace(trace) {
  broadcast(SOCKET_EVENTS.EXECUTION_TRACE, trace);
}

function emitCompleted(execution) {
  broadcast(SOCKET_EVENTS.EXECUTION_COMPLETED, execution);
}

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
