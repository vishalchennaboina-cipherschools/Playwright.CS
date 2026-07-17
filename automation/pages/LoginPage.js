/**
 * @fileoverview LoginPage — page object for the CipherSchools login flow.
 *
 * Encapsulates all login-related interactions. Tests call `login(credentials)`
 * and never interact with raw locators or hardcode email/password values.
 *
 * Usage:
 *   const { LoginPage } = require('../../pages/LoginPage');
 *   const loginPage = new LoginPage(page);
 *   await loginPage.login(config.credentials);
 *
 * The credentials object is always sourced from config.credentials which reads
 * from environment variables injected by the backend. No credentials are ever
 * stored in this file.
 */

'use strict';

const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class LoginPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Locators — defined once here, referenced in all methods below.
    // If a selector changes, update it in ONE place only.
    this.signInButton  = page.getByRole('button', { name: 'Sign In' });
    this.emailInput    = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton  = page.getByRole('button', { name: 'Signin' });
  }

  /**
   * Perform a full login sequence.
   *
   * Opens the login popup, fills the credentials, and submits the form.
   * Does NOT assert on the post-login state — that belongs in the test.
   *
   * @param {Object} credentials
   * @param {string} credentials.email    - User email address.
   * @param {string} credentials.password - User password.
   * @returns {Promise<void>}
   */
  async login({ email, password }) {
    await this.signInButton.click();

    // Use pressSequentially() instead of fill() so React's controlled-input
    // onChange handlers fire on every keystroke. fill() sets the DOM value
    // directly and can skip React state updates, leaving the Signin button
    // permanently disabled.
    await this.emailInput.click();
    await this.emailInput.pressSequentially(email, { delay: 30 });

    await this.passwordInput.click();
    await this.passwordInput.pressSequentially(password, { delay: 30 });

    // Wait for the Signin button to become enabled.
    // React re-enables it once both fields pass validation after keystrokes.
    await expect(this.submitButton).toBeEnabled({ timeout: 10000 });
    await this.submitButton.click();
    await expect(this.submitButton).toBeHidden({ timeout: 15000 });
  }

  /**
   * Open the login popup without filling any credentials.
   * Useful for negative tests (e.g. empty-field validation).
   *
   * @returns {Promise<void>}
   */
  async openLoginDialog() {
    await this.signInButton.click();
  }

  /**
   * Assert that the sign-in button is visible (i.e. user is logged out).
   *
   * @param {import('@playwright/test').Expect} expect - Playwright expect function.
   * @returns {Promise<void>}
   */
  async assertLoggedOut(expect) {
    await expect(this.signInButton).toBeVisible();
  }
}

module.exports = { LoginPage };
