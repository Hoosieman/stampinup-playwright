import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object Model for User Profile/Account Settings Page
 * Covers: TC-PRF-001 through TC-PRF-006
 */
export class ProfilePage extends BasePage {
  // Navigation
  readonly accountSettingsLink: Locator;
  readonly profileLink: Locator;
  readonly personalInfoLink: Locator;
  
  // Profile form fields
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly dateOfBirthInput: Locator;
  readonly genderSelect: Locator;
  
  // Password change fields
  readonly currentPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmNewPasswordInput: Locator;
  
  // Action buttons
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly editButton: Locator;
  readonly changePasswordButton: Locator;
  
  // Messages
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  
  // Field errors
  readonly phoneError: Locator;
  readonly emailError: Locator;

  constructor(page: Page) {
    super(page);
    
    // Navigation locators
    this.accountSettingsLink = page.locator(
      'a:has-text("Account Settings"), a:has-text("My Account"), ' +
      'a[href*="account"], [data-testid="account-settings"]'
    ).first();
    
    this.profileLink = page.locator(
      'a:has-text("Profile"), a:has-text("Personal Info"), ' +
      'a[href*="profile"], [data-testid="profile-link"]'
    ).first();
    
    this.personalInfoLink = page.locator(
      'a:has-text("Personal Information"), a:has-text("Personal Info"), ' +
      'a[href*="personal"]'
    ).first();
    
    // Profile form inputs
    this.firstNameInput = page.locator(
      'input[name*="firstName" i], input[name*="first_name" i], ' +
      'input[id*="firstName" i], input[placeholder*="first name" i]'
    ).first();
    
    this.lastNameInput = page.locator(
      'input[name*="lastName" i], input[name*="last_name" i], ' +
      'input[id*="lastName" i], input[placeholder*="last name" i]'
    ).first();
    
    this.emailInput = page.locator(
      'input[type="email"], input[name="email"], input[id*="email"]'
    ).first();
    
    this.phoneInput = page.locator(
      'input[type="tel"], input[name*="phone" i], input[id*="phone" i]'
    ).first();
    
    this.dateOfBirthInput = page.locator(
      'input[type="date"], input[name*="birth" i], input[name*="dob" i], ' +
      'input[id*="birth" i], input[id*="dob" i]'
    ).first();
    
    this.genderSelect = page.locator(
      'select[name*="gender" i], select[id*="gender" i], ' +
      '[role="combobox"][aria-label*="gender" i]'
    ).first();
    
    // Password fields
    this.currentPasswordInput = page.locator(
      'input[name*="currentPassword" i], input[name*="current_password" i], ' +
      'input[id*="currentPassword" i], input[placeholder*="current password" i]'
    ).first();
    
    this.newPasswordInput = page.locator(
      'input[name*="newPassword" i], input[name*="new_password" i], ' +
      'input[id*="newPassword" i], input[placeholder*="new password" i]'
    ).first();
    
    this.confirmNewPasswordInput = page.locator(
      'input[name*="confirmNewPassword" i], input[name*="confirm_new_password" i], ' +
      'input[id*="confirmNewPassword" i], input[placeholder*="confirm new password" i]'
    ).first();
    
    // Buttons
    this.saveButton = page.locator(
      'button:has-text("Save"), button:has-text("Update"), ' +
      'button:has-text("Save Changes"), input[type="submit"][value*="Save" i]'
    ).first();
    
    this.cancelButton = page.locator(
      'button:has-text("Cancel"), a:has-text("Cancel"), ' +
      'button[type="button"]:has-text("Cancel")'
    ).first();
    
    this.editButton = page.locator(
      'button:has-text("Edit"), a:has-text("Edit Profile"), ' +
      '[data-testid="edit-profile"]'
    ).first();
    
    this.changePasswordButton = page.locator(
      'button:has-text("Change Password"), a:has-text("Change Password")'
    ).first();
    
    // Messages
    this.successMessage = page.locator(
      '.success-message, .alert-success, [role="alert"]:has-text("success"), ' +
      '[role="alert"]:has-text("updated"), .notification-success'
    ).first();
    
    this.errorMessage = page.locator(
      '.error-message, .alert-error, .alert-danger, [role="alert"]:has-text("error")'
    ).first();
    
    // Field errors
    this.phoneError = page.locator(
      '[data-error="phone"], .phone-error, #phone-error, ' +
      '.field-error:near(input[type="tel"])'
    ).first();
    
    this.emailError = page.locator(
      '[data-error="email"], .email-error, #email-error, ' +
      '.field-error:near(input[type="email"])'
    ).first();
  }

  /**
   * Navigate to profile settings page
   * Assumes user is already logged in
   */
  async navigateToProfile() {
    // First, try to go to account settings
    await this.goto('/account');
    await this.waitForPageLoad();
    await this.closeModalIfPresent();
    
    // If there's a profile/personal info sub-link, click it
    if (await this.profileLink.isVisible({ timeout: 3000 })) {
      await this.profileLink.click();
      await this.waitForPageLoad();
    } else if (await this.personalInfoLink.isVisible({ timeout: 3000 })) {
      await this.personalInfoLink.click();
      await this.waitForPageLoad();
    }
  }

