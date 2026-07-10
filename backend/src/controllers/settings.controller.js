/**
 * @fileoverview Settings controller.
 *
 * Returns server-side settings (environments, browsers) and accepts
 * settings updates. Environments are user-configurable — users can
 * add custom environment name → URL mappings.
 *
 * Currently in-memory; ready for DB persistence later.
 *
 * @module controllers/settings.controller
 */

const { BROWSERS, ENV_URLS } = require('../utils/constants');
const { sendSuccess, sendOk } = require('../utils/responseHelper');
const logger = require('../utils/logger');

/** @type {Object} In-memory settings store. */
let settings = {
  // User-configurable environment mappings (seeded from defaults)
  environments: { ...ENV_URLS },
  slackWebhookUrl: '',
  emailRecipient: '',
  notifications: {
    automationStarted: true,
    executionCompleted: true,
    executionFailed: true,
    reportGenerated: false,
  },
  slackOnFailureOnly: true,
  dailyDigest: true,
};

/**
 * GET /api/settings
 */
async function getSettings(_req, res) {
  sendSuccess(res, {
    environments: settings.environments,
    browsers: Object.values(BROWSERS),
    slackWebhookUrl: settings.slackWebhookUrl,
    emailRecipient: settings.emailRecipient,
    notifications: settings.notifications,
    slackOnFailureOnly: settings.slackOnFailureOnly,
    dailyDigest: settings.dailyDigest,
  });
}

/**
 * PUT /api/settings
 */
async function updateSettings(req, res) {
  const allowed = [
    'environments',
    'slackWebhookUrl',
    'emailRecipient',
    'notifications',
    'slackOnFailureOnly',
    'dailyDigest',
  ];

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      settings[key] = req.body[key];
    }
  }

  logger.info('[Settings] Updated', Object.keys(req.body).filter((k) => allowed.includes(k)));
  sendOk(res);
}

/**
 * Get current environments map (used by environmentMapper).
 *
 * @returns {Record<string, string>}
 */
function getEnvironments() {
  return { ...settings.environments };
}

module.exports = { getSettings, updateSettings, getEnvironments };
