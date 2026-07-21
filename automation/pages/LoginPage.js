'use strict';

/**
 * @fileoverview LoginPage — Enterprise Login Page Object for CipherSchools QA Platform.
 *
 * SOLE RESPONSIBILITIES: UI Locators and User Actions.
 * NO Assertions, NO Business Logic, NO Session Logic, NO Evidence Logic.
 *
 * This page object is the single authoritative implementation.
 * All previous implementations (automation/pages/LoginPage.js) are superseded by this file.
 *
 * Usage:
 *   const { LoginPage } = require('../pages/LoginPage');
 *   const loginPage = new LoginPage(page);
 *   await loginPage.login({ email, password });
 */

const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class LoginPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // ─── Landing Page ──────────────────────────────────────────────────────
    this.signInButton = page.getByRole('button', { name: 'Sign In' })
      .or(page.getByAltText('Signin/Register'))
      .or(page.getByText('Signin', { exact: true }))
      .first();

    // ─── Login Modal ───────────────────────────────────────────────────────
    this.modalHeading  = page.getByText(/Hey,? learner/i);
    this.modalSubtitle = page.getByText(/Fill your login credential/i);

    // ─── Form Fields ───────────────────────────────────────────────────────
    this.emailInput    = page.getByRole('dialog').locator('input').nth(0);
    this.passwordInput = page.getByRole('dialog').locator('input').nth(1);

    // ─── Buttons ───────────────────────────────────────────────────────────
    this.loginButton       = page.getByRole('dialog').getByRole('button', { name: 'Signin' });
    this.googleLoginButton = page.getByRole('dialog').getByText('Login with Google');
    this.joinInviteButton  = page.getByRole('dialog').getByText('Join with Invite Code');
    
    // ─── Links / Navigation ────────────────────────────────────────────────
    this.getStartedLink    = page.getByRole('dialog').getByText('Get Started');

    // ─── Modal Controls ────────────────────────────────────────────────────
    this.forgotPasswordLink = page.getByRole('dialog').getByText('Forgot Password ?');
    this.closeModalButton   = page.getByRole('dialog').locator('button').first();
    this.eyeIcon            = page.getByRole('dialog').locator('svg.iconify--mdi').first();

    // ─── Feedback: Toasts ──────────────────────────────────────────────────
    this.successToast = page.getByText('Login successful').first();
    this.errorToast   = page.getByText(/Invalid email or password|User not exist/i).first();

    // ─── Feedback: Inline Validation ───────────────────────────────────────
    this.emailValidation    = page.getByText('Please enter valid email');
    this.passwordValidation = page.locator('.password-validation-error, [id*="password-error"]');
  }

  // ─── Actions ─────────────────────────────────────────────────────────────

  /**
   * Open the login popup by clicking the Sign In button.
   * Uses a retry block to handle React hydration delays where early clicks are swallowed.
   */
  async openLoginPopup() {
    await expect(async () => {
      await this.signInButton.click({ force: true });
      await expect(this.modalHeading).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 15000 });
  }

  /**
   * Wait for the login modal to become visible.
   */
  async waitForLoginPopup() {
    await this.modalHeading.waitFor({ state: 'visible' });
  }

  /**
   * Perform the full login sequence.
   * Uses pressSequentially() so React's controlled-input onChange handlers fire on every keystroke.
   * Waits for the Signin button to become enabled after both fields pass validation.
   *
   * @param {Object} credentials
   * @param {string} credentials.email
   * @param {string} credentials.password
   */
  async login({ email, password }) {
    await this.openLoginPopup();

    await this.emailInput.click();
    await this.emailInput.pressSequentially(email, { delay: 30 });

    await this.passwordInput.click();
    await this.passwordInput.pressSequentially(password, { delay: 30 });

    // React re-enables the button once both fields pass validation.
    await expect(this.loginButton).toBeEnabled({ timeout: 10000 });
    await this.loginButton.click();
    await expect(this.loginButton).toBeHidden({ timeout: 15000 });
  }

  /**
   * Fill only the email field.
   * @param {string} email
   */
  async fillEmail(email) {
    await this.emailInput.click();
    await this.emailInput.fill(email);
  }

  /**
   * Clear the email field.
   */
  async clearEmail() {
    await this.emailInput.fill('');
  }

  /**
   * Get the current value of the email field.
   * @returns {Promise<string>}
   */
  async getEmail() {
    return await this.emailInput.inputValue();
  }

  /**
   * Fill only the password field.
   * @param {string} password
   */
  async fillPassword(password) {
    await this.passwordInput.click();
    await this.passwordInput.fill(password);
  }

  /**
   * Clear the password field.
   */
  async clearPassword() {
    await this.passwordInput.fill('');
  }

  /**
   * Get the current value of the password field.
   * @returns {Promise<string>}
   */
  async getPassword() {
    return await this.passwordInput.inputValue();
  }

  /**
   * Click the login button without waiting for modal to close.
   * Use this for negative tests where the modal is expected to remain.
   */
  async clickLogin() {
    await this.loginButton.click({ force: true });
  }

  /**
   * Toggle the password visibility eye icon.
   */
  async togglePasswordVisibility() {
    await this.eyeIcon.click();
  }

  /**
   * Click the Forgot Password link.
   */
  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  /**
   * Click the Google Login button.
   */
  async clickGoogleLogin() {
    await this.googleLoginButton.click();
  }

  /**
   * Click the Join with Invite Code button.
   */
  async clickInviteCode() {
    await this.joinInviteButton.click();
  }

  /**
   * Click the Get Started / Register button.
   */
  async clickGetStarted() {
    await this.getStartedLink.click();
  }

  /**
   * Open the login dialog without filling credentials.
   * Useful for negative tests (empty-field validation).
   */
  async openLoginDialog() {
    await this.signInButton.click();
  }

  /**
   * Close the login modal popup.
   */
  async closeLoginPopup() {
    await expect(async () => {
      await this.closeModalButton.click();
      await expect(this.modalHeading).toBeHidden({ timeout: 2000 });
    }).toPass({ timeout: 15000 });
  }

  /**
   * Assert that the sign-in button is visible (i.e. user is logged out).
   * @param {import('@playwright/test').Expect} expect - Playwright expect function.
   */
  async assertLoggedOut(expect) {
    await expect(this.signInButton).toBeVisible();
  }
}

module.exports = { LoginPage };
