/**
 * @fileoverview File-system helper utilities.
 *
 * Wraps common fs-extra operations with error handling and path resolution.
 * Used by the artifact scanner, runner, and history service.
 *
 * @module utils/fileHelper
 */

const fse = require('fs-extra');
const path = require('node:path');

/**
 * Ensure a directory exists, creating it recursively if needed.
 *
 * @param {string} dirPath - Absolute or relative directory path.
 * @returns {Promise<void>}
 */
async function ensureDir(dirPath) {
  await fse.ensureDir(dirPath);
}

/**
 * Copy a file or directory to a destination.
 *
 * @param {string} src  - Source path.
 * @param {string} dest - Destination path.
 * @returns {Promise<void>}
 */
async function copyArtifact(src, dest) {
  await fse.copy(src, dest, { overwrite: true });
}

/**
 * List all files in a directory recursively.
 *
 * @param {string}   dirPath    - Root directory to scan.
 * @param {string[]} [extensions] - Optional filter by file extensions (e.g. ['.png', '.jpg']).
 * @returns {Promise<string[]>} Array of absolute file paths.
 */
async function listFilesRecursive(dirPath, extensions = []) {
  const exists = await fse.pathExists(dirPath);
  if (!exists) return [];

  const results = [];

  async function walk(dir) {
    const entries = await fse.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        if (extensions.length === 0 || extensions.includes(path.extname(entry.name).toLowerCase())) {
          results.push(fullPath);
        }
      }
    }
  }

  await walk(dirPath);
  return results;
}

/**
 * Get file size in bytes.
 *
 * @param {string} filePath - Absolute path to the file.
 * @returns {Promise<number>} Size in bytes, or 0 if file does not exist.
 */
async function getFileSize(filePath) {
  try {
    const stat = await fse.stat(filePath);
    return stat.size;
  } catch {
    return 0;
  }
}

/**
 * Format bytes into a human-readable size string.
 *
 * @param {number} bytes - Size in bytes.
 * @returns {string} e.g. "3.2 MB", "512 KB".
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Check whether a path exists.
 *
 * @param {string} targetPath - Path to check.
 * @returns {Promise<boolean>}
 */
async function pathExists(targetPath) {
  return fse.pathExists(targetPath);
}

/**
 * Remove a file or directory.
 *
 * @param {string} targetPath - Path to remove.
 * @returns {Promise<void>}
 */
async function remove(targetPath) {
  await fse.remove(targetPath);
}

module.exports = {
  ensureDir,
  copyArtifact,
  listFilesRecursive,
  getFileSize,
  formatFileSize,
  pathExists,
  remove,
};
