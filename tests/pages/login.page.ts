import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object Model for Login Page
 * Used for authentication before profile/address tests
 */
export class LoginPage extends BasePage {
  // Login form elements
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly forgotPasswordLink: Locator;
  readonly createAccountLink: Locator;
  
  // Error messages
  readonly loginError: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;

  constructor(page: Page) {
    super(page);
    
    // Login form inputs
    this.emailInput = page.locator(
      'input[type="email"], input[name="email"], input[id*="email"], ' +
      'input[placeholder*="email" i], input[name="username"]'
    ).first();
    
    this.passwordInput = page.locator(
      'input[type="password"], input[name="password"], input[id*="password"]'
    ).first();
    
    this.loginButton = page.locator(
      'button:has-text("Sign In"), button:has-text("Log In"), button:has-text("Login"), ' +
      'input[type="submit"][value*="Sign In" i], input[type="submit"][value*="Log In" i]'
    ).first();
    
    this.rememberMeCheckbox = page.locator(
      'input[type="checkbox"][name*="remember" i], input[type="checkbox"][id*="remember" i], ' +
      'label:has-text("Remember") input[type="checkbox"]'
    ).first();
    
    this.forgotPasswordLink = page.locator(
      'a:has-text("Forgot Password"), a:has-text("Reset Password"), ' +
      'a[href*="forgot"], a[href*="reset"]'
    ).first();
    
    this.createAccountLink = page.locator(
      'a:has-text("Create Account"), a:has-text("Register"), a:has-text("Sign Up")'
    ).first();
    
    // Error messages
    this.loginError = page.locator(
      '.login-error, .alert-error, .alert-danger, ' +
      '[role="alert"]:has-text("invalid"), [role="alert"]:has-text("incorrect")'
    ).first();
    
    this.emailError = page.locator(
      '[data-error="email"], .email-error, #email-error'
    ).first();
    
    this.passwordError = page.locator(
      '[data-error="password"], .password-error, #password-error'
    ).first();
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin() {
    await this.goto('/');
    await this.acceptCookiesIfPresent();
    await this.closeModalIfPresent();
    
    // Click sign in link
    const signInLink = this.page.locator('a:has-text("Sign In"), a:has-text("Sign in")').first();
    if (await signInLink.isVisible()) {
      await signInLink.click();
      await this.waitForPageLoad();
    }
  }

  /**
   * Login with credentials
   */
  async login(email: string, password: string) {
    await this.navigateToLogin();
    await this.fillInput(this.emailInput, email);
    await this.fillInput(this.passwordInput, password);
    await this.loginButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Verify successful login
   */
  async verifyLoginSuccess() {
    // Check for indicators of successful login
    const loggedInIndicators = [
      this.page.locator('text=/my account|account settings|sign out|log out/i'),
      this.page.locator('[data-testid="user-menu"], .user-menu, .account-dropdown'),
    ];
    
    let loginSuccessful = false;
    for (const indicator of loggedInIndicators) {
      if (await indicator.isVisible({ timeout: 5000 }).catch(() => false)) {
        loginSuccessful = true;
        break;
      }
    }
    
    // Also check URL
    const currentUrl = await this.getCurrentUrl();
    if (currentUrl.includes('account') || currentUrl.includes('dashboard')) {
      loginSuccessful = true;
    }
    
    expect(loginSuccessful).toBeTruthy();
  }

  /**
   * Verify login error is displayed
   */
  async verifyLoginError() {
    await expect(this.loginError).toBeVisible({ timeout: 5000 });
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    const signOutLink = this.page.locator('a:has-text("Sign Out"), a:has-text("Log Out"), button:has-text("Sign Out")').first();
    return signOutLink.isVisible({ timeout: 3000 }).catch(() => false);
  }

  /**
   * Logout if currently logged in
   */
  async logout() {
    const signOutLink = this.page.locator('a:has-text("Sign Out"), a:has-text("Log Out"), button:has-text("Sign Out")').first();
    
    if (await signOutLink.isVisible({ timeout: 3000 })) {
      await signOutLink.click();
      await this.waitForPageLoad();
    }
  }
}
