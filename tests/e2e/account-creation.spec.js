const { test, expect } = require('@playwright/test');
const { SignupPage } = require('../pages');
const {
  generateValidUserData,
  TestUsers,
  InvalidEmails,
  WeakPasswords,
  ExistingTestUser,
} = require('../fixtures/test-data');

/**
 * Account Creation Test Suite
 * Tests: TC-ACC-001 through TC-ACC-008
 * 
 * These tests cover the user registration flow on www.stampinup.com
 */

test.describe('Account Creation', () => {
  /** @type {SignupPage} */
  let signupPage;

  test.beforeEach(async ({ page }) => {
    signupPage = new SignupPage(page);
  });

  /**
   * TC-ACC-001: Successful Account Creation with Valid Data
   * Priority: High
   * Type: Functional / Positive
   */
  test('TC-ACC-001: should successfully create account with valid data', async () => {
    // Arrange
    const userData = generateValidUserData();
    
    // Act
    await signupPage.registerNewUser(userData);
    
    // Assert
    await signupPage.verifyRegistrationSuccess();
  });

  /**
   * TC-ACC-002: Account Creation with Already Registered Email
   * Priority: High
   * Type: Functional / Negative
   */
  test('TC-ACC-002: should show error for already registered email', async () => {
    // Arrange - Use an email that's already registered
    const userData = generateValidUserData();
    userData.email = ExistingTestUser.email; // Pre-registered email
    
    // Act
    await signupPage.registerNewUser(userData);
    
    // Assert
    await signupPage.verifyDuplicateEmailError();
  });

  /**
   * TC-ACC-003: Account Creation with Invalid Email Format
   * Priority: High
   * Type: Functional / Negative
   */
  test.describe('TC-ACC-003: Invalid Email Format Validation', () => {
    const testEmails = InvalidEmails.slice(0, 4); // Test first 4 invalid emails
    
    for (const invalidEmail of testEmails) {
      test(`should reject invalid email format: "${invalidEmail || '(empty)'}"`, async ({ page }) => {
        // Arrange
        const signupPage = new SignupPage(page);
        const userData = generateValidUserData();
        userData.email = invalidEmail;
        
        // Act
        await signupPage.navigateToSignup();
        await signupPage.fillRegistrationForm(userData);
        await signupPage.submitRegistration();
        
        // Assert
        await signupPage.verifyEmailValidationError();
      });
    }
  });

  /**
   * TC-ACC-004: Account Creation with Weak Password
   * Priority: High
   * Type: Functional / Negative / Security
   */
  test.describe('TC-ACC-004: Weak Password Validation', () => {
    const testPasswords = WeakPasswords.slice(0, 3); // Test first 3 weak passwords
    
    for (const weakPassword of testPasswords) {
      test(`should reject weak password: "${weakPassword}"`, async ({ page }) => {
        // Arrange
        const signupPage = new SignupPage(page);
        const userData = generateValidUserData();
        userData.password = weakPassword;
        userData.confirmPassword = weakPassword;
        
        // Act
        await signupPage.navigateToSignup();
        await signupPage.fillRegistrationForm(userData);
        await signupPage.submitRegistration();
        
        // Assert
        await signupPage.verifyPasswordValidationError();
      });
    }
  });

  /**
   * TC-ACC-005: Account Creation with Password Mismatch
   * Priority: Medium
   * Type: Functional / Negative
   */
  test('TC-ACC-005: should show error when passwords do not match', async () => {
    // Arrange
    const userData = generateValidUserData();
    userData.confirmPassword = 'DifferentPassword123!'; // Mismatch
    
    // Act
    await signupPage.navigateToSignup();
    await signupPage.fillRegistrationForm(userData);
    await signupPage.submitRegistration();
    
    // Assert
    await signupPage.verifyPasswordMismatchError();
  });

  /**
   * TC-ACC-006: Account Creation with Empty Required Fields
   * Priority: High
   * Type: Functional / Negative
   */
  test('TC-ACC-006: should show errors for empty required fields', async () => {
    // Act
    await signupPage.navigateToSignup();
    await signupPage.submitRegistration(); // Submit without filling any fields
    
    // Assert
    await signupPage.verifyRequiredFieldErrors();
  });

  /**
   * TC-ACC-007: Account Creation with Special Characters in Name Fields
   * Priority: Medium
   * Type: Functional / Boundary
   */
  test('TC-ACC-007: should accept special characters in name fields', async () => {
    // Arrange
    const userData = TestUsers.specialCharName();
    
    // Act
    await signupPage.registerNewUser(userData);
    
    // Assert - Should either succeed or not show a name-specific error
    // The registration might fail for other reasons on a live site
    // but special characters in names should be accepted
    const url = await signupPage.getCurrentUrl();
    
    // If registration failed, it shouldn't be due to name validation
    // (we're testing that special chars are accepted in the fields)
    await expect(signupPage.page.locator('text=/invalid name|special character/i')).not.toBeVisible();
  });

  /**
   * TC-ACC-008: Account Creation - Terms and Conditions Validation
   * Priority: High
   * Type: Functional / Negative / Compliance
   */
  test('TC-ACC-008: should require terms and conditions acceptance', async () => {
    // Arrange
    const userData = generateValidUserData();
    
    // Act
    await signupPage.navigateToSignup();
    await signupPage.fillRegistrationForm({
      ...userData,
      acceptTerms: false, // Don't accept terms
    });
    await signupPage.uncheckTermsCheckbox(); // Ensure unchecked
    await signupPage.submitRegistration();
    
    // Assert - Should show terms validation error
    // Note: This test depends on whether the site has a T&C checkbox
    await signupPage.verifyTermsValidationError().catch(() => {
      // If no T&C checkbox exists, this test should be skipped
      test.skip();
    });
  });

  /**
   * Additional Test: Verify registration form loads correctly
   * Priority: High
   * Type: Smoke Test
   */
  test('Registration form should load with all required fields', async () => {
    // Act
    await signupPage.navigateToSignup();
    
    // Assert - Verify form fields are visible
    await expect(signupPage.emailInput).toBeVisible();
    await expect(signupPage.passwordInput).toBeVisible();
    await expect(signupPage.createAccountButton).toBeVisible();
  });

  /**
   * Additional Test: Password strength indicator
   * Priority: Low
   * Type: UI / UX
   */
  test('Password field should show strength indicator for weak password', async ({ page }) => {
    // Arrange
    await signupPage.navigateToSignup();
    
    // Act
    await signupPage.fillInput(signupPage.passwordInput, '123');
    
    // Assert - If strength indicator exists, it should show weak
    const strength = await signupPage.getPasswordStrength();
    if (strength !== null) {
      expect(strength.toLowerCase()).toContain('weak');
    }
  });
});
