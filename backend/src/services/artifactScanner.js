/** Scans Playwright output directories for generated artifacts. */

const path = require('node:path');
const fs = require('node:fs');
const { nanoid } = require('nanoid');
const config = require('../config');
const { ARTIFACT_TYPES, EXT_TO_ARTIFACT } = require('../utils/constants');
const { listFilesRecursive, copyArtifact, ensureDir, getFileSize, formatFileSize, pathExists } = require('../utils/fileHelper');
const logger = require('../utils/logger');
const Artifact = require('../models/Artifact');

const UPLOAD_DIRS = {
  [ARTIFACT_TYPES.REPORT]: path.join(config.uploadsDir, 'reports'),
  [ARTIFACT_TYPES.SCREENSHOT]: path.join(config.uploadsDir, 'screenshots'),
  [ARTIFACT_TYPES.VIDEO]: path.join(config.uploadsDir, 'videos'),
  [ARTIFACT_TYPES.TRACE]: path.join(config.uploadsDir, 'traces'),
};

/** Classifies a file by its extension. */
function classifyFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return EXT_TO_ARTIFACT[ext] || null;
}

/** Extracts a test name from a file path. */
function extractTestName(filePath) {
  const base = path.basename(filePath, path.extname(filePath));
  return base
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const { ZipArchive } = require('archiver');
const fse = require('fs-extra');

async function zipDirectory(sourceDir, outPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = new ZipArchive({ zlib: { level: 9 } });

    output.on('close', () => resolve(archive.pointer()));
    archive.on('error', (err) => reject(err));

    archive.pipe(output);
    archive.glob('**/*', { cwd: sourceDir, ignore: ['report.zip'] });
    archive.finalize();
  });
}

/** Scans output directories for artifacts and registers them. */
async function scanAndRegister(execId, suite, environment, status) {
  const reportDir = path.join(config.reportDir, execId);
  const outputDir = path.join(config.outputDir, execId);

  logger.info(`[Artifacts] Checking reportDir: ${reportDir}`);
  logger.info(`[Artifacts] Checking outputDir: ${outputDir}`);

  if (await pathExists(reportDir)) {
    try {
      const destDir = reportDir;
      
      const metadataFile = path.join(destDir, 'metadata.json');
      const executionFile = path.join(destDir, 'execution.json');
      await fs.promises.writeFile(metadataFile, JSON.stringify({ execId, suite, environment, status }, null, 2));
      await fs.promises.writeFile(executionFile, JSON.stringify({ execId, generatedAt: new Date().toISOString() }, null, 2));
      
      const os = require('node:os');
      const tempZipPath = path.join(os.tmpdir(), `report-${execId}.zip`);
      const size = await zipDirectory(destDir, tempZipPath);
      
      const zipDestPath = path.join(destDir, 'report.zip');
      await fse.move(tempZipPath, zipDestPath, { overwrite: true });

      if (await pathExists(path.join(destDir, 'index.html'))) {
          await fse.move(path.join(destDir, 'index.html'), path.join(destDir, 'report.html'), { overwrite: true });
      }

      const url = `/uploads/reports/${execId}/report.html`;
      const now = new Date().toISOString();

      await Artifact.create({
        id: `r${nanoid(5)}`,
        execId,
        type: ARTIFACT_TYPES.REPORT,
        test: 'HTML Report',
        url,
        takenAt: now,
        suite,
        environment,
        status,
        generatedAt: now,
        sizeMB: (size / (1024 * 1024)).toFixed(2)
      });
      logger.info(`[Artifacts] Zipped and registered report for ${execId}`);
    } catch (err) {
      logger.warn(`[Artifacts] Failed to process report for ${execId}: ${err.message}`);
    }
  }

  if (await pathExists(outputDir)) {
    const files = await listFilesRecursive(outputDir);
    logger.info(`[Artifacts] Found ${files.length} files in ${outputDir}`);

    for (const filePath of files) {
      const type = classifyFile(filePath);
      if (!type || type === ARTIFACT_TYPES.REPORT) continue;

      try {
        await registerArtifact(filePath, type, execId, suite, environment, status);
      } catch (err) {
        logger.warn(`[Artifacts] Failed to register ${filePath}: ${err.message}`);
      }
    }
  }
}

