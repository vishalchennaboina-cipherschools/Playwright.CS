/** Handles server settings endpoints. */

const { BROWSERS, ENV_URLS } = require('../utils/constants');
const { sendSuccess, sendOk } = require('../utils/responseHelper');
const logger = require('../utils/logger');

let settings = {
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

/** Retrieves server settings. */
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

/** Updates server settings. */
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

/** Retrieves the current environments map. */
function getEnvironments() {
  return { ...settings.environments };
}

module.exports = { getSettings, updateSettings, getEnvironments };
