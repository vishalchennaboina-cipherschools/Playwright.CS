const mongoose = require('mongoose');
const config = require('./src/config');
const executionStore = require('./src/services/executionStore');
const historyService = require('./src/services/historyService');
const artifactScanner = require('./src/services/artifactScanner');
const Execution = require('./src/models/Execution');
const ExecutionHistory = require('./src/models/ExecutionHistory');
const Artifact = require('./src/models/Artifact');

const id = `exec_phase2_${Date.now()}`;

(async () => {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000, maxPoolSize: 2 });
  try {
    // 1. Create a live execution
    console.log('Creating live execution...');
    await executionStore.create({
      id,
      suite: 'Phase2Smoke',
      environment: 'QA',
      browser: 'Chrome',
      mode: 'Headless',
      workers: 1,
      status: 'running',
      startedAt: new Date().toISOString(),
      duration: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      triggeredBy: 'phase2-smoke',
      logs: [],
      progress: 0,
      currentFile: '',
      currentTest: '',
      currentStep: 'initializing',
      totalPlanned: 0,
    });

    await executionStore.appendLog(id, { ts: Date.now(), level: 'info', text: 'phase 2 smoke log' });
    
    // Check it exists in Execution
    const liveDoc = await Execution.findOne({ id }).exec();
    if (!liveDoc) throw new Error('Live execution not found in DB');
    
    // 2. Simulate completion
    console.log('Simulating completion...');
    await executionStore.update(id, { status: 'passed', progress: 100, duration: 2, passed: 1 });
    const finalExec = await executionStore.get(id);
    
    // Record to history
    await historyService.record(finalExec);
    
    // Remove from live store
    await executionStore.remove(id);

    // Check it is moved
    const remainingLive = await Execution.countDocuments({ id }).exec();
    if (remainingLive > 0) throw new Error('Live execution was not removed from DB');
    
    const histDoc = await ExecutionHistory.findOne({ id }).exec();
    if (!histDoc) throw new Error('History execution not found in DB');
    if (histDoc.logs.length !== 1) throw new Error('History execution missing logs');

    // 3. Simulate artifact
    console.log('Creating artifact...');
    await Artifact.create({
      id: `a_${Date.now()}`,
      execId: id,
      type: 'report',
      test: 'Smoke',
      url: '/uploads/reports/test.html',
      takenAt: new Date().toISOString()
    });

    const reports = await artifactScanner.listReports();
    if (!reports.some(r => r.execId === id)) throw new Error('Artifact not found by scanner');

    // 4. Test deletion
    console.log('Testing deletion...');
    const delArtifacts = await artifactScanner.removeByExecId(id);
    if (delArtifacts === 0) throw new Error('Failed to delete artifacts');

    const delHist = await historyService.remove(id);
    if (!delHist) throw new Error('Failed to delete history');

    const remainingArtifacts = await Artifact.countDocuments({ execId: id }).exec();
    if (remainingArtifacts > 0) throw new Error('Artifacts were not deleted from DB');

    console.log('Phase 2 Integration Test Passed!');
  } catch (err) {
    console.error('Integration Test Failed:', err.message);
    process.exit(1);
  } finally {
    await Execution.deleteMany({ id }).catch(() => {});
    await ExecutionHistory.deleteMany({ id }).catch(() => {});
    await Artifact.deleteMany({ execId: id }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
  }
})();
