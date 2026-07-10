/**
 * @fileoverview Spec discovery controller.
 *
 * Returns the dynamically discovered spec tree from the
 * Playwright framework's tests/ directory.
 *
 * @module controllers/spec.controller
 */

const specDiscovery = require('../services/specDiscovery');
const { sendSuccess } = require('../utils/responseHelper');
const logger = require('../utils/logger');

/**
 * GET /api/specs
 * Return the full spec tree (folders + files).
 */
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
