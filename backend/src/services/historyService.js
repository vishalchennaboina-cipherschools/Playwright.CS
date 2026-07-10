/**
 * @fileoverview Execution history service.
 *
 * Maintains a persistent-ready list of completed executions.
 * When an execution finishes, the runner calls `record()` to move it
 * from the live store into history. The history service strips live-only
 * fields (logs, currentTest, etc.) and keeps the `Execution` shape that
 * the frontend's history table expects.
 *
 * Currently in-memory; replace the array with a DB collection later.
 *
 * @module services/historyService
 */

const logger = require('../utils/logger');

/**
 * @type {Object[]} Completed executions (newest first).
 * Each entry matches the frontend `Execution` interface.
 */
let history = [];

/**
 * Convert an ExecutionDetail into a history-safe Execution.
 *
 * @param {Object} detail - Full ExecutionDetail from the store.
 * @returns {Object} Execution (without live fields).
 */
function toHistoryEntry(detail) {
  return {
    id: detail.id,
    suite: detail.suite,
    environment: detail.environment,
    browser: detail.browser,
    mode: detail.mode,
    workers: detail.workers,
    status: detail.status,
    startedAt: detail.startedAt,
    duration: detail.duration || 0,
    passed: detail.passed || 0,
    failed: detail.failed || 0,
    skipped: detail.skipped || 0,
    triggeredBy: detail.triggeredBy || 'dashboard',
  };
}

/**
 * Record a completed execution into history.
 *
 * @param {Object} executionDetail - Full ExecutionDetail.
 */
function record(executionDetail) {
  const entry = toHistoryEntry(executionDetail);

  // Avoid duplicates (idempotent).
  const idx = history.findIndex((h) => h.id === entry.id);
  if (idx >= 0) {
    history[idx] = entry;
  } else {
    history.unshift(entry);
  }

  logger.info(`[History] Recorded execution ${entry.id} (${entry.status})`);
}

/**
 * List all history entries, newest first.
 *
 * @returns {Object[]}
 */
function list() {
  return history.map((h) => ({ ...h }));
}

/**
 * Get a single history entry by ID.
 *
 * @param {string} id
 * @returns {Object|null}
 */
function getById(id) {
  const entry = history.find((h) => h.id === id);
  return entry ? { ...entry } : null;
}

/**
 * Delete a history entry.
 *
 * @param {string} id
 * @returns {boolean} True if found and removed.
 */
function remove(id) {
  const before = history.length;
  history = history.filter((h) => h.id !== id);
  const removed = history.length < before;
  if (removed) logger.info(`[History] Deleted execution ${id}`);
  return removed;
}

/**
 * Get the total count of history entries.
 *
 * @returns {number}
 */
function count() {
  return history.length;
}

/**
 * Clear all history (useful for tests).
 */
function clear() {
  history = [];
}

module.exports = { record, list, getById, remove, count, clear };