/** Copies a single artifact file and registers its metadata. */
async function registerArtifact(srcPath, type, execId, suite, environment, status) {
  const destDir = UPLOAD_DIRS[type];
  if (!destDir) return;

  await ensureDir(destDir);

  const ext = path.extname(srcPath);
  const filename = `${execId}_${nanoid(6)}${ext}`;
  const destPath = path.join(destDir, filename);

  await copyArtifact(srcPath, destPath);

  const size = await getFileSize(destPath);
  const url = `/uploads/${type}s/${filename}`;
  const testName = extractTestName(srcPath);
  const now = new Date().toISOString();

  const metadata = {
    id: `${type[0]}${nanoid(5)}`,
    execId,
    type,
    test: testName,
    url,
    takenAt: now,
  };

  switch (type) {
    case ARTIFACT_TYPES.REPORT:
      metadata.suite = suite;
      metadata.environment = environment;
      metadata.status = status;
      metadata.generatedAt = now;
      metadata.sizeMB = (size / (1024 * 1024)).toFixed(2);
      break;
    case ARTIFACT_TYPES.VIDEO:
      metadata.duration = '';
      break;
    case ARTIFACT_TYPES.TRACE:
      metadata.size = formatFileSize(size);
      break;
  }

  await Artifact.create(metadata);

  logger.debug(`[Artifacts] Registered ${type}: ${filename} for ${execId}`);
}

function formatArtifact(doc) {
  const raw = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return raw;
}

/** Lists all registered reports. */
async function listReports() {
  const docs = await Artifact.find({ type: ARTIFACT_TYPES.REPORT }).sort({ takenAt: -1 }).lean().exec();
  return docs.map(formatArtifact);
}

/** Lists all registered screenshots. */
async function listScreenshots() {
  const docs = await Artifact.find({ type: ARTIFACT_TYPES.SCREENSHOT }).sort({ takenAt: -1 }).lean().exec();
  return docs.map(formatArtifact);
}

/** Lists all registered videos. */
async function listVideos() {
  const docs = await Artifact.find({ type: ARTIFACT_TYPES.VIDEO }).sort({ takenAt: -1 }).lean().exec();
  return docs.map(formatArtifact);
}

/** Lists all registered traces. */
async function listTraces() {
  const docs = await Artifact.find({ type: ARTIFACT_TYPES.TRACE }).sort({ takenAt: -1 }).lean().exec();
  return docs.map(formatArtifact);
}

/** Removes an artifact from DB and filesystem. */
async function removeArtifact(artifact) {
  try {
    await Artifact.deleteOne({ id: artifact.id }).exec();
    
    const typeDir = UPLOAD_DIRS[artifact.type];
    if (typeDir && artifact.url) {
      const filename = path.basename(artifact.url);
      const filePath = path.join(typeDir, filename);
      if (await pathExists(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }
  } catch (err) {
    logger.error(`[Artifacts] Failed to remove artifact ${artifact.id}`, err);
  }
}

/** Removes all artifacts associated with an execution ID. */
async function removeByExecId(execId) {
  const artifacts = await Artifact.find({ execId }).lean().exec();
  let count = 0;
  for (const artifact of artifacts) {
    await removeArtifact(artifact);
    count++;
  }
  return count;
}

/** Removes all artifacts associated with multiple execution IDs. */
async function removeByExecIds(execIds) {
  const artifacts = await Artifact.find({ execId: { $in: execIds } }).lean().exec();
  let count = 0;
  for (const artifact of artifacts) {
    await removeArtifact(artifact);
    count++;
  }
  return count;
}

/** Removes all artifacts. */
async function removeAll() {
  const artifacts = await Artifact.find({}).lean().exec();
  let count = 0;
  for (const artifact of artifacts) {
    await removeArtifact(artifact);
    count++;
  }
  return count;
}

module.exports = {
  scanAndRegister,
  listReports,
  listScreenshots,
  listVideos,
  listTraces,
  removeByExecId,
  removeByExecIds,
  removeAll,
};
