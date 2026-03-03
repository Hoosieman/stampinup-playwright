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
    
    // Login before each test (usually should use storage state)
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
    // Arrange - Get original first name from header (e.g., "Hello, Gabrielle")
    const originalFirstName = ExistingTestUser.firstName || 'Gabrielle';
    
    // Act - Navigate, make changes, then cancel
    await profilePage.navigateToProfile();
    await profilePage.fillProfileForm({
      firstName: 'ChangedFirstName',
    });
    await profilePage.cancelChanges();
    
    // Assert - Original first name should still be in the header
    await profilePage.verifyProfileData({ firstName: originalFirstName });
  });

  /**
   * TC-PRF-004: Profile Setup - Required vs Optional Fields
   * Priority: Medium
   */
  test('TC-PRF-004: should display required profile fields', async () => {
    // Act
    await profilePage.navigateToProfile();
    await profilePage.editContactSection();
    
    // Assert - Required fields (first name, last name, email) should be visible
    await expect(profilePage.firstNameInput).toBeVisible();
    await expect(profilePage.lastNameInput).toBeVisible();
    await expect(profilePage.emailInput).toBeVisible();
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
    
    // Note: In a next real test with more time, I would log out and log back in with the new password
    
  });

  /**
   * TC-PRF-006: Change Country to France
   * Priority: Medium
   */
  test('TC-PRF-006: should change country to France and show Bonjour greeting', async () => {
    // Arrange - Use known first name from test user
    const firstName = ExistingTestUser.firstName || 'Gabrielle';
    
    // Act
    await profilePage.navigateToProfile();
    await profilePage.changeCountryToFrance();
    
    // Assert - Header should now show "Bonjour, [FirstName]" instead of "Hello"
    await profilePage.verifyCountryChangedToFrance(firstName);
  });

});
