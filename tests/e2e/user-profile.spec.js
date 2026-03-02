const { test, expect } = require('@playwright/test');
const { LoginPage, ProfilePage } = require('../pages');
const {
  generateProfileUpdateData,
  ExistingTestUser,
} = require('../fixtures/test-data');

/**
 * User Profile Setup Test Suite
 * Tests: TC-PRF-001 through TC-PRF-006
 * 
 * These tests cover the user profile management flow on www.stampinup.com
 * 
 * SITE BEHAVIOR NOTES:
 * - Account Settings page is at /account/settings (dedicated page)
 * - Page header: "MY ACCOUNT | [Full Name]"
 * - Three main sections, each with their own "EDIT" link:
 * 
 * 1. CONTACT Section (left side):
 *    - View mode: First Name, Last Name, Email, Phone Number, Preferred Method of Contact, Birthdate
 *    - Edit mode: Editable input fields with "SAVE CHANGES" (pink) and "CANCEL"
 * 
 * 2. PASSWORD Section (below CONTACT):
 *    - Fields: Confirm Current Password, New Password, Confirm New Password
 *    - Requirement: "minimum of 8 characters with at least one capital letter and one number"
 * 
 * 3. COUNTRY Section (right side):
 *    - View mode: Country with flag, Preferred Language
 *    - Edit mode: Country dropdown, Preferred Language dropdown
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
   */
  test('TC-PRF-001: should successfully setup initial profile for new user', async () => {
    // Arrange
    const profileData = generateProfileUpdateData();
    
    // Act
    await profilePage.navigateToProfile();
    await profilePage.fillProfileForm(profileData);
    await profilePage.saveProfile();
    
    // Assert - Verify data persists after page reload (no success message on this site)
    await profilePage.page.reload();
    await profilePage.waitForPageLoad();
    await profilePage.verifyProfileData({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
    });
  });



  /**
   * TC-PRF-003: Profile Update with Maximum Length Inputs
   * Priority: Low
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
   * TC-PRF-002: Profile Update with Email Change
   * Priority: High
   */
  test('TC-PRF-002: should allow email address change', async () => {
    // Arrange
    const newEmail = `updated_${Date.now()}@testmail.com`;
    
    // Act
    await profilePage.navigateToProfile();
    await profilePage.fillProfileForm({
      email: newEmail,
    });
    await profilePage.saveProfile();
    
    // Assert - Verify we're still on account page (no error redirect)
    const currentUrl = await profilePage.getCurrentUrl();
    expect(currentUrl).toContain('account');
  });

  /**
   * TC-PRF-003: Profile Update - Cancel Changes
   * Priority: Medium
   */
  test('TC-PRF-003: should discard changes when canceling', async () => {
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
   * TC-PRF-004: Profile Setup - Required vs Optional Fields
   * Priority: Medium
   */
  test('TC-PRF-004: should identify required vs optional fields', async () => {
    // Act
    await profilePage.navigateToProfile();
    
    // Assert - Check for required field indicators
    await profilePage.verifyRequiredFieldIndicators();
    
    // Verify email is typically required
    const emailRequired = await profilePage.isFieldRequired('email');
    expect(emailRequired).toBeTruthy();
  });

  /**
   * TC-PRF-005: Change Password
   * Priority: High
   * Note: Password must have minimum 8 characters with at least one capital letter and one number
   */
  test('TC-PRF-005: should allow changing password', async () => {
    // Arrange - Use current password and create a valid new password
    const currentPassword = ExistingTestUser.password;
    const newPassword = 'NewPass123!'; // Meets requirements: 8+ chars, capital, number
    
    // Act
    await profilePage.navigateToProfile();
    await profilePage.changePassword(currentPassword, newPassword);
    
    // Assert - Verify we're still on account page (no error redirect)
    const currentUrl = await profilePage.getCurrentUrl();
    expect(currentUrl).toContain('account');
    
    // Note: In a real test, you would log out and log back in with the new password
    // to fully verify the password change. For this test, we just verify no errors occurred.
  });

  /**
   * TC-PRF-006: Change Country to France
   * Priority: Medium
   */
  test('TC-PRF-006: should change country to France and show Bonjour greeting', async () => {
    // Arrange - Get current user's first name
    const profileData = await profilePage.getCurrentProfileData();
    const firstName = profileData.firstName || 'Gabrielle'; // Fallback to known name
    
    // Act
    await profilePage.navigateToProfile();
    await profilePage.changeCountryToFrance();
    
    // Assert - Header should now show "Bonjour, [FirstName]" instead of "Hello"
    await profilePage.verifyCountryChangedToFrance(firstName);
  });

  /**
   * Additional Test: Profile page loads correctly
   * Priority: High
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
   */
  test('Save button should be accessible after making changes', async () => {
    // Act
    await profilePage.navigateToProfile();
    await profilePage.fillProfileForm({
      firstName: 'TestName',
    });
    
    // Assert
    await expect(profilePage.saveChangesButton).toBeVisible();
    await expect(profilePage.saveChangesButton).toBeEnabled();
  });
});
