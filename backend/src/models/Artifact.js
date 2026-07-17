/**
 * @fileoverview Artifact model.
 *
 * Stores metadata about generated artifacts (reports, screenshots, videos, traces).
 *
 * @module models/Artifact
 */

const mongoose = require('mongoose');

const artifactSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    execId: { type: String, required: true, index: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['report', 'screenshot', 'video', 'trace'],
      index: true,
    },
    test: { type: String, default: '', trim: true },
    url: { type: String, required: true, trim: true },
    takenAt: { type: String, required: true },
    
    // Type-specific optional fields
    suite: { type: String, trim: true },
    environment: { type: String, trim: true },
    status: { type: String, trim: true },
    generatedAt: { type: String },
    sizeMB: { type: mongoose.Schema.Types.Mixed }, // String or Number
    duration: { type: String },
    size: { type: String },
  },
  {
    collection: 'artifacts',
    id: false,
    timestamps: true,
    versionKey: false,
  },
);

artifactSchema.index({ execId: 1, type: 1 });
artifactSchema.index({ takenAt: -1 });

module.exports = mongoose.model('Artifact', artifactSchema);
