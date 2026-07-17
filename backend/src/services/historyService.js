/**
 * @fileoverview Execution history service.
 *
 * Maintains a persistent list of completed executions.
 * When an execution finishes, the runner calls `record()` to move it
 * from the live store into history.
 *
 * @module services/historyService
 */

const logger = require('../utils/logger');
const ExecutionHistory = require('../models/ExecutionHistory');

/**
 * Record a completed execution into history.
 *
 * @param {Object} executionDetail - Full ExecutionDetail.
 * @returns {Promise<Object>}
 */
async function record(executionDetail) {
  try {
    const doc = await ExecutionHistory.findOneAndUpdate(
      { id: executionDetail.id },
      { $set: executionDetail },
      { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true },
    ).exec();
    
    logger.info(`[History] Recorded execution ${executionDetail.id} (${executionDetail.status})`);
    return doc;
  } catch (err) {
    logger.error(`[History] Failed to record execution ${executionDetail.id}`, err);
    throw err;
  }
}

/**
 * List all history entries, newest first.
 *
 * @returns {Promise<Object[]>}
 */
async function list() {
  const docs = await ExecutionHistory.find({}).sort({ startedAt: -1 }).lean().exec();
  return docs.map(doc => {
    const raw = typeof doc.toObject === 'function' ? doc.toObject() : doc;
    return raw;
  });
}

/**
 * Get a single history entry by ID.
 *
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
async function getById(id) {
  const doc = await ExecutionHistory.findOne({ id }).lean().exec();
  if (!doc) return null;
  return typeof doc.toObject === 'function' ? doc.toObject() : doc;
}

/**
 * Delete a history entry.
 *
 * @param {string} id
 * @returns {Promise<boolean>} True if found and removed.
 */
async function remove(id) {
  const result = await ExecutionHistory.deleteOne({ id }).exec();
  const removed = result.deletedCount > 0;
  if (removed) logger.info(`[History] Deleted execution ${id}`);
  return removed;
}

/**
 * Delete multiple history entries.
 *
 * @param {string[]} ids
 * @returns {Promise<number>} Number of deleted entries.
 */
async function removeMany(ids) {
  const result = await ExecutionHistory.deleteMany({ id: { $in: ids } }).exec();
  if (result.deletedCount > 0) logger.info(`[History] Deleted ${result.deletedCount} executions`);
  return result.deletedCount;
}

/**
 * Delete all history entries.
 *
 * @returns {Promise<number>} Number of deleted entries.
 */
async function removeAll() {
  const result = await ExecutionHistory.deleteMany({}).exec();
  if (result.deletedCount > 0) logger.info(`[History] Deleted all (${result.deletedCount}) executions`);
  return result.deletedCount;
}

/**
 * Get the total count of history entries.
 *
 * @returns {Promise<number>}
 */
async function count() {
  return ExecutionHistory.countDocuments({}).exec();
}

/**
 * Clear all history (useful for tests).
 */
async function clear() {
  await ExecutionHistory.deleteMany({}).exec();
}

module.exports = { record, list, getById, remove, removeMany, removeAll, count, clear };
