const { expect } = require('@playwright/test');
const { BasePage } = require('./base.page');

/**
 * Page Object Model for User Profile/Account Settings Page
 * Covers: TC-PRF-001 through TC-PRF-006
 * 
 * SITE BEHAVIOR NOTES (Observed):
 * - Account Settings page is at /account/settings (dedicated page)
 * - Page header: "MY ACCOUNT | [Full Name]"
 * - Three main sections, each with "EDIT" link:
 * 
 * 1. CONTACT Section (left side):
 *    View mode shows: First Name, Last Name, Email, Phone Number, Preferred Method of Contact, Birthdate
 *    Edit mode: Editable fields appear with "SAVE CHANGES" (pink) and "CANCEL" buttons
 * 
 * 2. PASSWORD Section (below CONTACT):
 *    Fields: Confirm Current Password, New Password, Confirm New Password
 *    Requirement: "Password must have a minimum of 8 characters with at least one capital letter and one number"
 *    Buttons: "SAVE CHANGES" (pink), "CANCEL"
 * 
 * 3. COUNTRY Section (right side):
 *    View mode shows: Country with flag, Preferred Language
 *    Edit mode: Country dropdown, Preferred Language dropdown
 *    Buttons: "SAVE CHANGES" (pink), "CANCEL"
 * 
 * Left sidebar: ACCOUNT SETTINGS, ADDRESSES, PAYMENT, MY ORDERS, MY LISTS, 
 *               SUBSCRIPTIONS, DEMONSTRATOR, REWARDS, NOTIFICATIONS, SIGN OUT
 */
