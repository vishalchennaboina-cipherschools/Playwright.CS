'use strict';

/**
 * @fileoverview sessionManager — Browser session and storage state helper.
 *
 * Handles saving, restoring, validating, and clearing Playwright storageState.
 * Used by AuthService to manage authentication sessions across tests.
 */

const fs   = require('node:fs');
const path = require('node:path');

class SessionManager {
  constructor() {
    // Path to the storage state file used by auth.setup.js and all authenticated tests.
    this.storageStatePath = path.resolve(__dirname, '../playwright/.auth/user.json');
  }

  /**
   * Save the current browser context state (cookies, localStorage) to disk.
   * Call this after a successful login to persist the session.
   * @param {import('@playwright/test').Page} page
   */
  async saveSession(page) {
    const authDir = path.dirname(this.storageStatePath);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }
    await page.context().storageState({ path: this.storageStatePath });
  }

  /**
   * Clear cookies, localStorage, and sessionStorage on the current page,
   * then delete the storage state file so future contexts start fresh.
   * @param {import('@playwright/test').Page} page
   */
  async clearSession(page) {
    await page.context().clearCookies();
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
    this._deleteStorageStateFile();
  }

  /**
   * Check whether a valid (non-empty, <24 h old) storage state file exists on disk.
   * @returns {boolean}
   */
  hasValidStorageState() {
    try {
      if (fs.existsSync(this.storageStatePath)) {
        const stats = fs.statSync(this.storageStatePath);
        return stats.size > 0 && (Date.now() - stats.mtimeMs) < 24 * 60 * 60 * 1000;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Verify that the current page has an active authenticated session by
   * checking for auth-related cookies or localStorage tokens.
   * @param {import('@playwright/test').Page} page
   * @returns {Promise<boolean>}
   */
  async validateSession(page) {
    try {
      const cookies = await page.context().cookies();
      const hasAuthCookie = cookies.some(c => c.name.includes('token') || c.name.includes('session'));

      const hasLocalStorageToken = await page.evaluate(() =>
        Object.keys(window.localStorage).some(k => k.toLowerCase().includes('token'))
      );

      return hasAuthCookie || hasLocalStorageToken;
    } catch {
      return false;
    }
  }

  // ─── Private ─────────────────────────────────────────────────────────────

  _deleteStorageStateFile() {
    try {
      if (fs.existsSync(this.storageStatePath)) {
        fs.unlinkSync(this.storageStatePath);
      }
    } catch (e) {
      console.warn('[SessionManager] Could not delete storage state file:', e.message);
    }
  }
}

module.exports = new SessionManager();
