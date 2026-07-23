/** Stores Test Evidence Metadata. */

const mongoose = require('mongoose');

const testEvidenceSchema = new mongoose.Schema(
  {
    executionId: { type: String, required: true, index: true, unique: true, trim: true },
    testCases: [
      {
        testName: { type: String, required: true, trim: true },
        status: { type: String, required: true, trim: true },
        browser: { type: String, trim: true },
        environment: { type: String, trim: true },
        duration: { type: Number, default: 0 },
        
        screenshot: { type: String, default: null },
        log: { type: String, default: null },
        trace: { type: String, default: null },
        video: { type: String, default: null },
        network: { type: String, default: null },
        console: { type: String, default: null },
      }
    ]
  },
  {
    collection: 'test_evidences',
    timestamps: true,
    versionKey: false,
  }
);

// TTL Index: Automatically expire evidence records after 7 days (604800 seconds)
testEvidenceSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model('TestEvidence', testEvidenceSchema);
