/** Maintains a persistent list of completed executions. */

const logger = require('../utils/logger');
const ExecutionHistory = require('../models/ExecutionHistory');

/** Records a completed execution into history. */
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

/** Lists all history entries. */
async function list() {
  const docs = await ExecutionHistory.find({}).sort({ startedAt: -1 }).lean().exec();
  return docs.map(doc => {
    const raw = typeof doc.toObject === 'function' ? doc.toObject() : doc;
    return raw;
  });
}

/** Retrieves a history entry by ID. */
async function getById(id) {
  const doc = await ExecutionHistory.findOne({ id }).lean().exec();
  if (!doc) return null;
  return typeof doc.toObject === 'function' ? doc.toObject() : doc;
}

/** Deletes a history entry. */
async function remove(id) {
  const result = await ExecutionHistory.deleteOne({ id }).exec();
  const removed = result.deletedCount > 0;
  if (removed) logger.info(`[History] Deleted execution ${id}`);
  return removed;
}

/** Deletes multiple history entries. */
async function removeMany(ids) {
  const result = await ExecutionHistory.deleteMany({ id: { $in: ids } }).exec();
  if (result.deletedCount > 0) logger.info(`[History] Deleted ${result.deletedCount} executions`);
  return result.deletedCount;
}

/** Deletes all history entries. */
async function removeAll() {
  const result = await ExecutionHistory.deleteMany({}).exec();
  if (result.deletedCount > 0) logger.info(`[History] Deleted all (${result.deletedCount}) executions`);
  return result.deletedCount;
}

/** Returns the total count of history entries. */
async function count() {
  return ExecutionHistory.countDocuments({}).exec();
}

/** Clears all history. */
async function clear() {
  await ExecutionHistory.deleteMany({}).exec();
}

module.exports = { record, list, getById, remove, removeMany, removeAll, count, clear };