class ProfilePage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page 
   */
  constructor(page) {
    super(page);
    
    // URL
    this.accountSettingsUrl = '/account/settings';
    
    // Page header
    this.myAccountHeader = page.locator('text=/MY ACCOUNT/i, h1:has-text("MY ACCOUNT")').first();
    
    // Left sidebar navigation
    this.sidebarAccountSettings = page.locator('text="ACCOUNT SETTINGS"').first();
    this.sidebarAddresses = page.locator('text="ADDRESSES"').first();
    this.sidebarPayment = page.locator('text="PAYMENT"').first();
    this.sidebarMyOrders = page.locator('text="MY ORDERS"').first();
    this.sidebarMyLists = page.locator('text="MY LISTS"').first();
    this.sidebarSubscriptions = page.locator('text="SUBSCRIPTIONS"').first();
    this.sidebarDemonstrator = page.locator('text="DEMONSTRATOR"').first();
    this.sidebarRewards = page.locator('text="REWARDS"').first();
    this.sidebarNotifications = page.locator('text="NOTIFICATIONS"').first();
    this.sidebarSignOut = page.locator('text="SIGN OUT"').first();
    
    // CONTACT section
    this.contactSectionHeader = page.locator('text="CONTACT"').first();
    this.contactEditLink = page.locator('text="CONTACT" >> .. >> a:has-text("EDIT"), section:has-text("CONTACT") a:has-text("EDIT")').first();
    
    // Contact form fields (in edit mode)
    this.firstNameInput = page.locator(
      'input[placeholder="First Name"], input[name*="firstName" i], ' +
      'label:has-text("First Name") + input, label:has-text("First Name") ~ input'
    ).first();
    
    this.lastNameInput = page.locator(
      'input[placeholder="Last Name"], input[name*="lastName" i], ' +
      'label:has-text("Last Name") + input, label:has-text("Last Name") ~ input'
    ).first();
    
    this.emailInput = page.locator(
      'input[placeholder="Email"], input[type="email"], input[name="email"]'
    ).first();
    
    this.phoneInput = page.locator(
      'input[placeholder="Phone Number"], input[type="tel"], input[name*="phone" i]'
    ).first();
    
    this.preferredContactSelect = page.locator(
      'select:near(:text("Preferred Method of Contact")), ' +
      'select[name*="contact" i], [placeholder="Preferred Method of Contact"]'
    ).first();
    
    this.birthdateInput = page.locator(
      'input[placeholder="Birthdate"], input[name*="birth" i], input[type="date"]'
    ).first();
    
    // PASSWORD section
    this.passwordSectionHeader = page.locator('text="PASSWORD"').first();
    this.passwordEditLink = page.locator('text="PASSWORD" >> .. >> a:has-text("EDIT"), section:has-text("PASSWORD") a:has-text("EDIT")').first();
    
    // Password fields (observed placeholders)
    this.confirmCurrentPasswordInput = page.locator(
      'input[placeholder="Confirm Current Password"], input[name*="currentPassword" i]'
    ).first();
    
    this.newPasswordInput = page.locator(
      'input[placeholder="New Password"], input[name*="newPassword" i]'
    ).first();
    
    this.confirmNewPasswordInput = page.locator(
      'input[placeholder="Confirm New Password"], input[name*="confirmPassword" i]'
    ).first();
    
    // COUNTRY section
    this.countrySectionHeader = page.locator('text="COUNTRY"').first();
    this.countryEditLink = page.locator('text="COUNTRY" >> .. >> a:has-text("EDIT"), section:has-text("COUNTRY") a:has-text("EDIT")').first();
    
    // Country fields (in edit mode)
    this.countrySelect = page.locator(
      'select:near(:text("COUNTRY")), select[name*="country" i]'
    ).first();
    
    this.preferredLanguageSelect = page.locator(
      'select:near(:text("Preferred Language")), select[name*="language" i], ' +
      '[placeholder="Preferred Language"]'
    ).first();
    
    // Buttons (each section has its own SAVE CHANGES and CANCEL)
    this.saveChangesButton = page.locator(
      'button:has-text("SAVE CHANGES"), button:has-text("Save Changes")'
    ).first();
    
    this.cancelButton = page.locator(
      'a:has-text("CANCEL"), a:has-text("Cancel"), button:has-text("Cancel")'
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
   * Navigate to Account Settings page
   * URL: /account/settings
   * Assumes user is already logged in
   */
  async navigateToProfile() {
    await this.goto(this.accountSettingsUrl);
    await this.waitForPageLoad();
    await this.closeModalIfPresent();
  }

  /**
   * Click EDIT link for CONTACT section to enable editing
   */
  async editContactSection() {
    await this.contactEditLink.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Click EDIT link for PASSWORD section to enable editing
   */
  async editPasswordSection() {
    await this.passwordEditLink.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Click EDIT link for COUNTRY section to enable editing
   */
  async editCountrySection() {
    await this.countryEditLink.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Get current profile data
   * @returns {Promise<Object>}
   */
  async getCurrentProfileData() {
    return {
      firstName: await this.firstNameInput.inputValue().catch(() => ''),
      lastName: await this.lastNameInput.inputValue().catch(() => ''),
      email: await this.emailInput.inputValue().catch(() => ''),
      phone: await this.phoneInput.inputValue().catch(() => ''),
    };
  }

  /**
   * Fill CONTACT section form with provided data
   * Must click EDIT link first to enable fields
   * @param {Object} profileData 
   */
  async fillContactForm(profileData) {
    // Click EDIT to enable form fields
    await this.editContactSection();
    
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
    
    if (profileData.preferredContact !== undefined && await this.preferredContactSelect.isVisible()) {
      await this.preferredContactSelect.selectOption({ label: profileData.preferredContact });
    }
    
    if (profileData.birthdate !== undefined && await this.birthdateInput.isVisible()) {
      await this.fillInput(this.birthdateInput, profileData.birthdate);
    }
  }

  /**
   * Fill COUNTRY section form
   * @param {Object} countryData 
   */
  async fillCountryForm(countryData) {
    // Click EDIT to enable form fields
    await this.editCountrySection();
    
    if (countryData.country !== undefined && await this.countrySelect.isVisible()) {
      await this.countrySelect.selectOption({ label: countryData.country });
    }
    
    if (countryData.preferredLanguage !== undefined && await this.preferredLanguageSelect.isVisible()) {
      await this.preferredLanguageSelect.selectOption({ label: countryData.preferredLanguage });
    }
  }

  /**
   * Legacy method for backward compatibility
   * @param {Object} profileData 
   */
  async fillProfileForm(profileData) {
    await this.fillContactForm(profileData);
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
   * @param {Object} profileData 
   */
  async updateProfile(profileData) {
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
   * @param {Object} expectedData 
   */
  async verifyProfileData(expectedData) {
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
   * @param {'firstName' | 'lastName' | 'email' | 'phone'} fieldName 
   * @returns {Promise<boolean>}
   */
  async isFieldRequired(fieldName) {
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
   * Password requirement: minimum 8 characters with at least one capital letter and one number
   * @param {string} currentPassword 
   * @param {string} newPassword 
   */
  async changePassword(currentPassword, newPassword) {
    // Click EDIT to enable password fields
    await this.editPasswordSection();
    
    await this.fillInput(this.confirmCurrentPasswordInput, currentPassword);
    await this.fillInput(this.newPasswordInput, newPassword);
    await this.fillInput(this.confirmNewPasswordInput, newPassword);
    
    await this.saveChangesButton.click();
    await this.page.waitForTimeout(1000);
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

module.exports = { ProfilePage };
