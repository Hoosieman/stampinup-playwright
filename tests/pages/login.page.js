const { expect } = require('@playwright/test');
const { BasePage } = require('./base.page');

/**
 * Page Object Model for Login Page
 * 
 * Login flow:
 * 1. Click "Sign in" button (data-testid: menu-user-btn-signin)
 * 2. Modal appears with email/password fields
 * 3. Fill credentials and submit
 * 4. On success: "Hello, [Name]" button appears in header
 */
class LoginPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page 
   */
  constructor(page) {
    super(page);
    
    // Sign in button in header
    this.signInButton = page.getByTestId('menu-user-btn-signin');
    
    // Login form inputs (in modal) - from Playwright codegen
    this.emailInput = page.getByTestId('auth-email');
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByTestId('auth-submit');
    
    // Hello button appears after successful login
    this.helloButton = page.getByRole('button', { name: /Hello\s*,/i });
    
    // Error messages
    this.loginError = page.locator('[role="alert"]').first();
  }

  /**
   * Navigate to login modal
   */
  async navigateToLogin() {
    await this.goto('/');
    await this.acceptCookiesIfPresent();
    
    // Click sign in button in header
    await this.signInButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.signInButton.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Login with credentials
   * @param {string} email 
   * @param {string} password 
   */
  async login(email, password) {
    await this.navigateToLogin();
    
    // Fill email
    await this.emailInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.emailInput.fill(email);
    
    // Fill password
    await this.passwordInput.fill(password);
    
    // Click submit
    await this.loginButton.click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Verify successful login - "Hello, [Name]" is visible
   */
  async verifyLoginSuccess() {
    await expect(this.helloButton).toBeVisible({ timeout: 10000 });
  }

  /**
   * Check if user is logged in
   * @returns {Promise<boolean>}
   */
  async isLoggedIn() {
    return this.helloButton.isVisible({ timeout: 3000 }).catch(() => false);
  }
}

module.exports = { LoginPage };
