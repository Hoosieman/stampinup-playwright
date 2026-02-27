import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object Model for Account Registration/Signup Page
 * Covers: TC-ACC-001 through TC-ACC-008
 */
export class SignupPage extends BasePage {
  // Registration form locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly phoneInput: Locator;
  readonly termsCheckbox: Locator;
  readonly newsletterCheckbox: Locator;
  readonly createAccountButton: Locator;
  readonly signInLink: Locator;
  
  // Error message locators
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly confirmPasswordError: Locator;
  readonly firstNameError: Locator;
  readonly lastNameError: Locator;
  readonly generalError: Locator;
  
  // Password strength indicator
  readonly passwordStrengthIndicator: Locator;
  
  // Success elements
  readonly successMessage: Locator;
  readonly welcomeMessage: Locator;

  constructor(page: Page) {
    super(page);
    
    // Form inputs - using multiple selector strategies for robustness
    this.emailInput = page.locator(
      'input[type="email"], input[name="email"], input[id*="email"], input[placeholder*="email" i]'
    ).first();
    
    this.passwordInput = page.locator(
      'input[type="password"][name*="password"]:not([name*="confirm"]), ' +
      'input[id*="password"]:not([id*="confirm"]), ' +
      'input[placeholder*="password" i]:not([placeholder*="confirm" i])'
    ).first();
    
    this.confirmPasswordInput = page.locator(
      'input[name*="confirm"], input[id*="confirm"], input[placeholder*="confirm" i]'
    ).first();
    
    this.firstNameInput = page.locator(
      'input[name*="firstName" i], input[name*="first_name" i], ' +
      'input[id*="firstName" i], input[placeholder*="first name" i]'
    ).first();
    
    this.lastNameInput = page.locator(
      'input[name*="lastName" i], input[name*="last_name" i], ' +
      'input[id*="lastName" i], input[placeholder*="last name" i]'
    ).first();
    
    this.phoneInput = page.locator(
      'input[type="tel"], input[name*="phone" i], input[id*="phone" i]'
    ).first();
    
    this.termsCheckbox = page.locator(
      'input[type="checkbox"][name*="terms" i], input[type="checkbox"][id*="terms" i], ' +
      'input[type="checkbox"][name*="agree" i], label:has-text("terms") input[type="checkbox"]'
    ).first();
    
    this.newsletterCheckbox = page.locator(
      'input[type="checkbox"][name*="newsletter" i], input[type="checkbox"][id*="newsletter" i], ' +
      'label:has-text("newsletter") input[type="checkbox"]'
    ).first();
    
    this.createAccountButton = page.locator(
      'button:has-text("Create Account"), button:has-text("Register"), ' +
      'button:has-text("Sign Up"), input[type="submit"][value*="Create" i], ' +
      'button[type="submit"]:has-text("Account")'
    ).first();
    
    // Error locators
    this.emailError = page.locator(
      '[data-error="email"], .email-error, #email-error, ' +
      '[aria-describedby*="email"] + .error, .field-error:near(input[type="email"])'
    ).first();
    
    this.passwordError = page.locator(
      '[data-error="password"], .password-error, #password-error, ' +
      '.field-error:near(input[type="password"])'
    ).first();
    
    this.confirmPasswordError = page.locator(
      '[data-error="confirmPassword"], .confirm-password-error, ' +
      '.field-error:near(input[name*="confirm"])'
    ).first();
    
    this.firstNameError = page.locator(
      '[data-error="firstName"], .firstName-error, ' +
      '.field-error:near(input[name*="firstName" i])'
    ).first();
    
    this.lastNameError = page.locator(
      '[data-error="lastName"], .lastName-error, ' +
      '.field-error:near(input[name*="lastName" i])'
    ).first();
    
    this.generalError = page.locator(
      '.alert-error, .alert-danger, .error-message, [role="alert"]'
    ).first();
    
    // Password strength
    this.passwordStrengthIndicator = page.locator(
      '.password-strength, .strength-indicator, [data-password-strength]'
    ).first();
    
    // Success elements
    this.successMessage = page.locator(
      '.success-message, .alert-success, [role="alert"]:has-text("success")'
    ).first();
    
    this.welcomeMessage = page.locator(
      'h1:has-text("Welcome"), .welcome-message, [data-testid="welcome"]'
    ).first();
  }

  /**
   * Navigate to registration page
   */
  async navigateToSignup() {
    await this.goto('/');
    await this.acceptCookiesIfPresent();
    await this.closeModalIfPresent();
    
    // Try to find and click the sign-in link first
    const signInLink = this.page.locator('a:has-text("Sign In"), a:has-text("Sign in")').first();
    if (await signInLink.isVisible()) {
      await signInLink.click();
      await this.waitForPageLoad();
    }
    
    // Then look for create account/register link
    const createAccountLink = this.page.locator(
      'a:has-text("Create Account"), a:has-text("Register"), ' +
      'a:has-text("Sign Up"), button:has-text("Create Account")'
    ).first();
    
    if (await createAccountLink.isVisible({ timeout: 5000 })) {
      await createAccountLink.click();
      await this.waitForPageLoad();
    }
  }

