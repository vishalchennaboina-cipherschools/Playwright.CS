/** Provides file-system helper utilities. */

const fse = require('fs-extra');
const path = require('node:path');

/** Ensures a directory exists, creating it recursively if needed. */
async function ensureDir(dirPath) {
  await fse.ensureDir(dirPath);
}

/** Copies a file or directory. */
async function copyArtifact(src, dest) {
  await fse.copy(src, dest, { overwrite: true });
}

/** Lists all files in a directory recursively. */
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

/** Gets file size in bytes. */
async function getFileSize(filePath) {
  try {
    const stat = await fse.stat(filePath);
    return stat.size;
  } catch {
    return 0;
  }
}

/** Formats bytes into a human-readable size string. */
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Checks whether a path exists. */
async function pathExists(targetPath) {
  return fse.pathExists(targetPath);
}

/** Removes a file or directory. */
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
