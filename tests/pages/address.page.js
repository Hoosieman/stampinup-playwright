const { expect } = require('@playwright/test');
const { BasePage } = require('./base.page');

/**
 * Page Object Model for Address Book/Address Settings Page
 * Covers: TC-ADD-001 through TC-ADD-009
 * 
 * SITE BEHAVIOR NOTES (Observed):
 * - Address page is a DEDICATED PAGE at /account/address/create (not a modal)
 * - Access: Click "Hello, [Name]" dropdown > "Addresses" in header
 * - Left sidebar navigation: ACCOUNT SETTINGS, ADDRESSES, PAYMENT, MY ORDERS, MY LISTS, 
 *   SUBSCRIPTIONS, DEMONSTRATOR, REWARDS, NOTIFICATIONS, SIGN OUT
 * 
 * Form Fields (all required except Address 2):
 * - First Name, Last Name (side by side)
 * - Address (main address line)
 * - Address 2 (optional)
 * - City
 * - State (dropdown)
 * - ZIP Code
 * - Phone Number
 * - Checkbox: "Make this my default shipping address"
 * - Checkbox: "Make this my default mailing address"
 * 
 * Buttons: "SAVE ADDRESS" (pink), "CANCEL"
 * 
 * Validation errors appear in red below each field:
 * - "The First Name field is required."
 * - "The Last Name field is required."
 * - "The Address field is required."
 * - "The City field is required."
 * - "The State field is required."
 * - "The Zip Code field is required."
 * - "The Phone Number field is required."
 */
class AddressPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page 
   */
  constructor(page) {
    super(page);
    
    // URLs
    this.addressListUrl = '/account/address';
    this.addAddressUrl = '/account/address/create';
    
    // Navigation - Account dropdown menu items
    this.accountDropdown = page.locator('a:has-text("Hello,"), text=/Hello,\\s*\\w+/i').first();
    this.addressesMenuLink = page.locator('a:has-text("Addresses"), [href*="/account/address"]').first();
    
    // Left sidebar navigation
    this.sidebarAccountSettings = page.locator('text="ACCOUNT SETTINGS", a:has-text("Account Settings")').first();
    this.sidebarAddresses = page.locator('text="ADDRESSES", a:has-text("Addresses")').first();
    this.sidebarPayment = page.locator('text="PAYMENT", a:has-text("Payment")').first();
    this.sidebarMyOrders = page.locator('text="MY ORDERS", a:has-text("My Orders")').first();
    this.sidebarSignOut = page.locator('text="SIGN OUT", a:has-text("Sign Out")').first();
    
    // Add address button (if on address list page)
    this.addAddressButton = page.locator(
      'button:has-text("Add Address"), button:has-text("Add New Address"), ' +
      'a:has-text("Add Address"), a[href*="/address/create"]'
    ).first();
    
    // Name fields (observed in form)
    this.firstNameInput = page.locator(
      'input[placeholder="First Name"], input[name*="firstName" i], input[id*="firstName" i]'
    ).first();
    
    this.lastNameInput = page.locator(
      'input[placeholder="Last Name"], input[name*="lastName" i], input[id*="lastName" i]'
    ).first();
    
    // Address form inputs (observed in form)
    this.addressLine1Input = page.locator(
      'input[placeholder="Address"], input[name*="address1" i], input[name*="address" i]:not([name*="address2"]), ' +
      'input[id*="address1" i], input[placeholder*="street" i]'
    ).first();
    
    this.addressLine2Input = page.locator(
      'input[placeholder="Address 2"], input[name*="address2" i], ' +
      'input[id*="address2" i], input[placeholder*="apt" i]'
    ).first();
    
    this.cityInput = page.locator(
      'input[placeholder="City"], input[name*="city" i], input[id*="city" i]'
    ).first();
    
    // State is a dropdown (observed)
    this.stateSelect = page.locator(
      'select[placeholder="State"], select[name*="state" i], select[id*="state" i]'
    ).first();
    
    this.zipCodeInput = page.locator(
      'input[placeholder="ZIP Code"], input[name*="zip" i], input[name*="postal" i], ' +
      'input[id*="zip" i]'
    ).first();
    
    this.phoneInput = page.locator(
      'input[placeholder="Phone Number"], input[type="tel"], input[name*="phone" i], input[id*="phone" i]'
    ).first();
    
    // Default address checkboxes (observed)
    this.defaultShippingCheckbox = page.locator(
      'input[type="checkbox"]:near(:text("default shipping")), ' +
      'label:has-text("Make this my default shipping address") input[type="checkbox"], ' +
      'input[type="checkbox"][name*="shipping" i]'
    ).first();
    
    this.defaultMailingCheckbox = page.locator(
      'input[type="checkbox"]:near(:text("default mailing")), ' +
      'label:has-text("Make this my default mailing address") input[type="checkbox"], ' +
      'input[type="checkbox"][name*="mailing" i]'
    ).first();
    
    // Action buttons (observed)
    this.saveAddressButton = page.locator(
      'button:has-text("SAVE ADDRESS"), button:has-text("Save Address")'
    ).first();
    
    this.cancelButton = page.locator(
      'a:has-text("CANCEL"), a:has-text("Cancel"), button:has-text("Cancel")'
    ).first();
    
    this.editAddressButton = page.locator(
      'button:has-text("Edit"), a:has-text("Edit"), [data-testid="edit-address"], ' +
      '[aria-label*="edit address" i]'
    ).first();
    
    this.deleteAddressButton = page.locator(
      'button:has-text("Delete"), button:has-text("Remove"), ' +
      '[data-testid="delete-address"], [aria-label*="delete address" i]'
    ).first();
    
    this.setDefaultButton = page.locator(
      'button:has-text("Set as Default"), button:has-text("Make Default"), ' +
      'a:has-text("Set as Default")'
    ).first();
    
    // Address list elements
    this.addressCards = page.locator(
      '.address-card, .address-item, [data-testid="address-card"], ' +
      '.saved-address, .address-block'
    );
    
    this.emptyAddressMessage = page.locator(
      'text=/no address|no saved address|add your first address/i'
    );
    
    this.defaultAddressBadge = page.locator(
      '.default-badge, .default-label, text=/default/i, ' +
      '[data-testid="default-badge"]'
    );
    
    // Messages
    this.successMessage = page.locator(
      '.success-message, .alert-success, [role="alert"]:has-text("success"), ' +
      '[role="alert"]:has-text("saved"), .notification-success'
    ).first();
    
    this.errorMessage = page.locator(
      '.error-message, .alert-error, .alert-danger, [role="alert"]:has-text("error")'
    ).first();
    
    // Field errors
    this.addressLine1Error = page.locator(
      '[data-error="address1"], .address1-error, .address-error, ' +
      '.field-error:near(input[name*="address1" i])'
    ).first();
    
    this.cityError = page.locator(
      '[data-error="city"], .city-error, ' +
      '.field-error:near(input[name*="city" i])'
    ).first();
    
    this.stateError = page.locator(
      '[data-error="state"], .state-error, ' +
      '.field-error:near(select[name*="state" i])'
    ).first();
    
    this.zipCodeError = page.locator(
      '[data-error="zip"], .zip-error, .postal-error, ' +
      '.field-error:near(input[name*="zip" i])'
    ).first();
    
    // Confirmation dialog
    this.confirmDeleteButton = page.locator(
      '.confirm-dialog button:has-text("Delete"), .confirm-dialog button:has-text("Yes"), ' +
      '[role="dialog"] button:has-text("Delete"), [role="dialog"] button:has-text("Confirm")'
    ).first();
    
    this.cancelDeleteButton = page.locator(
      '.confirm-dialog button:has-text("Cancel"), [role="dialog"] button:has-text("Cancel"), ' +
      '[role="dialog"] button:has-text("No")'
    ).first();
  }

  /**
   * Navigate to address book page
   * Assumes user is already logged in
   * Path: Click "Hello, [Name]" dropdown > "Addresses" OR direct URL /account/address
   */
  async navigateToAddressBook() {
    // Try direct URL navigation first (more reliable)
    await this.goto(this.addressListUrl);
    await this.waitForPageLoad();
    await this.closeModalIfPresent();
  }

  /**
   * Navigate to Add New Address page directly
   * URL: /account/address/create
   */
  async navigateToAddAddress() {
    await this.goto(this.addAddressUrl);
    await this.waitForPageLoad();
    await this.closeModalIfPresent();
  }

  /**
   * Navigate via account dropdown menu (alternative method)
   */
  async navigateViaDropdown() {
    await this.goto('/');
    await this.waitForPageLoad();
    
    // Click "Hello, [Name]" to open dropdown
    await this.accountDropdown.click();
    await this.page.waitForTimeout(300);
    
    // Click "Addresses" in dropdown
    await this.addressesMenuLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Click add new address button
   */
  async clickAddAddress() {
    await this.addAddressButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Fill address form
   * Fields observed on stampinup.com/account/address/create:
   * - First Name, Last Name, Address, Address 2, City, State (dropdown), ZIP Code, Phone Number
   * - Checkboxes: default shipping, default mailing
   * @param {Object} addressData 
   */
  async fillAddressForm(addressData) {
    // Name fields (required)
    if (addressData.firstName !== undefined) {
      await this.fillInput(this.firstNameInput, addressData.firstName);
    }
    
    if (addressData.lastName !== undefined) {
      await this.fillInput(this.lastNameInput, addressData.lastName);
    }
    
    // Address fields
    if (addressData.addressLine1 !== undefined) {
      await this.fillInput(this.addressLine1Input, addressData.addressLine1);
    }
    
    if (addressData.addressLine2 !== undefined && await this.addressLine2Input.isVisible()) {
      await this.fillInput(this.addressLine2Input, addressData.addressLine2);
    }
    
    if (addressData.city !== undefined) {
      await this.fillInput(this.cityInput, addressData.city);
    }
    
    // State dropdown
    if (addressData.state !== undefined) {
      if (await this.stateSelect.isVisible()) {
        await this.stateSelect.selectOption({ label: addressData.state });
      }
    }
    
    if (addressData.zipCode !== undefined) {
      await this.fillInput(this.zipCodeInput, addressData.zipCode);
    }
    
    // Phone number (required)
    if (addressData.phone !== undefined) {
      await this.fillInput(this.phoneInput, addressData.phone);
    }
    
    // Default address checkboxes
    if (addressData.isDefaultShipping === true && await this.defaultShippingCheckbox.isVisible()) {
      const isChecked = await this.defaultShippingCheckbox.isChecked();
      if (!isChecked) {
        await this.defaultShippingCheckbox.check();
      }
    }
    
    if (addressData.isDefaultMailing === true && await this.defaultMailingCheckbox.isVisible()) {
      const isChecked = await this.defaultMailingCheckbox.isChecked();
      if (!isChecked) {
        await this.defaultMailingCheckbox.check();
      }
    }
  }

  /**
   * Save address
   */
  async saveAddress() {
    await this.saveAddressButton.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Add a new address with full flow
   * Navigates directly to /account/address/create
   * @param {Object} addressData 
   */
  async addNewAddress(addressData) {
    await this.navigateToAddAddress(); // Direct URL: /account/address/create
    await this.fillAddressForm(addressData);
    await this.saveAddress();
  }

  /**
   * Get count of saved addresses
   * @returns {Promise<number>}
   */
  async getAddressCount() {
    await this.page.waitForTimeout(500); // Allow list to load
    return this.addressCards.count();
  }

  /**
   * Check if address book is empty
   * @returns {Promise<boolean>}
   */
  async isAddressBookEmpty() {
    const emptyVisible = await this.emptyAddressMessage.isVisible({ timeout: 2000 }).catch(() => false);
    const cardCount = await this.getAddressCount();
    return emptyVisible || cardCount === 0;
  }

  /**
   * Verify address was saved successfully
   */
  async verifyAddressSaved() {
    await expect(this.successMessage).toBeVisible({ timeout: 5000 });
  }

  /**
   * Verify ZIP code validation error
   */
  async verifyZipCodeValidationError() {
    const zipErrorVisible = await this.zipCodeError.isVisible({ timeout: 3000 }).catch(() => false);
    const generalErrorWithZip = await this.errorMessage.textContent()
      .then(text => text?.toLowerCase().includes('zip') || text?.toLowerCase().includes('postal'))
      .catch(() => false);
    
    expect(zipErrorVisible || generalErrorWithZip).toBeTruthy();
  }

  /**
   * Verify required field validation error
   * @param {'address' | 'city' | 'state' | 'zip'} fieldName 
   */
  async verifyRequiredFieldError(fieldName) {
    const errorMap = {
      address: this.addressLine1Error,
      city: this.cityError,
      state: this.stateError,
      zip: this.zipCodeError,
    };
    
    await expect(errorMap[fieldName]).toBeVisible({ timeout: 3000 });
  }

  /**
   * Edit an existing address by index (0-based)
   * @param {number} index 
   */
  async editAddressByIndex(index) {
    const addressCard = this.addressCards.nth(index);
    const editButton = addressCard.locator('button:has-text("Edit"), a:has-text("Edit"), [aria-label*="edit"]').first();
    await editButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Delete an address by index (0-based)
   * @param {number} index 
   */
  async deleteAddressByIndex(index) {
    const addressCard = this.addressCards.nth(index);
    const deleteButton = addressCard.locator('button:has-text("Delete"), button:has-text("Remove"), [aria-label*="delete"]').first();
    await deleteButton.click();
    
    // Handle confirmation dialog
    if (await this.confirmDeleteButton.isVisible({ timeout: 2000 })) {
      await this.confirmDeleteButton.click();
    }
    
    await this.page.waitForTimeout(1000);
  }

  /**
   * Set address as default by index
   * @param {number} index 
   */
  async setDefaultAddressByIndex(index) {
    const addressCard = this.addressCards.nth(index);
    const setDefaultBtn = addressCard.locator('button:has-text("Set as Default"), button:has-text("Make Default")').first();
    
    if (await setDefaultBtn.isVisible()) {
      await setDefaultBtn.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Get index of default address
   * @returns {Promise<number>}
   */
  async getDefaultAddressIndex() {
    const cards = await this.addressCards.all();
    
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const hasDefaultBadge = await card.locator('text=/default/i, .default-badge').isVisible();
      if (hasDefaultBadge) {
        return i;
      }
    }
    
    return -1; // No default found
  }

  /**
   * Verify only one default address exists
   */
  async verifyOnlyOneDefaultAddress() {
    const defaultBadges = await this.page.locator(
      '.address-card .default-badge, .address-item .default-badge, ' +
      '.address-card:has-text("Default"), .address-item:has-text("Default")'
    ).count();
    
    expect(defaultBadges).toBeLessThanOrEqual(1);
  }

  /**
   * Verify address appears in list with expected data
   * @param {Object} expectedData 
   */
  async verifyAddressInList(expectedData) {
    const addressText = await this.addressCards.first().textContent();
    
    if (expectedData.addressLine1) {
      expect(addressText).toContain(expectedData.addressLine1);
    }
    if (expectedData.city) {
      expect(addressText).toContain(expectedData.city);
    }
    if (expectedData.state) {
      expect(addressText?.toUpperCase()).toContain(expectedData.state.toUpperCase());
    }
    if (expectedData.zipCode) {
      expect(addressText).toContain(expectedData.zipCode);
    }
  }

  /**
   * Verify PO Box warning (if applicable)
   * @returns {Promise<boolean>}
   */
  async checkForPOBoxWarning() {
    const warning = this.page.locator('text=/PO Box|shipping restriction/i');
    return warning.isVisible({ timeout: 2000 }).catch(() => false);
  }
}

module.exports = { AddressPage };
