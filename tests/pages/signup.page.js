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
    
    // Create Account Modal container
    this.createAccountModal = page.locator('[role="dialog"], .modal, [class*="modal"]').filter({ hasText: 'CREATE ACCOUNT' });
    
    // Form inputs - based on observed placeholders in modal
    this.firstNameInput = page.locator(
      'input[placeholder="First Name"], input[name*="firstName" i], ' +
      'input[id*="firstName" i], input[placeholder*="first name" i]'
    ).first();
    
    this.lastNameInput = page.locator(
      'input[placeholder="Last Name"], input[name*="lastName" i], ' +
      'input[id*="lastName" i], input[placeholder*="last name" i]'
    ).first();
    
    this.emailInput = page.locator(
      'input[placeholder="Email"], input[type="email"], input[name="email"], ' +
      'input[id*="email"], input[placeholder*="email" i]'
    ).first();
    
    this.passwordInput = page.locator(
      'input[placeholder="Password"]:not([placeholder*="Confirm"]), ' +
      'input[type="password"]:not([placeholder*="Confirm"]):not([name*="confirm"])'
    ).first();
    
    this.confirmPasswordInput = page.locator(
      'input[placeholder="Confirm Password"], input[name*="confirm" i], ' +
      'input[id*="confirm" i], input[placeholder*="confirm" i]'
    ).first();
    
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
    
    // CREATE ACCOUNT button (observed in modal)
    this.createAccountButton = page.locator(
      'button:has-text("CREATE ACCOUNT"), button:has-text("Create Account"), ' +
      'button:has-text("Register"), input[type="submit"][value*="Create" i]'
    ).first();
    
    // Modal close button
    this.modalCloseButton = page.locator(
      '[role="dialog"] button[aria-label="Close"], .modal button.close, ' +
      '[class*="modal"] button:has-text("×"), [class*="modal"] svg[class*="close"]'
    ).first();
    
    // Sign In link at bottom of modal ("Already have an account?")
    this.signInLinkInModal = page.locator('a:has-text("SIGN IN"), a:has-text("Sign In")').first();
    
    // Error locators - password error observed: "The Password field must be at least 8 characters long."
    this.passwordError = page.locator(
      'text=/Password field must be at least/i, text=/8 characters/i, ' +
      '[data-error="password"], .password-error, .field-error:near(input[type="password"])'
    ).first();
    
    this.emailError = page.locator(
      '[data-error="email"], .email-error, #email-error, ' +
      'text=/invalid email/i, text=/email is required/i'
    ).first();
    
    this.confirmPasswordError = page.locator(
      '[data-error="confirmPassword"], .confirm-password-error, ' +
      'text=/passwords do not match/i, text=/confirm password/i'
    ).first();
    
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
    
    // Password strength indicator - observed showing "Weak" in red
    this.passwordStrengthIndicator = page.locator(
      'text=/Weak|Medium|Strong/i, .password-strength, .strength-indicator'
    ).first();
    
    // Join Stampin' Rewards popup (appears after registration)
    this.rewardsModal = page.locator('[role="dialog"], .modal').filter({ hasText: "JOIN STAMPIN' REWARDS" });
    this.rewardsGetStartedButton = page.locator('button:has-text("GET STARTED")');
    this.rewardsMaybeLaterButton = page.locator('button:has-text("MAYBE LATER"), a:has-text("MAYBE LATER")');
    
    // Success indicator - "Hello, [FIRST NAME]" in header
    this.helloUserHeader = page.locator('text=/Hello,\\s*\\w+/i, a:has-text("Hello,")');
    
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
    // Site uses Vuetify - the button has span.v-btn__content containing "Sign in"
    const signInLink = this.page.locator('.v-btn:has-text("Sign in"), button:has-text("Sign in"), span.v-btn__content:has-text("Sign in")').first();
    await signInLink.waitFor({ state: 'visible', timeout: 10000 });
    await signInLink.click();
    
    // Wait for modal to appear, then click "SIGN IN" link to switch to create account
    // Based on screenshot: modal shows "Already have an account? Welcome back! SIGN IN"
    // So the modal might default to Create Account view
    await this.page.waitForTimeout(1000); // Wait for modal animation
    
    // Check if we're on the Create Account view (look for "CREATE ACCOUNT" heading)
    const createAccountHeading = this.page.locator('text="CREATE ACCOUNT"');
    if (await createAccountHeading.isVisible({ timeout: 3000 })) {
      // Already on Create Account view
      return;
    }
    
    // If we're on Sign In view, look for link to create account
    const createAccountLink = this.page.locator(
      'a:has-text("Create Account"), a:has-text("Register"), ' +
      'button:has-text("Create Account"), text="Create Account"'
    ).first();
    
    if (await createAccountLink.isVisible({ timeout: 5000 })) {
      await createAccountLink.click();
      await this.page.waitForTimeout(500); // Wait for view switch
    }
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
   * Submit the registration form
   */
  async submitRegistration() {
    await this.createAccountButton.click();
    await this.page.waitForTimeout(1000); // Wait for form submission
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
   * Verify registration was successful
   * Success indicators on stampinup.com:
   * 1. "Join Stampin' Rewards!" popup appears
   * 2. Header shows "Hello, [FIRST NAME]" in top right
   */
  async verifyRegistrationSuccess() {
    let successFound = false;
    
    // Check for "Join Stampin' Rewards!" popup (appears after registration)
    if (await this.rewardsModal.isVisible({ timeout: 5000 }).catch(() => false)) {
      successFound = true;
      // Optionally dismiss the rewards popup
      await this.dismissRewardsPopup();
    }
    
    // Check for "Hello, [FIRST NAME]" in header
    if (await this.helloUserHeader.isVisible({ timeout: 5000 }).catch(() => false)) {
      successFound = true;
    }
    
    // Fallback: check for other success indicators
    const possibleSuccessIndicators = [
      this.successMessage,
      this.welcomeMessage,
      this.page.locator('text=/welcome|account created|registration successful/i')
    ];
    
    for (const indicator of possibleSuccessIndicators) {
      if (await indicator.isVisible({ timeout: 3000 }).catch(() => false)) {
        successFound = true;
        break;
      }
    }
    
    expect(successFound).toBeTruthy();
  }

  /**
   * Dismiss the "Join Stampin' Rewards!" popup by clicking "MAYBE LATER"
   */
  async dismissRewardsPopup() {
    if (await this.rewardsMaybeLaterButton.isVisible({ timeout: 3000 })) {
      await this.rewardsMaybeLaterButton.click();
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
   * Verify that user is logged in by checking for "Hello, [name]" in header
   * @param {string} firstName - Expected first name to verify
   */
  async verifyLoggedInAs(firstName) {
    const helloText = this.page.locator(`text=/Hello,\\s*${firstName}/i`);
    await expect(helloText).toBeVisible({ timeout: 5000 });
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
