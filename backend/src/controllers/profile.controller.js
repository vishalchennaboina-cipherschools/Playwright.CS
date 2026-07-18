/** Handles execution profile endpoints. */

const ExecutionProfile = require('../models/ExecutionProfile');
const { sendSuccess, sendOk, sendError } = require('../utils/responseHelper');
const logger = require('../utils/logger');

/** Lists all execution profiles. */
async function listProfiles(_req, res, next) {
  try {
    const profiles = await ExecutionProfile.find({}).sort({ createdAt: -1 }).lean().exec();
    sendSuccess(res, profiles);
  } catch (err) {
    next(err);
  }
}

/** Creates a new execution profile. */
async function createProfile(req, res, next) {
  try {
    const {
      name,
      email,
      defaultEnvironment,
      defaultBrowser,
      defaultWorkers,
      defaultMode,
      defaultFolder,
      defaultSpec,
      description,
    } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return sendError(res, 'Profile name is required.', 400);
    }

    const profile = await ExecutionProfile.create({
      name: name.trim(),
      email:              email              || '',
      defaultEnvironment: defaultEnvironment || '',
      defaultBrowser:     defaultBrowser     || 'Chrome',
      defaultWorkers:     defaultWorkers     || 4,
      defaultMode:        defaultMode        || 'Headless',
      defaultFolder:      defaultFolder      || '',
      defaultSpec:        defaultSpec        || '',
      description:        description        || '',
    });

    logger.info(`[Profiles] Created profile "${profile.name}"`);
    return sendSuccess(res, profile, 201);
  } catch (err) {
    if (err.code === 11000) {
      return sendError(res, `A profile named "${req.body.name}" already exists.`, 409);
    }
    return next(err);
  }
}

/** Retrieves a single execution profile. */
async function getProfile(req, res, next) {
  try {
    const profile = await ExecutionProfile.findById(req.params.id).lean().exec();
    if (!profile) return sendError(res, 'Profile not found.', 404);
    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
}

/** Updates an existing execution profile. */
async function updateProfile(req, res, next) {
  try {
    const allowed = [
      'name',
      'email',
      'defaultEnvironment',
      'defaultBrowser',
      'defaultWorkers',
      'defaultMode',
      'defaultFolder',
      'defaultSpec',
      'description',
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return sendError(res, 'No valid fields to update.', 400);
    }

    const profile = await ExecutionProfile.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true },
    ).lean().exec();

    if (!profile) return sendError(res, 'Profile not found.', 404);

    logger.info(`[Profiles] Updated profile "${profile.name}"`);
    sendOk(res, profile);
  } catch (err) {
    if (err.code === 11000) {
      return sendError(res, `A profile named "${req.body.name}" already exists.`, 409);
    }
    return next(err);
  }
}

/** Deletes an execution profile. */
async function deleteProfile(req, res, next) {
  try {
    const profile = await ExecutionProfile.findByIdAndDelete(req.params.id).lean().exec();
    if (!profile) return sendError(res, 'Profile not found.', 404);

    logger.info(`[Profiles] Deleted profile "${profile.name}"`);
    sendOk(res, { deletedId: req.params.id });
  } catch (err) {
    next(err);
  }
}

module.exports = { listProfiles, createProfile, getProfile, updateProfile, deleteProfile };