  /**
   * Get current profile data
   */
  async getCurrentProfileData(): Promise<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }> {
    return {
      firstName: await this.firstNameInput.inputValue().catch(() => ''),
      lastName: await this.lastNameInput.inputValue().catch(() => ''),
      email: await this.emailInput.inputValue().catch(() => ''),
      phone: await this.phoneInput.inputValue().catch(() => ''),
    };
  }

  /**
   * Fill profile form with provided data
   */
  async fillProfileForm(profileData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
  }) {
    // Click edit button if in read-only mode
    if (await this.editButton.isVisible({ timeout: 2000 })) {
      await this.editButton.click();
      await this.page.waitForTimeout(500);
    }
    
    if (profileData.firstName !== undefined) {
      await this.fillInput(this.firstNameInput, profileData.firstName);
    }
    
    if (profileData.lastName !== undefined) {
      await this.fillInput(this.lastNameInput, profileData.lastName);
    }
    
    if (profileData.email !== undefined) {
      await this.fillInput(this.emailInput, profileData.email);
    }
    
    if (profileData.phone !== undefined) {
      await this.fillInput(this.phoneInput, profileData.phone);
    }
    
    if (profileData.dateOfBirth !== undefined && await this.dateOfBirthInput.isVisible()) {
      await this.fillInput(this.dateOfBirthInput, profileData.dateOfBirth);
    }
    
    if (profileData.gender !== undefined && await this.genderSelect.isVisible()) {
      await this.genderSelect.selectOption(profileData.gender);
    }
  }

  /**
   * Save profile changes
   */
  async saveProfile() {
    await this.saveButton.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Cancel profile changes
   */
  async cancelChanges() {
    if (await this.cancelButton.isVisible()) {
      await this.cancelButton.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Update profile with full flow
   */
  async updateProfile(profileData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
  }) {
    await this.navigateToProfile();
    await this.fillProfileForm(profileData);
    await this.saveProfile();
  }

  /**
   * Verify profile update success
   */
  async verifyProfileUpdateSuccess() {
    await expect(this.successMessage).toBeVisible({ timeout: 5000 });
  }

  /**
   * Verify phone validation error
   */
  async verifyPhoneValidationError() {
    const phoneErrorVisible = await this.phoneError.isVisible({ timeout: 3000 }).catch(() => false);
    const generalErrorWithPhone = await this.errorMessage.textContent()
      .then(text => text?.toLowerCase().includes('phone'))
      .catch(() => false);
    
    expect(phoneErrorVisible || generalErrorWithPhone).toBeTruthy();
  }

  /**
   * Verify profile data was saved correctly
   */
  async verifyProfileData(expectedData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }) {
    const currentData = await this.getCurrentProfileData();
    
    if (expectedData.firstName !== undefined) {
      expect(currentData.firstName).toBe(expectedData.firstName);
    }
    if (expectedData.lastName !== undefined) {
      expect(currentData.lastName).toBe(expectedData.lastName);
    }
    if (expectedData.email !== undefined) {
      expect(currentData.email).toBe(expectedData.email);
    }
    if (expectedData.phone !== undefined) {
      // Normalize phone for comparison
      const normalizedExpected = expectedData.phone.replace(/\D/g, '');
      const normalizedActual = currentData.phone.replace(/\D/g, '');
      expect(normalizedActual).toContain(normalizedExpected);
    }
  }

  /**
   * Check if field is marked as required
   */
  async isFieldRequired(fieldName: 'firstName' | 'lastName' | 'email' | 'phone'): Promise<boolean> {
    const fieldMap = {
      firstName: this.firstNameInput,
      lastName: this.lastNameInput,
      email: this.emailInput,
      phone: this.phoneInput,
    };
    
    const field = fieldMap[fieldName];
    const required = await field.getAttribute('required');
    const ariaRequired = await field.getAttribute('aria-required');
    
    return required !== null || ariaRequired === 'true';
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string) {
    if (await this.changePasswordButton.isVisible()) {
      await this.changePasswordButton.click();
      await this.page.waitForTimeout(500);
    }
    
    await this.fillInput(this.currentPasswordInput, currentPassword);
    await this.fillInput(this.newPasswordInput, newPassword);
    
    if (await this.confirmNewPasswordInput.isVisible()) {
      await this.fillInput(this.confirmNewPasswordInput, newPassword);
    }
    
    await this.saveButton.click();
  }

  /**
   * Verify field labels and required indicators
   */
  async verifyRequiredFieldIndicators() {
    const requiredIndicators = await this.page.locator(
      'label:has-text("*"), .required-indicator, [aria-required="true"]'
    ).count();
    
    expect(requiredIndicators).toBeGreaterThan(0);
  }
}
