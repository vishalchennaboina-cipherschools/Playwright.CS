/** Recursively scans Playwright tests directory for spec files. */

const path = require('node:path');
const config = require('../config');
const { listFilesRecursive, pathExists } = require('../utils/fileHelper');
const logger = require('../utils/logger');

/** Scans the Playwright tests directory and returns a structured spec tree. */
async function discoverSpecs() {
  const testsDir = path.join(config.playwrightProjectPath, 'tests');

  const exists = await pathExists(testsDir);
  if (!exists) {
    logger.warn(`[SpecDiscovery] Tests directory not found: ${testsDir}`);
    return { folders: [], totalFiles: 0 };
  }

  const allFiles = await listFilesRecursive(testsDir);

  const specFiles = allFiles.filter((f) => /\.spec\.(js|ts|mjs)$/i.test(f));

  logger.info(`[SpecDiscovery] Found ${specFiles.length} spec files in ${testsDir}`);

  const folderMap = new Map();

  for (const absPath of specFiles) {
    const rel = path.relative(testsDir, absPath).replace(/\\/g, '/');
    const parts = rel.split('/');

    let folderName;
    let folderPath;

    if (parts.length === 1) {
      folderName = 'root';
      folderPath = 'tests';
    } else {
      folderName = parts[0];
      folderPath = `tests/${parts[0]}`;
    }

    if (!folderMap.has(folderName)) {
      folderMap.set(folderName, {
        name: folderName,
        path: folderPath,
        files: [],
      });
    }

    folderMap.get(folderName).files.push({
      name: path.basename(absPath),
      relativePath: `tests/${rel}`,
    });
  }

  const folders = Array.from(folderMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  for (const folder of folders) {
    folder.files.sort((a, b) => a.name.localeCompare(b.name));
  }

  const totalFiles = specFiles.length;

  logger.debug(`[SpecDiscovery] ${folders.length} folders, ${totalFiles} total spec files`);

  return { folders, totalFiles };
}

module.exports = { discoverSpecs };
