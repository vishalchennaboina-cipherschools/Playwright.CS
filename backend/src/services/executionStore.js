/**
 * @fileoverview Execution store.
 *
 * Maintains live execution state in a Map for responsive runner/socket
 * updates and persists the same frontend-facing shape to MongoDB.
 *
 * @module services/executionStore
 */

const logger = require('../utils/logger');
const Execution = require('../models/Execution');

/** @type {Map<string, Object>} */
const store = new Map();

const LOG_LIMIT = 2000;
const LOG_SLICE = 1500;

function clone(execution) {
  return execution ? { ...execution, logs: [...(execution.logs || [])] } : null;
}

function toPlain(doc) {
  if (!doc) return null;
  const raw = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    id: raw.id,
    suite: raw.suite,
    environment: raw.environment,
    browser: raw.browser,
    mode: raw.mode,
    workers: raw.workers,
    specFile: raw.specFile || undefined,
    status: raw.status,
    startedAt: raw.startedAt,
    duration: raw.duration || 0,
    passed: raw.passed || 0,
    failed: raw.failed || 0,
    skipped: raw.skipped || 0,
    triggeredBy: raw.triggeredBy || 'dashboard',
    logs: raw.logs || [],
    progress: raw.progress || 0,
    currentFile: raw.currentFile || '',
    currentTest: raw.currentTest || '',
    currentStep: raw.currentStep || '',
    totalPlanned: raw.totalPlanned || 0,
  };
}

async function persist(execution) {
  await Execution.findOneAndUpdate(
    { id: execution.id },
    { $set: execution },
    { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true },
  ).exec();
}

/**
 * Create (persist) a new execution in the store.
 *
 * @param {Object} execution - Full ExecutionDetail object.
 * @returns {Promise<Object>} The stored execution.
 */
async function create(execution) {
  store.set(execution.id, clone(execution));
  await persist(execution);
  logger.debug(`[Store] Created execution ${execution.id}`);
  return get(execution.id);
}

/**
 * Retrieve a single execution by ID.
 *
 * @param {string} id - Execution ID.
 * @returns {Promise<Object|null>} The execution, or null if not found.
 */
async function get(id) {
  const exec = store.get(id);
  if (exec) return clone(exec);

  const doc = await Execution.findOne({ id }).lean().exec();
  return toPlain(doc);
}

/**
 * Retrieve all executions, newest first.
 *
 * @returns {Promise<Object[]>}
 */
async function getAll() {
  const docs = await Execution.find({}).sort({ startedAt: -1 }).lean().exec();
  const byId = new Map(docs.map((doc) => [doc.id, toPlain(doc)]));

  for (const exec of store.values()) {
    byId.set(exec.id, clone(exec));
  }

  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );
}

/**
 * Partially update an execution.
 *
 * @param {string} id      - Execution ID.
 * @param {Object} updates - Partial fields to merge.
 * @returns {Promise<Object|null>}  The updated execution, or null.
 */
async function update(id, updates) {
  const exec = store.get(id) || (await get(id));
  if (!exec) return null;

  const next = { ...exec, ...updates };
  store.set(id, clone(next));
  await persist(next);
  logger.debug(`[Store] Updated execution ${id}`, Object.keys(updates));
  return clone(next);
}

/**
 * Append a log line to an execution's log array.
 *
 * @param {string} id      - Execution ID.
 * @param {{ ts: number, level: string, text: string }} logLine
 * @returns {Promise<void>}
 */
async function appendLog(id, logLine) {
  const exec = store.get(id) || (await get(id));
  if (!exec) return;

  exec.logs = [...(exec.logs || []), logLine];

  // Cap at 2000 lines to prevent unbounded memory/DB growth.
  if (exec.logs.length > LOG_LIMIT) {
    exec.logs = exec.logs.slice(-LOG_SLICE);
  }

  store.set(id, exec);
  await Execution.updateOne(
    { id },
    { $push: { logs: { $each: [logLine], $slice: -LOG_SLICE } } },
    { runValidators: true },
  ).exec();
}

/**
 * Delete an execution from the store and MongoDB.
 *
 * @param {string} id - Execution ID.
 * @returns {Promise<boolean>} True if the execution existed and was deleted.
 */
async function remove(id) {
  const memoryExisted = store.delete(id);
  const result = await Execution.deleteOne({ id }).exec();
  const existed = memoryExisted || result.deletedCount > 0;
  if (existed) logger.debug(`[Store] Deleted execution ${id}`);
  return existed;
}

/**
 * Check whether an execution exists.
 *
 * @param {string} id - Execution ID.
 * @returns {Promise<boolean>}
 */
async function has(id) {
  if (store.has(id)) return true;
  return Boolean(await Execution.exists({ id }).exec());
}

/**
 * Get the count of stored executions.
 *
 * @returns {Promise<number>}
 */
async function size() {
  return Execution.countDocuments({}).exec();
}

/**
 * Clear all entries (useful for tests).
 */
async function clear() {
  store.clear();
  await Execution.deleteMany({}).exec();
}

module.exports = { create, get, getAll, update, appendLog, remove, has, size, clear };
