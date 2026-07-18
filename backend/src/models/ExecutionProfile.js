/** Stores reusable execution profiles. */

const mongoose = require('mongoose');
const { BROWSERS, MODES } = require('../utils/constants');

const executionProfileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },

    email: { type: String, default: '', trim: true },

    defaultEnvironment: { type: String, default: '', trim: true },

    defaultBrowser: {
      type: String,
      default: 'Chrome',
      enum: Object.values(BROWSERS),
    },

    defaultWorkers: {
      type: Number,
      default: 4,
      min: 1,
      max: 16,
    },

    defaultMode: {
      type: String,
      default: 'Headless',
      enum: Object.values(MODES),
    },

    defaultFolder: { type: String, default: '', trim: true },

    defaultSpec: { type: String, default: '', trim: true },

    description: { type: String, default: '', trim: true, maxlength: 500 },
  },
  {
    collection: 'execution_profiles',
    id: false,
    timestamps: true,
    versionKey: false,
  },
);

executionProfileSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ExecutionProfile', executionProfileSchema);