  /**
   * Fill the registration form with provided data
   */
  async fillRegistrationForm(userData: {
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    acceptTerms?: boolean;
    subscribeNewsletter?: boolean;
  }) {
    if (userData.email !== undefined) {
      await this.fillInput(this.emailInput, userData.email);
    }
    
    if (userData.password !== undefined) {
      await this.fillInput(this.passwordInput, userData.password);
    }
    
    if (userData.confirmPassword !== undefined) {
      await this.fillInput(this.confirmPasswordInput, userData.confirmPassword);
    }
    
    if (userData.firstName !== undefined) {
      await this.fillInput(this.firstNameInput, userData.firstName);
    }
    
    if (userData.lastName !== undefined) {
      await this.fillInput(this.lastNameInput, userData.lastName);
    }
    
    if (userData.phone !== undefined && await this.phoneInput.isVisible()) {
      await this.fillInput(this.phoneInput, userData.phone);
    }
    
    if (userData.acceptTerms === true) {
      await this.checkTermsCheckbox();
    }
    
    if (userData.subscribeNewsletter === true && await this.newsletterCheckbox.isVisible()) {
      await this.newsletterCheckbox.check();
    }
  }

  /**
   * Check terms and conditions checkbox
   */
  async checkTermsCheckbox() {
    if (await this.termsCheckbox.isVisible()) {
      const isChecked = await this.termsCheckbox.isChecked();
      if (!isChecked) {
        await this.termsCheckbox.check();
      }
    }
  }

  /**
   * Uncheck terms and conditions checkbox
   */
  async uncheckTermsCheckbox() {
    if (await this.termsCheckbox.isVisible()) {
      const isChecked = await this.termsCheckbox.isChecked();
      if (isChecked) {
        await this.termsCheckbox.uncheck();
      }
    }
  }

  /**
   * Submit the registration form
   */
  async submitRegistration() {
    await this.createAccountButton.click();
    await this.page.waitForTimeout(1000); // Wait for form submission
  }

  /**
   * Complete full registration process
   */
  async registerNewUser(userData: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone?: string;
    acceptTerms?: boolean;
  }) {
    await this.navigateToSignup();
    await this.fillRegistrationForm({
      ...userData,
      acceptTerms: userData.acceptTerms ?? true
    });
    await this.submitRegistration();
  }

  /**
   * Verify registration was successful
   */
  async verifyRegistrationSuccess() {
    // Check for success indicators
    const possibleSuccessIndicators = [
      this.successMessage,
      this.welcomeMessage,
      this.page.locator('text=/welcome|account created|registration successful/i')
    ];
    
    let successFound = false;
    for (const indicator of possibleSuccessIndicators) {
      if (await indicator.isVisible({ timeout: 3000 }).catch(() => false)) {
        successFound = true;
        break;
      }
    }
    
    // Also check URL for account/dashboard redirect
    const currentUrl = await this.getCurrentUrl();
    if (currentUrl.includes('account') || currentUrl.includes('dashboard') || currentUrl.includes('welcome')) {
      successFound = true;
    }
    
    expect(successFound).toBeTruthy();
  }

  /**
   * Verify email validation error is displayed
   */
  async verifyEmailValidationError() {
    const emailErrorVisible = await this.emailError.isVisible({ timeout: 3000 }).catch(() => false);
    const generalErrorWithEmail = await this.generalError.textContent()
      .then(text => text?.toLowerCase().includes('email'))
      .catch(() => false);
    
    expect(emailErrorVisible || generalErrorWithEmail).toBeTruthy();
  }

  /**
   * Verify password validation error is displayed
   */
  async verifyPasswordValidationError() {
    const passwordErrorVisible = await this.passwordError.isVisible({ timeout: 3000 }).catch(() => false);
    const generalErrorWithPassword = await this.generalError.textContent()
      .then(text => text?.toLowerCase().includes('password'))
      .catch(() => false);
    
    expect(passwordErrorVisible || generalErrorWithPassword).toBeTruthy();
  }

  /**
   * Verify password mismatch error
   */
  async verifyPasswordMismatchError() {
    const confirmErrorVisible = await this.confirmPasswordError.isVisible({ timeout: 3000 }).catch(() => false);
    const generalErrorWithMismatch = await this.generalError.textContent()
      .then(text => text?.toLowerCase().includes('match') || text?.toLowerCase().includes('confirm'))
      .catch(() => false);
    
    expect(confirmErrorVisible || generalErrorWithMismatch).toBeTruthy();
  }

  /**
   * Verify duplicate email error
   */
  async verifyDuplicateEmailError() {
    await expect(
      this.page.locator('text=/already registered|already exists|email in use/i')
    ).toBeVisible({ timeout: 5000 });
  }

  /**
   * Verify required field errors are shown
   */
  async verifyRequiredFieldErrors() {
    // At least one error should be visible
    const errorCount = await this.page.locator('.error, .field-error, [role="alert"]').count();
    expect(errorCount).toBeGreaterThan(0);
  }

  /**
   * Get password strength level
   */
  async getPasswordStrength(): Promise<string | null> {
    if (await this.passwordStrengthIndicator.isVisible()) {
      return this.passwordStrengthIndicator.textContent();
    }
    return null;
  }

  /**
   * Verify terms checkbox validation
   */
  async verifyTermsValidationError() {
    const termsError = this.page.locator(
      'text=/accept terms|agree to terms|terms required/i'
    );
    await expect(termsError).toBeVisible({ timeout: 5000 });
  }
}
