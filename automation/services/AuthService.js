'use strict';

/**
 * @fileoverview AuthService — Authentication Business Logic.
 *
 * The single authoritative authentication service for the CipherSchools QA Platform.
 * Every test suite must authenticate only through this service.
 *
 * Dependencies (all from the shared global helpers/ layer):
 *   LoginPage       → pages/LoginPage.js   (UI actions)
 *   userManager     → helpers/userManager   (credential resolution)
 *   sessionManager  → helpers/sessionManager (session state)
 *   logger          → utils/logger          (structured logging)
 *
 * NOT responsible for:
 *   UI Locators     → LoginPage
 *   Assertions      → LoginValidator
 *   Credential data → config/applications/
 */

const { LoginPage }   = require('../pages/LoginPage');
const userManager     = require('../helpers/userManager');
const sessionManager  = require('../helpers/sessionManager');
const logger          = require('../utils/logger');

class AuthService {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page      = page;
    this.loginPage = new LoginPage(page);
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /**
   * Login with an explicit email and password.
   * Prefer the named methods (loginStudent, loginMentor, loginRuntime) over this.
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    const start = Date.now();
    logger.info('Login started', { category: 'AUTH' });

    await this.loginPage.openLoginPopup();
    logger.debug('Popup opened', { category: 'AUTH' });

    await this.loginPage.fillEmail(email);
    logger.debug('Email entered', { category: 'AUTH' });

    // Password value is intentionally never logged — security requirement.
    await this.loginPage.fillPassword(password);
    logger.debug('Password entered', { category: 'AUTH' });

    await this.loginPage.clickLogin();
    logger.debug('Login button clicked', { category: 'AUTH' });

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    logger.info(`Login action completed in ${duration}s`, { category: 'AUTH' });
  }

  /**
   * Login as a student account.
   * @param {string} [id='student-valid']
   */
  async loginStudent(id = 'student-valid') {
    logger.info(`Logging in as student [${id}]`, { category: 'AUTH' });
    const user = userManager.getStudent(id);
    await this.login(user.email, user.password);
  }

  /**
   * Login as a mentor account.
   * @param {string} [id='mentor-valid']
   */
  async loginMentor(id = 'mentor-valid') {
    logger.info(`Logging in as mentor [${id}]`, { category: 'AUTH' });
    const user = userManager.getMentor(id);
    await this.login(user.email, user.password);
  }

  /**
   * Login with runtime credentials set via TEST_EMAIL and TEST_PASSWORD env vars.
   */
  async loginRuntime() {
    const email    = process.env.TEST_EMAIL;
    const password = process.env.TEST_PASSWORD;
    if (!email || !password) {
      throw new Error('[AuthService] Runtime credentials not set. Define TEST_EMAIL and TEST_PASSWORD.');
    }
    logger.info('Logging in with runtime credentials', { category: 'AUTH' });
    await this.login(email, password);
  }

  /**
   * Logout via the UI Logout button and clear the local session.
   */
  async logout() {
    logger.info('Logout started', { category: 'AUTH' });
    await this.page.locator('li').filter({ hasText: 'Logout' }).click();
    await this.clearSession();
    logger.info('Logout completed', { category: 'AUTH' });
  }

  /**
   * Save the current context's storage state to disk for reuse in future tests.
   */
  async saveSession() {
    await sessionManager.saveSession(this.page);
    logger.info('Session saved', { category: 'AUTH' });
  }

  /**
   * Check whether the current page has an active authenticated session.
   * @returns {Promise<boolean>}
   */
  async validateSession() {
    const valid = await sessionManager.validateSession(this.page);
    logger.debug(`Session valid: ${valid}`, { category: 'AUTH' });
    return valid;
  }

  /**
   * Clear all cookies, localStorage, sessionStorage, and the storage state file.
   */
  async clearSession() {
    await sessionManager.clearSession(this.page);
    logger.info('Session cleared', { category: 'AUTH' });
  }

  /**
   * Log that a session was restored from a storage state file.
   * Actual restoration is done by Playwright natively via playwright.config.js.
   */
  async restoreSession() {
    logger.info('Session restored from storage state', { category: 'AUTH' });
  }
}

module.exports = { AuthService };
