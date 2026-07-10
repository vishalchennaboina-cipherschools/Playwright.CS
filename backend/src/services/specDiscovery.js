/**
 * @fileoverview Dynamic spec file discovery service.
 *
 * Recursively scans the Playwright framework's tests/ directory
 * for *.spec.js files and returns a tree structure that the
 * frontend uses to populate the Test Folder and Spec File dropdowns.
 *
 * No hardcoded suite lists — specs are discovered at runtime.
 *
 * @module services/specDiscovery
 */

const path = require('node:path');
const config = require('../config');
const { listFilesRecursive, pathExists } = require('../utils/fileHelper');
const logger = require('../utils/logger');

/**
 * Scan the Playwright framework's tests/ directory and return
 * a structured spec tree.
 *
 * @returns {Promise<{ folders: Array<{ name: string, path: string, files: Array<{ name: string, relativePath: string }> }>, totalFiles: number }>}
 */
async function discoverSpecs() {
  const testsDir = path.join(config.playwrightProjectPath, 'tests');

  const exists = await pathExists(testsDir);
  if (!exists) {
    logger.warn(`[SpecDiscovery] Tests directory not found: ${testsDir}`);
    return { folders: [], totalFiles: 0 };
  }

  const allFiles = await listFilesRecursive(testsDir);

  // Filter to *.spec.js files only
  const specFiles = allFiles.filter((f) => /\.spec\.(js|ts|mjs)$/i.test(f));

  logger.info(`[SpecDiscovery] Found ${specFiles.length} spec files in ${testsDir}`);

  // Group by immediate parent folder relative to tests/
  const folderMap = new Map();

  for (const absPath of specFiles) {
    const rel = path.relative(testsDir, absPath).replace(/\\/g, '/');
    const parts = rel.split('/');

    let folderName;
    let folderPath;

    if (parts.length === 1) {
      // File is directly in tests/ (no subfolder)
      folderName = 'root';
      folderPath = 'tests';
    } else {
      // File is in tests/<subfolder>/...
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

  // Sort folders and files alphabetically
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
