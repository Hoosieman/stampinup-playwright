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
    
    // Preferred contact method dropdown - click button then select option
    this.preferredContactButton = page.getByRole('button', { name: 'Preferred Method of Contact' });
    this.preferredContactNoneOption = page.getByRole('option', { name: 'None Selected' });
    this.preferredContactEmailOption = page.getByRole('option', { name: 'Email' });
    this.preferredContactPhoneOption = page.getByRole('option', { name: 'Phone Call' });
    this.preferredContactTextOption = page.getByRole('option', { name: 'Text Message' });
    
    // Birthday date picker - click picker, then select year, month, day
    this.birthdatePicker = page.getByTestId('birthday-date-picker');
    
    // Save button for contact section
    this.saveChangesButton = page.getByTestId('save-changes');
    
    // PASSWORD section - using data-testid selectors from codegen
    this.passwordCard = page.getByTestId('account-card-password');
    this.passwordEditLink = page.getByTestId('account-card-password').getByTestId('edit-contact-setting');
    
    // Password fields (in edit mode) - using data-testid and role selectors
    this.currentPasswordInput = page.getByTestId('current-password');
    this.newPasswordInput = page.getByRole('textbox', { name: 'New Password', exact: true });
    this.confirmNewPasswordInput = page.getByRole('textbox', { name: 'Confirm New Password' });
    
    // COUNTRY section - using data-testid selectors from codegen
    this.countryCard = page.getByTestId('account-card-country');
    this.countryEditLink = page.getByTestId('account-card-country').getByTestId('edit-contact-setting');
    
    // Country dropdown (in edit mode) - click current country button, then select option
    this.countryDropdownButton = page.getByTestId('observer-form').getByRole('button', { name: 'United States' });
    this.franceOption = page.getByRole('option', { name: 'France' });
    this.unitedStatesOption = page.getByRole('option', { name: 'United States' });
    
    // Confirm dialog after country change
    this.confirmDialogButton = page.getByTestId('confirm-dialog-btn-confirm');
    
    // Localized greeting buttons (changes based on country)
    this.bonjourButton = page.getByRole('button', { name: /Bonjour\s*,/i }); // French
    this.helloButtonAlt = page.getByRole('button', { name: /Hello\s*,/i }); // English/default
    
    // Cancel button - same for all sections
    this.cancelButton = page.getByTestId('cancel-changes');
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
    await this.passwordEditLink.waitFor({ state: 'visible', timeout: 5000 });
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
    
    // Preferred contact method - click button to open dropdown, then select option
    if (profileData.preferredContact !== undefined) {
      await this.preferredContactButton.click();
      await this.page.waitForTimeout(300);
      // Select the option based on value
      const optionMap = {
        'None Selected': this.preferredContactNoneOption,
        'Email': this.preferredContactEmailOption,
        'Phone Call': this.preferredContactPhoneOption,
        'Text Message': this.preferredContactTextOption,
      };
      const option = optionMap[profileData.preferredContact];
      if (option) {
        await option.click();
        await this.page.waitForTimeout(300);
      }
    }
    
    // Birthday date picker - click picker, select year, month, day
    if (profileData.birthYear || profileData.birthMonth || profileData.birthDay) {
      await this.birthdatePicker.click();
      await this.page.waitForTimeout(300);
      // Select year (e.g., '2003')
      if (profileData.birthYear) {
        await this.page.getByText(profileData.birthYear).click();
        await this.page.waitForTimeout(200);
      }
      // Select month (e.g., 'May')
      if (profileData.birthMonth) {
        await this.page.getByRole('button', { name: profileData.birthMonth }).click();
        await this.page.waitForTimeout(200);
      }
      // Select day (e.g., '6') - use exact: true to avoid matching '16', '26', etc.
      if (profileData.birthDay) {
        await this.page.getByRole('button', { name: profileData.birthDay, exact: true }).click();
        await this.page.waitForTimeout(200);
      }
    }
  }

  /**
   * Change country to France
   * Full flow: edit country section -> click US button -> select France -> save -> confirm dialog
   * After confirming, redirects to homepage with "Bonjour" greeting
   */
  async changeCountryToFrance() {
    // Click EDIT to enable form fields
    await this.editCountrySection();
    
    // Click current country button (United States) to open dropdown
    await this.countryDropdownButton.click();
    await this.page.waitForTimeout(300);
    
    // Select France from dropdown
    await this.franceOption.click();
    await this.page.waitForTimeout(300);
    
    // Save changes
    await this.saveChangesButton.click();
    await this.page.waitForTimeout(500);
    
    // Confirm the country change dialog
    await this.confirmDialogButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.confirmDialogButton.click();
    await this.page.waitForTimeout(2000); // Wait for redirect to homepage
  }

  /**
   * Verify country was changed to France (checks for "Bonjour, [FirstName]" in header)
   * @param {string} firstName - Expected first name in greeting
   */
  async verifyCountryChangedToFrance(firstName) {
    const bonjourWithName = this.page.getByRole('button', { name: new RegExp(`Bonjour\\s*,?\\s*${firstName}`, 'i') });
    await expect(bonjourWithName).toBeVisible({ timeout: 10000 });
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
   * Verify profile data was saved by checking the first name in header button
   * More reliable than checking form field values
   * @param {Object} expectedData 
   */
  async verifyProfileData(expectedData) {
    if (expectedData.firstName !== undefined) {
      // Check the header button shows "Hello, [FirstName]"
      const helloButtonWithName = this.page.getByRole('button', { name: new RegExp(`Hello\\s*,\\s*${expectedData.firstName}`, 'i') });
      await expect(helloButtonWithName).toBeVisible({ timeout: 10000 });
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
   * Note: After successful change, an email notification is sent to the user
   * @param {string} currentPassword 
   * @param {string} newPassword 
   */
  async changePassword(currentPassword, newPassword) {
    // Click EDIT to enable password fields
    await this.editPasswordSection();
    
    // Fill current password
    await this.currentPasswordInput.click();
    await this.currentPasswordInput.fill(currentPassword);
    
    // Fill new password
    await this.newPasswordInput.click();
    await this.newPasswordInput.fill(newPassword);
    
    // Fill confirm new password
    await this.confirmNewPasswordInput.click();
    await this.confirmNewPasswordInput.fill(newPassword);
    
    // Save changes
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
