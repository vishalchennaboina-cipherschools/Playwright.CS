/**
 * @fileoverview In-memory execution store.
 *
 * Maintains live execution state in a Map. Every field on each entry
 * matches the frontend's `ExecutionDetail` interface so the REST
 * polling endpoint can return it as-is.
 *
 * Designed with a clean async interface so a MongoDB / Redis adapter
 * can replace the Map without changing any caller code.
 *
 * @module services/executionStore
 */

const logger = require('../utils/logger');

/** @type {Map<string, Object>} */
const store = new Map();

/**
 * Create (persist) a new execution in the store.
 *
 * @param {Object} execution - Full ExecutionDetail object.
 * @returns {Object} The stored execution.
 */
function create(execution) {
  store.set(execution.id, { ...execution });
  logger.debug(`[Store] Created execution ${execution.id}`);
  return get(execution.id);
}

/**
 * Retrieve a single execution by ID.
 *
 * @param {string} id - Execution ID.
 * @returns {Object|null} The execution, or null if not found.
 */
function get(id) {
  const exec = store.get(id);
  return exec ? { ...exec } : null;
}

/**
 * Retrieve all executions, newest first.
 *
 * @returns {Object[]}
 */
function getAll() {
  return Array.from(store.values())
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .map((e) => ({ ...e }));
}

/**
 * Partially update an execution.
 *
 * @param {string} id      - Execution ID.
 * @param {Object} updates - Partial fields to merge.
 * @returns {Object|null}  The updated execution, or null.
 */
function update(id, updates) {
  const exec = store.get(id);
  if (!exec) return null;

  Object.assign(exec, updates);
  logger.debug(`[Store] Updated execution ${id}`, Object.keys(updates));
  return { ...exec };
}

/**
 * Append a log line to an execution's log array.
 *
 * @param {string} id      - Execution ID.
 * @param {{ ts: number, level: string, text: string }} logLine
 */
function appendLog(id, logLine) {
  const exec = store.get(id);
  if (!exec) return;

  exec.logs.push(logLine);

  // Cap at 2000 lines to prevent unbounded memory growth.
  if (exec.logs.length > 2000) {
    exec.logs = exec.logs.slice(-1500);
  }
}

/**
 * Delete an execution from the store.
 *
 * @param {string} id - Execution ID.
 * @returns {boolean} True if the execution existed and was deleted.
 */
function remove(id) {
  const existed = store.delete(id);
  if (existed) logger.debug(`[Store] Deleted execution ${id}`);
  return existed;
}

/**
 * Check whether an execution exists.
 *
 * @param {string} id - Execution ID.
 * @returns {boolean}
 */
function has(id) {
  return store.has(id);
}

/**
 * Get the count of stored executions.
 *
 * @returns {number}
 */
function size() {
  return store.size;
}

/**
 * Clear all entries (useful for tests).
 */
function clear() {
  store.clear();
}

module.exports = { create, get, getAll, update, appendLog, remove, has, size, clear };
