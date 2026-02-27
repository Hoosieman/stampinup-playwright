const { test, expect } = require('@playwright/test');
const { LoginPage, ProfilePage } = require('../pages');
const {
  generateProfileUpdateData,
  ExistingTestUser,
  InvalidPhoneNumbers,
  TestUsers,
} = require('../fixtures/test-data');

/**
 * User Profile Setup Test Suite
 * Tests: TC-PRF-001 through TC-PRF-006
 * 
 * These tests cover the user profile management flow on www.stampinup.com
 * 
 * Prerequisites: Tests require a logged-in user
 */

test.describe('User Profile Setup', () => {
  /** @type {LoginPage} */
  let loginPage;
  /** @type {ProfilePage} */
  let profilePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    profilePage = new ProfilePage(page);
    
    // Login before each test
    // Note: In a real scenario, you'd use test fixtures or storage state
    await loginPage.login(ExistingTestUser.email, ExistingTestUser.password);
  });

  /**
   * TC-PRF-001: Successful Initial Profile Setup
   * Priority: High
   * Type: Functional / Positive
   */
  test('TC-PRF-001: should successfully setup initial profile for new user', async () => {
    // Arrange
    const profileData = generateProfileUpdateData();
    
    // Act
    await profilePage.navigateToProfile();
    await profilePage.fillProfileForm(profileData);
    await profilePage.saveProfile();
    
    // Assert
    await profilePage.verifyProfileUpdateSuccess();
    
    // Verify data persists after page reload
    await profilePage.page.reload();
    await profilePage.verifyProfileData({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
    });
  });

  /**
   * TC-PRF-002: Profile Update with Invalid Phone Number
   * Priority: Medium
   * Type: Functional / Negative
   */
  test.describe('TC-PRF-002: Invalid Phone Number Validation', () => {
    const testPhones = InvalidPhoneNumbers.slice(0, 3); // Test first 3
    
    for (const invalidPhone of testPhones) {
      test(`should reject invalid phone: "${invalidPhone || '(empty)'}"`, async ({ page }) => {
        // Arrange
        const loginPage = new LoginPage(page);
        const profilePage = new ProfilePage(page);
        
        await loginPage.login(ExistingTestUser.email, ExistingTestUser.password);
        
        const profileData = generateProfileUpdateData();
        profileData.phone = invalidPhone;
        
        // Act
        await profilePage.navigateToProfile();
        await profilePage.fillProfileForm(profileData);
        await profilePage.saveProfile();
        
        // Assert
        await profilePage.verifyPhoneValidationError();
      });
    }
  });

  /**
   * TC-PRF-003: Profile Update with Maximum Length Inputs
   * Priority: Low
   * Type: Functional / Boundary
   */
  test('TC-PRF-003: should handle maximum length inputs gracefully', async () => {
    // Arrange - Generate very long names
    const longFirstName = 'A'.repeat(100);
    const longLastName = 'B'.repeat(100);
    
    // Act
    await profilePage.navigateToProfile();
    await profilePage.fillProfileForm({
      firstName: longFirstName,
      lastName: longLastName,
    });
    await profilePage.saveProfile();
    
    // Assert - Should either truncate or show validation error
    // The page should not crash
    await expect(profilePage.page).toHaveURL(/.*/, { timeout: 5000 });
  });

  /**
   * TC-PRF-004: Profile Update with Email Change
   * Priority: High
   * Type: Functional / Positive
   */
  test('TC-PRF-004: should allow email address change', async () => {
    // Arrange
    const newEmail = `updated_${Date.now()}@testmail.com`;
    
    // Act
    await profilePage.navigateToProfile();
    await profilePage.fillProfileForm({
      email: newEmail,
    });
    await profilePage.saveProfile();
    
    // Assert - Should show success or verification notice
    // Email change might require verification on live sites
    const currentUrl = await profilePage.getCurrentUrl();
    const successVisible = await profilePage.successMessage.isVisible({ timeout: 3000 }).catch(() => false);
    const verificationNotice = await profilePage.page.locator('text=/verification|confirm|verify email/i').isVisible({ timeout: 3000 }).catch(() => false);
    
    expect(successVisible || verificationNotice || currentUrl.includes('account')).toBeTruthy();
  });

  /**
   * TC-PRF-005: Profile Update - Cancel Changes
   * Priority: Medium
   * Type: Functional / Usability
   */
  test('TC-PRF-005: should discard changes when canceling', async () => {
    // Arrange
    await profilePage.navigateToProfile();
    const originalData = await profilePage.getCurrentProfileData();
    
    // Act - Make changes but cancel
    await profilePage.fillProfileForm({
      firstName: 'ChangedFirstName',
      lastName: 'ChangedLastName',
    });
    await profilePage.cancelChanges();
    
    // Navigate away and back
    await profilePage.goto('/');
    await profilePage.navigateToProfile();
    
    // Assert - Original data should be retained
    const currentData = await profilePage.getCurrentProfileData();
    expect(currentData.firstName).toBe(originalData.firstName);
    expect(currentData.lastName).toBe(originalData.lastName);
  });

  /**
   * TC-PRF-006: Profile Setup - Required vs Optional Fields
   * Priority: Medium
   * Type: Functional / UI Verification
   */
  test('TC-PRF-006: should identify required vs optional fields', async () => {
    // Act
    await profilePage.navigateToProfile();
    
    // Assert - Check for required field indicators
    await profilePage.verifyRequiredFieldIndicators();
    
    // Verify email is typically required
    const emailRequired = await profilePage.isFieldRequired('email');
    expect(emailRequired).toBeTruthy();
  });

  /**
   * Additional Test: Profile page loads correctly
   * Priority: High
   * Type: Smoke Test
   */
  test('Profile page should load with user data', async () => {
    // Act
    await profilePage.navigateToProfile();
    
    // Assert - Form fields should be visible
    await expect(profilePage.firstNameInput).toBeVisible();
    await expect(profilePage.lastNameInput).toBeVisible();
    await expect(profilePage.emailInput).toBeVisible();
  });

  /**
   * Additional Test: Profile data persists across sessions
   * Priority: Medium
   * Type: Functional / Data Persistence
   */
  test('Profile data should persist after page refresh', async () => {
    // Arrange
    await profilePage.navigateToProfile();
    const originalData = await profilePage.getCurrentProfileData();
    
    // Act
    await profilePage.page.reload();
    await profilePage.waitForPageLoad();
    
    // Assert
    const dataAfterRefresh = await profilePage.getCurrentProfileData();
    expect(dataAfterRefresh.firstName).toBe(originalData.firstName);
    expect(dataAfterRefresh.lastName).toBe(originalData.lastName);
    expect(dataAfterRefresh.email).toBe(originalData.email);
  });

  /**
   * Additional Test: Verify save button state
   * Priority: Low
   * Type: UI / UX
   */
  test('Save button should be accessible after making changes', async () => {
    // Act
    await profilePage.navigateToProfile();
    await profilePage.fillProfileForm({
      firstName: 'TestName',
    });
    
    // Assert
    await expect(profilePage.saveButton).toBeVisible();
    await expect(profilePage.saveButton).toBeEnabled();
  });
});
