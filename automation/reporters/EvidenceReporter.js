const path = require('node:path');
const fs = require('node:fs');
const AdmZip = require('adm-zip');
const evidenceConfig = require('../config/evidence.config');

class EvidenceReporter {
  constructor(options) {
    this.options = options || {};
    this.execId = process.env.EXEC_ID || `EXEC-LOCAL-${Date.now()}`;
    
    // Determine storage paths
    this.storageRoot = path.resolve(__dirname, '../../../backend/storage/executions', this.execId);
      
    this.dirs = {
      root: this.storageRoot,
      screenshots: path.join(this.storageRoot, 'screenshots'),
      videos: path.join(this.storageRoot, 'videos'),
      traces: path.join(this.storageRoot, 'traces'),
      logs: path.join(this.storageRoot, 'logs')
    };

    // Ensure dirs exist
    Object.values(this.dirs).forEach(d => fs.mkdirSync(d, { recursive: true }));
    
    this.summary = {
      executionId: this.execId,
      environment: 'unknown',
      browser: 'unknown',
      startedAt: new Date().toISOString(),
      completedAt: null,
      duration: 0,
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    };
    
    this.metadataRecords = [];
  }

  onBegin(config, suite) {
    this.summary.totalTests = suite.allTests().length;
  }

  onTestEnd(test, result) {
    // Collect status
    const status = result.status === 'passed' ? 'PASSED' : 
                   result.status === 'failed' || result.status === 'timedOut' ? 'FAILED' : 'SKIPPED';
                   
    const browser = test.parent?.project()?.name || 'unknown';
    if (this.summary.browser === 'unknown') this.summary.browser = browser;

    if (status === 'PASSED') this.summary.passed++;
    if (status === 'FAILED') this.summary.failed++;
    if (status === 'SKIPPED') this.summary.skipped++;

    const safeTestName = test.title.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
    const duration = result.duration;

    const evidence = {
      executionId: this.execId,
      testName: test.title,
      status,
      browser,
      environment: process.env.TEST_ENV || 'unknown',
      duration,
      screenshot: null,
      log: `/storage/executions/${this.execId}/logs/${safeTestName}.log`,
      trace: null,
      video: null,
      network: null,
      console: null
    };

    // 1. Process Attachments
    let tracePath = null;
    for (const attachment of result.attachments) {
      if (!attachment.path || !fs.existsSync(attachment.path)) continue;
      
      const ext = path.extname(attachment.path);
      const newFileName = `${safeTestName}-${Date.now()}${ext}`;
      
      if (attachment.name === 'screenshot' || attachment.contentType.startsWith('image/')) {
        const dest = path.join(this.dirs.screenshots, newFileName);
        fs.copyFileSync(attachment.path, dest);
        evidence.screenshot = `/storage/executions/${this.execId}/screenshots/${newFileName}`;
      }
      else if (attachment.name === 'video' || attachment.contentType.startsWith('video/')) {
        const dest = path.join(this.dirs.videos, newFileName);
        fs.copyFileSync(attachment.path, dest);
        evidence.video = `/storage/executions/${this.execId}/videos/${newFileName}`;
      }
      else if (attachment.name === 'trace') {
        const dest = path.join(this.dirs.traces, newFileName);
        fs.copyFileSync(attachment.path, dest);
        evidence.trace = `/storage/executions/${this.execId}/traces/${newFileName}`;
        tracePath = attachment.path;
      }
    }

    // 2. Extract Console and Network from Trace
    if (tracePath && (evidenceConfig.captureConsole || evidenceConfig.captureNetwork)) {
      try {
        const zip = new AdmZip(tracePath);
        const traceEntry = zip.getEntry('trace.trace');
        if (traceEntry) {
          const content = zip.readAsText(traceEntry);
          const lines = content.split('\n').filter(l => l.trim());
          
          const consoleLogs = [];
          const networkFailures = [];

          for (const line of lines) {
             try {
               const parsed = JSON.parse(line);
               if (evidenceConfig.captureConsole && parsed.type === 'console') {
                  consoleLogs.push({ type: parsed.class, text: parsed.text });
               }
               if (evidenceConfig.captureNetwork && parsed.type === 'resource-snapshot') {
                  if (parsed.snapshot?.response?.status >= 400) {
                     networkFailures.push({
                        url: parsed.snapshot.request.url,
                        status: parsed.snapshot.response.status,
                        method: parsed.snapshot.request.method,
                        duration: 0
                     });
                  }
               }
             } catch (e) {}
          }
          
          if (consoleLogs.length > 0) {
             const consolePath = path.join(this.dirs.logs, `${safeTestName}-console.json`);
             fs.writeFileSync(consolePath, JSON.stringify(consoleLogs, null, 2));
             evidence.console = `/storage/executions/${this.execId}/logs/${safeTestName}-console.json`;
          }
          if (networkFailures.length > 0) {
             const netPath = path.join(this.dirs.logs, `${safeTestName}-network.json`);
             fs.writeFileSync(netPath, JSON.stringify(networkFailures, null, 2));
             evidence.network = `/storage/executions/${this.execId}/logs/${safeTestName}-network.json`;
          }
        }
      } catch (err) {
        console.error(`Failed to extract trace for ${test.title}:`, err);
      }
    }

    // 3. Generate Human-Readable Log
    const logLines = [];
    logLines.push(`[${new Date().toISOString()}] Execution Started`);
    logLines.push(`Environment: ${evidence.environment}`);
    logLines.push(`Browser: ${browser}`);
    logLines.push('---');
    
    result.steps.forEach(step => {
      if (step.category === 'test.step' || step.category === 'hook') {
        const stepStatus = step.error ? 'FAILED' : 'Success';
        logLines.push(`${step.title} -> \u2713 ${stepStatus}`);
      }
    });
    
    logLines.push('---');
    logLines.push('Execution Completed');
    logLines.push(`Status: ${status}`);
    logLines.push(`Duration: ${(duration / 1000).toFixed(2)} sec`);
    
    if (result.error) {
       logLines.push('');
       logLines.push('Execution Failed');
       logLines.push(`Reason: ${result.error.message || 'Unknown'}`);
       if (result.error.stack) {
         logLines.push(`Stack Trace:\n${result.error.stack}`);
       }
    }

    const logPath = path.join(this.dirs.logs, `${safeTestName}.log`);
    fs.writeFileSync(logPath, logLines.join('\n'));

    this.metadataRecords.push(evidence);
  }

  onEnd(result) {
    this.summary.completedAt = new Date().toISOString();
    this.summary.duration = result.duration || 
       (new Date(this.summary.completedAt).getTime() - new Date(this.summary.startedAt).getTime());

    fs.writeFileSync(path.join(this.dirs.root, 'summary.json'), JSON.stringify(this.summary, null, 2));
    fs.writeFileSync(path.join(this.dirs.root, 'evidence-metadata.json'), JSON.stringify(this.metadataRecords, null, 2));
  }
}

module.exports = EvidenceReporter;
