const { expect } = require('@playwright/test');
const { BasePage } = require('./base.page');

/**
 * Page Object Model for Account Registration/Signup Page
 * Covers: TC-ACC-001 through TC-ACC-008
 * 
 * NOTE: On stampinup.com, the Create Account form is a MODAL POPUP, not a separate page.
 * The modal appears when clicking "Sign In" link in header.
 * 
 * Form fields observed:
 * - First Name
 * - Last Name
 * - Email
 * - Password (with strength indicator showing "Weak", error: "must be at least 8 characters")
 * - Confirm Password
 * - CREATE ACCOUNT button
 * 
 * After successful registration:
 * - "Join Stampin' Rewards!" popup appears with "GET STARTED" and "MAYBE LATER" buttons
 * - Header shows "Hello, [FIRST NAME]" in top right corner
 */
class SignupPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page 
   */
  constructor(page) {
    super(page);
    
    // Create Account Modal elements - using data-testid selectors from Playwright codegen
    this.createAccountButton_header = page.getByTestId('btn-create-account'); // Button to switch to create account view
    
    // Form inputs - using data-testid selectors
    this.firstNameInput = page.getByTestId('reg-first-name');
    this.lastNameInput = page.getByTestId('reg-last-name');
    this.emailInput = page.getByTestId('reg-email');
    
    // Password fields use role selector (no data-testid)
    this.passwordInput = page.getByRole('textbox', { name: 'Password', exact: true });
    this.confirmPasswordInput = page.getByRole('textbox', { name: 'Confirm Password' });
    
    // No phone input observed in the modal
    this.phoneInput = page.locator(
      'input[type="tel"], input[name*="phone" i], input[id*="phone" i]'
    ).first();
    
    // No terms checkbox observed in the modal
    this.termsCheckbox = page.locator(
      'input[type="checkbox"][name*="terms" i], input[type="checkbox"][id*="terms" i], ' +
      'input[type="checkbox"][name*="agree" i], label:has-text("terms") input[type="checkbox"]'
    ).first();
    
    this.newsletterCheckbox = page.locator(
      'input[type="checkbox"][name*="newsletter" i], input[type="checkbox"][id*="newsletter" i], ' +
      'label:has-text("newsletter") input[type="checkbox"]'
    ).first();
    
    // CREATE ACCOUNT submit button - using data-testid
    this.createAccountButton = page.getByTestId('reg-submit');
    
    // Modal close button
    this.modalCloseButton = page.locator(
      '[role="dialog"] button[aria-label="Close"], .modal button.close, ' +
      '[class*="modal"] button:has-text("×"), [class*="modal"] svg[class*="close"]'
    ).first();
    
    // Sign In link at bottom of modal ("Already have an account?")
    this.signInLinkInModal = page.locator('a:has-text("SIGN IN"), a:has-text("Sign In")').first();
    
    // Live validation error locators, these appear WHILE typing
    // Password shows "Weak" indicator when password is too weak
    this.passwordWeakIndicator = page.getByText('Weak');
    this.passwordError = page.getByText('Weak'); // "Weak" is the password error indicator
    
    // Email error shows "The Email Address field must..."
    this.emailError = page.getByText('The Email Address field must');
    
    // Password mismatch error - shows "The Password field..."
    this.confirmPasswordError = page.getByText('The Password field');
    
    this.firstNameError = page.locator(
      '[data-error="firstName"], .firstName-error, ' +
      'text=/first name is required/i'
    ).first();
    
    this.lastNameError = page.locator(
      '[data-error="lastName"], .lastName-error, ' +
      'text=/last name is required/i'
    ).first();
    
    this.generalError = page.locator(
      '.alert-error, .alert-danger, .error-message, [role="alert"]'
    ).first();
    
    // Password strength indicator - shows "Weak" (red), "Medium", or "Strong"
    this.passwordStrengthIndicator = page.getByText('Weak').or(page.getByText('Medium')).or(page.getByText('Strong'));
    
    // Join Stampin' Rewards popup (appears after registration) - using data-testid
    this.rewardsMaybeLaterButton = page.getByTestId('rewards-maybe-later');
    this.rewardsGetStartedButton = page.locator('button:has-text("GET STARTED")');
    
    // Confirm dialog that appears after clicking MAYBE LATER
    this.confirmDialog = page.getByTestId('confirm-dialog');
    this.confirmDialogCloseButton = page.getByTestId('confirm-dialog').locator('button').filter({ hasText: 'Close' });
    
    // Success indicator - "Hello, [FIRST NAME]" button in header
    // Example: page.getByRole('button', { name: 'Hello ,  Test' })
    this.helloUserButton = page.getByRole('button', { name: /Hello\s*,\s*\w+/i });
    
    // Success elements
    this.successMessage = page.locator(
      '.success-message, .alert-success, [role="alert"]:has-text("success")'
    ).first();
    
    this.welcomeMessage = page.locator(
      'h1:has-text("Welcome"), .welcome-message, [data-testid="welcome"]'
    ).first();
  }

  /**
   * Navigate to registration modal
   * The Create Account form is a modal that opens when clicking "Sign In" in the header
   */
  async navigateToSignup() {
    await this.goto('/');
    await this.acceptCookiesIfPresent();
    
    // Click "Sign In" button in header to open auth modal
    const signInBtn = this.page.getByTestId('menu-user-btn-signin');
    await signInBtn.waitFor({ state: 'visible', timeout: 10000 });
    await signInBtn.click();
    
    // Wait for modal, then click "Create Account" button to switch to registration view
    await this.page.waitForTimeout(1000);
    
    // Click the "Create Account" button in modal
    await this.createAccountButton_header.waitFor({ state: 'visible', timeout: 5000 });
    await this.createAccountButton_header.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Fill the registration form with provided data
   * @param {Object} userData 
   */
  async fillRegistrationForm(userData) {
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
   * Submit the registration form by clicking CREATE ACCOUNT button
   */
  async submitRegistration() {
    await this.createAccountButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.createAccountButton.click();
    await this.page.waitForTimeout(2000); // Wait for form validation/submission
  }

  /**
   * Complete full registration process
   * @param {Object} userData 
   */
  async registerNewUser(userData) {
    await this.navigateToSignup();
    await this.fillRegistrationForm({
      ...userData,
      acceptTerms: userData.acceptTerms ?? true
    });
    await this.submitRegistration();
  }

  /**
   * Verify registration was successful:
   * 1. "Join Stampin' Rewards!" popup appears - click "MAYBE LATER"
   * 2. Confirm dialog appears - click "Close"
   * 3. Header shows "Hello, [FIRST NAME]" button
   */
  async verifyRegistrationSuccess(firstName) {
    // Step 1: Click "MAYBE LATER" on rewards popup
    await this.rewardsMaybeLaterButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.rewardsMaybeLaterButton.click();
    await this.page.waitForTimeout(500);
    
    // Step 2: Click "Close" on confirm dialog
    await this.confirmDialogCloseButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.confirmDialogCloseButton.click();
    await this.page.waitForTimeout(500);
    
    // Step 3: Verify "Hello, [FIRST NAME]" button is visible in header
    if (firstName) {
      const helloButton = this.page.getByRole('button', { name: new RegExp(`Hello\\s*,\\s*${firstName}`, 'i') });
      await expect(helloButton).toBeVisible({ timeout: 5000 });
    } else {
      await expect(this.helloUserButton).toBeVisible({ timeout: 5000 });
    }
  }

  /**
   * Dismiss the "Join Stampin' Rewards!" popup by clicking "MAYBE LATER" then "Close"
   */
  async dismissRewardsPopup() {
    // Click MAYBE LATER
    if (await this.rewardsMaybeLaterButton.isVisible({ timeout: 3000 })) {
      await this.rewardsMaybeLaterButton.click();
      await this.page.waitForTimeout(500);
    }
    // Click Close on confirm dialog
    if (await this.confirmDialogCloseButton.isVisible({ timeout: 3000 })) {
      await this.confirmDialogCloseButton.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Accept the Stampin' Rewards program by clicking "GET STARTED"
   */
  async acceptRewardsProgram() {
    if (await this.rewardsGetStartedButton.isVisible({ timeout: 3000 })) {
      await this.rewardsGetStartedButton.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Verify that user is logged in by checking for "Hello, [name]" button in header
   * @param {string} firstName - Expected first name to verify
   */
  async verifyLoggedInAs(firstName) {
    const helloButton = this.page.getByRole('button', { name: new RegExp(`Hello\\s*,\\s*${firstName}`, 'i') });
    await expect(helloButton).toBeVisible({ timeout: 5000 });
  }

  /**
   * Verify email validation error is displayed (live validation)
   * Error text: "The Email Address field must..."
   */
  async verifyEmailValidationError() {
    await expect(this.emailError).toBeVisible({ timeout: 3000 });
  }

  /**
   * Verify password is weak (live validation shows "Weak" indicator)
   */
  async verifyPasswordValidationError() {
    await expect(this.passwordWeakIndicator).toBeVisible({ timeout: 3000 });
  }

  /**
   * Verify password strength shows "Weak"
   */
  async verifyPasswordIsWeak() {
    await expect(this.passwordWeakIndicator).toBeVisible({ timeout: 3000 });
  }

  /**
   * Verify password mismatch error - shows "The Password field..." after clicking Create Account
   */
  async verifyPasswordMismatchError() {
    // Error appears after clicking submit, give it time to show
    await expect(this.confirmPasswordError).toBeVisible({ timeout: 5000 });
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
   * @returns {Promise<string|null>}
   */
  async getPasswordStrength() {
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

module.exports = { SignupPage };
