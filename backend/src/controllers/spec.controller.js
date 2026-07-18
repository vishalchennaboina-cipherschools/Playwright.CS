/** Handles dynamic spec discovery. */

const specDiscovery = require('../services/specDiscovery');
const { sendSuccess } = require('../utils/responseHelper');
const logger = require('../utils/logger');

/** Returns the full spec tree. */
async function listSpecs(_req, res) {
  try {
    const tree = await specDiscovery.discoverSpecs();
    sendSuccess(res, tree);
  } catch (err) {
    logger.error('[Controller] Failed to discover specs', err);
    res.status(500).json({ error: 'Failed to scan spec files', details: err.message });
  }
}

module.exports = { listSpecs };
