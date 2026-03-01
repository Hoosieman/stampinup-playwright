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
    
    // Navigation - using role selectors from codegen
    this.helloButton = page.getByRole('button', { name: /Hello\s*,/i });
    this.accountSettingsMenuItem = page.getByRole('menuitem', { name: 'Account Settings' });
    
    // CONTACT section - using data-testid selectors from codegen
    this.contactCard = page.getByTestId('account-card-contact');
    this.contactEditLink = page.getByTestId('account-card-contact').getByTestId('edit-contact-setting');
    
    // Contact form fields (in edit mode) - using data-testid
    this.firstNameInput = page.getByTestId('account-card-firstName');
    this.lastNameInput = page.getByTestId('account-card-lastName');
    this.emailInput = page.getByTestId('account-card-email');
    this.phoneInput = page.getByTestId('account-card-phone');
    
    // Preferred contact method dropdown (Vuetify)
    this.preferredContactInput = page.getByRole('textbox', { name: 'Preferred Method of Contact' });
    this.preferredContactEmailOption = page.locator('div').filter({ hasText: /^Email$/ }).nth(5);
    
    // Birthday date picker
    this.birthdatePicker = page.getByTestId('birthday-date-picker');
    
    // Save button for contact section
    this.saveChangesButton = page.getByTestId('save-changes');
    
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
    
    // COUNTRY section - using data-testid selectors from codegen
    this.countryCard = page.getByTestId('account-card-country');
    this.countryEditLink = page.getByTestId('account-card-country').getByTestId('edit-contact-setting');
    
    // Country dropdown (in edit mode)
    this.countrySelect = page.getByTestId('country-select');
    
    // Confirm dialog after country change
    this.confirmDialogButton = page.getByTestId('confirm-dialog-btn-confirm');
    
    // Localized greeting buttons (changes based on country)
    this.bonjourButton = page.getByRole('button', { name: /Bonjour\s*,/i }); // French
    this.helloButtonAlt = page.getByRole('button', { name: /Hello\s*,/i }); // English/default
    
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
   * Click "Hello, [Name]" button > then "Account Settings" menuitem
   * Assumes user is already logged in
   */
  async navigateToProfile() {
    // Click "Hello, [Name]" button to open dropdown
    await this.helloButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.helloButton.click();
    await this.page.waitForTimeout(500);
    
    // Click "Account Settings" menuitem
    await this.accountSettingsMenuItem.waitFor({ state: 'visible', timeout: 5000 });
    await this.accountSettingsMenuItem.click();
    await this.waitForPageLoad();
  }

  /**
   * Click EDIT link for CONTACT section to enable editing
   */
  async editContactSection() {
    await this.contactEditLink.waitFor({ state: 'visible', timeout: 5000 });
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
    await this.countryEditLink.waitFor({ state: 'visible', timeout: 5000 });
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
      await this.firstNameInput.click();
      await this.firstNameInput.fill(profileData.firstName);
    }
    
    if (profileData.lastName !== undefined) {
      await this.lastNameInput.click();
      await this.lastNameInput.fill(profileData.lastName);
    }
    
    if (profileData.email !== undefined) {
      await this.emailInput.click();
      await this.emailInput.fill(profileData.email);
    }
    
    if (profileData.phone !== undefined) {
      await this.phoneInput.click();
      await this.phoneInput.fill(profileData.phone);
    }
    
    // Preferred contact method - Vuetify dropdown
    if (profileData.preferredContact !== undefined) {
      await this.preferredContactInput.click();
      await this.page.waitForTimeout(300);
      // Select the option (e.g., "Email")
      const option = this.page.locator('div').filter({ hasText: new RegExp(`^${profileData.preferredContact}$`) }).nth(5);
      await option.click();
      await this.page.waitForTimeout(300);
    }
    
    // Birthday date picker - complex Vuetify date picker
    if (profileData.birthdate !== undefined) {
      await this.birthdatePicker.click();
      await this.page.waitForTimeout(300);
      // Select year, month, day from picker
      if (profileData.birthYear) {
        await this.page.getByText(profileData.birthYear).click();
      }
      if (profileData.birthMonth) {
        await this.page.getByRole('button', { name: profileData.birthMonth }).click();
      }
      if (profileData.birthDay) {
        await this.page.getByRole('button', { name: profileData.birthDay, exact: true }).click();
      }
    }
  }

  /**
   * Fill COUNTRY section form
   * After changing country, a confirm dialog appears and redirects to homepage with localized greeting
   * @param {Object} countryData 
   */
  async fillCountryForm(countryData) {
    // Click EDIT to enable form fields
    await this.editCountrySection();
    
    // Click country dropdown and select option
    if (countryData.country !== undefined) {
      await this.countrySelect.click();
      await this.page.waitForTimeout(300);
      // Select country from dropdown using role option
      const countryOption = this.page.getByRole('option', { name: countryData.country });
      await countryOption.click();
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Change country and confirm
   * Full flow: edit country section -> select country -> save -> confirm dialog -> verify localized greeting
   * @param {string} country - Country name (e.g., "France")
   */
  async changeCountry(country) {
    await this.fillCountryForm({ country });
    await this.saveProfile();
    
    // Confirm the country change dialog
    await this.confirmDialogButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.confirmDialogButton.click();
    await this.page.waitForTimeout(2000); // Wait for redirect to homepage
  }

  /**
   * Verify country was changed to France (checks for "Bonjour" in header)
   */
  async verifyCountryChangedToFrance() {
    await expect(this.bonjourButton).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify country is set to US/English (checks for "Hello" in header)
   */
  async verifyCountryIsEnglish() {
    await expect(this.helloButtonAlt).toBeVisible({ timeout: 10000 });
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
    await this.saveChangesButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.saveChangesButton.click();
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
