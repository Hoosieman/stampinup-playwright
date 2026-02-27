const { expect } = require('@playwright/test');
const { BasePage } = require('./base.page');

/**
 * Page Object Model for Address Book/Address Settings Page
 * Covers: TC-ADD-001 through TC-ADD-009
 */
class AddressPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page 
   */
  constructor(page) {
    super(page);
    
    // Navigation
    this.addressBookLink = page.locator(
      'a:has-text("Address Book"), a:has-text("Addresses"), ' +
      'a:has-text("Shipping Address"), a[href*="address"]'
    ).first();
    
    this.addAddressButton = page.locator(
      'button:has-text("Add Address"), button:has-text("Add New Address"), ' +
      'a:has-text("Add Address"), [data-testid="add-address"]'
    ).first();
    
    // Address form inputs
    this.addressLine1Input = page.locator(
      'input[name*="address1" i], input[name*="addressLine1" i], input[name*="street" i], ' +
      'input[id*="address1" i], input[placeholder*="address line 1" i], ' +
      'input[placeholder*="street address" i]'
    ).first();
    
    this.addressLine2Input = page.locator(
      'input[name*="address2" i], input[name*="addressLine2" i], input[name*="apt" i], ' +
      'input[id*="address2" i], input[placeholder*="address line 2" i], ' +
      'input[placeholder*="apt" i], input[placeholder*="suite" i]'
    ).first();
    
    this.cityInput = page.locator(
      'input[name*="city" i], input[id*="city" i], input[placeholder*="city" i]'
    ).first();
    
    this.stateSelect = page.locator(
      'select[name*="state" i], select[name*="province" i], select[name*="region" i], ' +
      'select[id*="state" i], [role="combobox"][aria-label*="state" i]'
    ).first();
    
    this.stateInput = page.locator(
      'input[name*="state" i], input[name*="province" i], ' +
      'input[id*="state" i], input[placeholder*="state" i]'
    ).first();
    
    this.zipCodeInput = page.locator(
      'input[name*="zip" i], input[name*="postal" i], input[name*="postcode" i], ' +
      'input[id*="zip" i], input[placeholder*="zip" i], input[placeholder*="postal" i]'
    ).first();
    
    this.countrySelect = page.locator(
      'select[name*="country" i], select[id*="country" i], ' +
      '[role="combobox"][aria-label*="country" i]'
    ).first();
    
    this.phoneInput = page.locator(
      'input[type="tel"], input[name*="phone" i], input[id*="phone" i]'
    ).first();
    
    this.addressNicknameInput = page.locator(
      'input[name*="nickname" i], input[name*="label" i], input[name*="name" i]:not([name*="firstName"]):not([name*="lastName"]), ' +
      'input[placeholder*="nickname" i], input[placeholder*="address name" i]'
    ).first();
    
    // Address type
    this.shippingAddressRadio = page.locator(
      'input[type="radio"][value*="shipping" i], input[type="radio"][name*="type"][value*="ship" i], ' +
      'label:has-text("Shipping") input[type="radio"]'
    ).first();
    
    this.billingAddressRadio = page.locator(
      'input[type="radio"][value*="billing" i], input[type="radio"][name*="type"][value*="bill" i], ' +
      'label:has-text("Billing") input[type="radio"]'
    ).first();
    
    this.defaultAddressCheckbox = page.locator(
      'input[type="checkbox"][name*="default" i], input[type="checkbox"][id*="default" i], ' +
      'label:has-text("default") input[type="checkbox"], label:has-text("primary") input[type="checkbox"]'
    ).first();
    
    // Action buttons
    this.saveAddressButton = page.locator(
      'button:has-text("Save Address"), button:has-text("Save"), ' +
      'button:has-text("Add Address"), input[type="submit"][value*="Save" i]'
    ).first();
    
    this.cancelButton = page.locator(
      'button:has-text("Cancel"), a:has-text("Cancel")'
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
   */
  async navigateToAddressBook() {
    await this.goto('/account');
    await this.waitForPageLoad();
    await this.closeModalIfPresent();
    
    // Find and click address book link
    if (await this.addressBookLink.isVisible({ timeout: 5000 })) {
      await this.addressBookLink.click();
      await this.waitForPageLoad();
    }
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
   * @param {Object} addressData 
   */
  async fillAddressForm(addressData) {
    if (addressData.country !== undefined && await this.countrySelect.isVisible()) {
      await this.countrySelect.selectOption({ label: addressData.country });
      await this.page.waitForTimeout(300); // Wait for form to update based on country
    }
    
    if (addressData.addressLine1 !== undefined) {
      await this.fillInput(this.addressLine1Input, addressData.addressLine1);
    }
    
    if (addressData.addressLine2 !== undefined && await this.addressLine2Input.isVisible()) {
      await this.fillInput(this.addressLine2Input, addressData.addressLine2);
    }
    
    if (addressData.city !== undefined) {
      await this.fillInput(this.cityInput, addressData.city);
    }
    
    // Handle state - could be select or input depending on country
    if (addressData.state !== undefined) {
      if (await this.stateSelect.isVisible()) {
        await this.stateSelect.selectOption({ label: addressData.state });
      } else if (await this.stateInput.isVisible()) {
        await this.fillInput(this.stateInput, addressData.state);
      }
    }
    
    if (addressData.zipCode !== undefined) {
      await this.fillInput(this.zipCodeInput, addressData.zipCode);
    }
    
    if (addressData.phone !== undefined && await this.phoneInput.isVisible()) {
      await this.fillInput(this.phoneInput, addressData.phone);
    }
    
    if (addressData.nickname !== undefined && await this.addressNicknameInput.isVisible()) {
      await this.fillInput(this.addressNicknameInput, addressData.nickname);
    }
    
    if (addressData.isDefault === true && await this.defaultAddressCheckbox.isVisible()) {
      const isChecked = await this.defaultAddressCheckbox.isChecked();
      if (!isChecked) {
        await this.defaultAddressCheckbox.check();
      }
    }
    
    if (addressData.addressType === 'shipping' && await this.shippingAddressRadio.isVisible()) {
      await this.shippingAddressRadio.check();
    } else if (addressData.addressType === 'billing' && await this.billingAddressRadio.isVisible()) {
      await this.billingAddressRadio.check();
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
   * @param {Object} addressData 
   */
  async addNewAddress(addressData) {
    await this.navigateToAddressBook();
    await this.clickAddAddress();
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
