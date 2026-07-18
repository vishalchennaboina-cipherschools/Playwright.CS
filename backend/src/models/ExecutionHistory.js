/** Stores completed execution history. */

const mongoose = require('mongoose');
const { EXEC_STATUS, BROWSERS, MODES } = require('../utils/constants');

const logLineSchema = new mongoose.Schema(
  {
    ts: { type: Number, required: true },
    level: { type: String, required: true, trim: true },
    text: { type: String, required: true },
  },
  { _id: false },
);

const executionHistorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    suite: { type: String, required: true, trim: true },
    environment: { type: String, required: true, trim: true },
    browser: { type: String, required: true, enum: Object.values(BROWSERS) },
    mode: { type: String, required: true, enum: Object.values(MODES) },
    workers: { type: Number, required: true, min: 1, max: 16 },
    specFile: { type: String, trim: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(EXEC_STATUS),
      index: true,
    },
    startedAt: { type: String, required: true, index: true },
    duration: { type: Number, default: 0, min: 0 },
    passed: { type: Number, default: 0, min: 0 },
    failed: { type: Number, default: 0, min: 0 },
    skipped: { type: Number, default: 0, min: 0 },
    triggeredBy: { type: String, default: 'dashboard', trim: true },
    email:     { type: String, default: '', trim: true },
    profile:   { type: String, default: '', trim: true },
    customUrl: { type: String, default: '', trim: true },
    logs: { type: [logLineSchema], default: [] },
    progress: { type: Number, default: 100, min: 0, max: 100 },
    currentFile: { type: String, default: '' },
    currentTest: { type: String, default: '' },
    currentStep: { type: String, default: 'finished' },
    totalPlanned: { type: Number, default: 0, min: 0 },
  },
  {
    collection: 'execution_histories',
    id: false,
    timestamps: true,
    versionKey: false,
  },
);

executionHistorySchema.index({ status: 1, startedAt: -1 });
executionHistorySchema.index({ startedAt: -1 });

module.exports = mongoose.model('ExecutionHistory', executionHistorySchema);
