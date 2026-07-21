'use strict';

/**
 * @fileoverview LoginValidator — Enterprise Login Assertions.
 *
 * SOLE RESPONSIBILITY: Playwright expect() assertions for the login flow.
 * NO user actions. NO business logic. NO credential access.
 *
 * Usage:
 *   const validator = new LoginValidator(loginPage, page);
 *   await validator.verifyLoginSuccess();
 */

const { expect } = require('@playwright/test');

class LoginValidator {
  /**
   * @param {import('../pages/LoginPage').LoginPage} loginPage
   * @param {import('@playwright/test').Page} page
   */
  constructor(loginPage, page) {
    this.loginPage = loginPage;
    this.page = page;
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  async verifyLoginSuccess() {
    // Login button disappears when modal closes on successful login
    await expect(this.loginPage.loginButton).toBeHidden({ timeout: 15000 });
  }

  async verifyLoginFailure() {
    await expect(this.loginPage.errorToast).toBeVisible({ timeout: 10000 });
    // Modal must remain open
    await expect(this.loginPage.loginButton).toBeVisible();
  }

  async verifyEmailValidation() {
    await expect(this.loginPage.emailValidation).toBeVisible();
  }

  async verifyPasswordValidation() {
    await expect(this.loginPage.passwordValidation).toBeVisible();
  }

  async verifyLoginButtonDisabled() {
    await expect(this.loginPage.loginButton).toBeDisabled();
  }

  async verifyLogout() {
    await expect(this.loginPage.signInButton).toBeVisible({ timeout: 15000 });
  }

  async verifyDashboard() {
    await expect(this.page).toHaveURL(/.*\/(profile|dashboard).*/, { timeout: 15000 });
  }

  async verifyUserAvatar() {
    const avatar = this.page.locator('.user-avatar, [alt="User Avatar"]');
    await expect(avatar).toBeVisible({ timeout: 15000 });
  }

  async verifyPopupVisible() {
    await expect(this.loginPage.modalHeading).toBeVisible();
  }

  async verifyPopupClosed() {
    await expect(this.loginPage.modalHeading).toBeHidden();
  }

  /**
   * Verify a specific toast message is visible.
   * @param {string} message
   */
  async verifyToast(message) {
    await expect(this.page.getByText(message)).toBeVisible();
  }
}

module.exports = { LoginValidator };
