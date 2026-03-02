const { expect } = require('@playwright/test');
const { BasePage } = require('./base.page');

/**
 * Page Object Model for Address Book/Address Settings Page
 * Covers: TC-ADD-001 through TC-ADD-004
 * 
 * Focus: Default Shipping and Default Mailing addresses only
 * Note: Default addresses can only be edited, not deleted
 * 
 * ACCESS: Click "Hello, [Name]" dropdown > "Addresses" in header
 * 
 * ADDRESS LIST PAGE (/account/address):
 * - DEFAULT SHIPPING ADDRESS section with EDIT button
 * - DEFAULT MAILING ADDRESS section with EDIT button or "Use My Shipping Address" button
 * 
 * ADD ADDRESS FORM Fields:
 * - First Name, Last Name, Address, Address 2 (optional), City, State, ZIP Code, Phone
 * - Checkboxes: "Make this my default shipping/mailing address"
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
    
    // Navigation - Account dropdown menu items (using role selectors from codegen)
    this.accountDropdown = page.getByRole('button', { name: /Hello\s*,/i });
    this.addressesMenuLink = page.getByRole('menuitem', { name: 'Addresses' });
    

    
    // Add new address button - only visible AFTER first address is added
    // When adding the first address, the form fields are already displayed
    this.addNewAddressButton = page.getByTestId('btn-create');
    
    // "Use My Shipping Address" button - copies shipping to mailing address
    this.useMyShippingAddressButton = page.getByRole('button', { name: 'Use My Shipping Address' });
    // Edit buttons for default addresses - using data-testid from codegen
    // Note: Default addresses cannot be deleted, only edited
    this.shippingAddressEditButton = page.getByTestId('address-list-default').getByTestId('addresslist-item-btn-edit');
    this.mailingAddressEditButton = page.getByTestId('mailing-address').getByTestId('addresslist-item-btn-edit');
    
    // Form fields - using data-testid selectors from Playwright codegen
    this.firstNameInput = page.getByTestId('address-field-first-name');
    this.lastNameInput = page.getByTestId('address-field-last-name');
    this.addressLine1Input = page.getByTestId('address.addressLine1');
    this.addressLine2Input = page.getByTestId('address-field-addressLine2');
    this.cityInput = page.getByTestId('address-field-city');
    this.stateSelect = page.getByTestId('autocomplete-field-div'); // State dropdown
    this.zipCodeInput = page.getByTestId('address-field-postalCode');
    this.phoneInput = page.getByTestId('address-telephone');
    
    // Default address checkboxes - using codegen selectors
    this.defaultShippingCheckbox = page.locator('div').filter({ hasText: /^Make this my default shipping address$/ }).nth(4);
    this.defaultMailingCheckbox = page.locator('div').filter({ hasText: /^Make this my default mailing address$/ }).nth(4);
    
    // Action buttons - using data-testid
    this.saveAddressButton = page.getByTestId('address-save');
    this.cancelButton = page.getByTestId('cancelButton');
    
    // Default address list - for verifying address was saved
    this.defaultAddressList = page.getByTestId('address-list-default');
    this.mailingAddressSection = page.getByTestId('mailing-address');
  }

  /**
   * Navigate to address book page
   * Assumes user is already logged in
   * Path: Click "Hello, [Name]" button > "Addresses" menuitem
   */
  async navigateToAddressBook() {
    // Click "Hello, [Name]" button to open dropdown
    await this.accountDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await this.accountDropdown.click();
    await this.page.waitForTimeout(500);
    
    // Click "Addresses" menuitem in dropdown
    await this.addressesMenuLink.waitFor({ state: 'visible', timeout: 5000 });
    await this.addressesMenuLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Navigate to Add New Address form
   * Note: When adding first address, form fields are already visible on address page
   * When adding additional addresses, need to click "btn-create" button first
   */
  async navigateToAddAddress() {
    await this.navigateToAddressBook();
    // Check if "Add New Address" button exists (means user already has addresses)
    // If so, click it. If not, form is already visible for first address
    const addButtonVisible = await this.addNewAddressButton.isVisible({ timeout: 2000 }).catch(() => false);
    if (addButtonVisible) {
      await this.addNewAddressButton.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Navigate via account dropdown menu
   * Click "Hello, [Name]" button > then "Addresses" menuitem
   */
  async navigateViaDropdown() {
    await this.goto('/');
    await this.waitForPageLoad();
    
    // Click "Hello, [Name]" button to open dropdown
    await this.accountDropdown.waitFor({ state: 'visible', timeout: 5000 });
    await this.accountDropdown.click();
    await this.page.waitForTimeout(500);
    
    // Click "Addresses" menuitem in dropdown
    await this.addressesMenuLink.waitFor({ state: 'visible', timeout: 3000 });
    await this.addressesMenuLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Click add new address button (only works after first address is added)
   */
  async clickAddAddress() {
    await this.addNewAddressButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.addNewAddressButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Fill address form
   * Fields on stampinup.com/account/address/create using data-testid selectors
   * @param {Object} addressData 
   */
  async fillAddressForm(addressData) {
    // Name fields (required)
    if (addressData.firstName !== undefined) {
      await this.firstNameInput.click();
      await this.firstNameInput.fill(addressData.firstName);
    }
    
    if (addressData.lastName !== undefined) {
      await this.lastNameInput.click();
      await this.lastNameInput.fill(addressData.lastName);
    }
    
    // Address fields
    if (addressData.addressLine1 !== undefined) {
      await this.addressLine1Input.click();
      await this.addressLine1Input.fill(addressData.addressLine1);
    }
    
    if (addressData.addressLine2 !== undefined) {
      await this.addressLine2Input.click();
      await this.addressLine2Input.fill(addressData.addressLine2);
    }
    
    if (addressData.city !== undefined) {
      await this.cityInput.click();
      await this.cityInput.fill(addressData.city);
    }
    
    // State dropdown (Vuetify autocomplete) - click to open, then select option
    if (addressData.state !== undefined) {
      await this.stateSelect.click();
      await this.page.waitForTimeout(500);
      // Click on the state option from the dropdown list
      const stateOption = this.page.getByRole('option', { name: addressData.state });
      await stateOption.waitFor({ state: 'visible', timeout: 3000 });
      await stateOption.click();
      await this.page.waitForTimeout(300);
    }
    
    if (addressData.zipCode !== undefined) {
      await this.zipCodeInput.click();
      await this.zipCodeInput.fill(addressData.zipCode);
    }
    
    // Phone number (required)
    if (addressData.phone !== undefined) {
      await this.phoneInput.click();
      await this.phoneInput.fill(addressData.phone);
    }
    
    // Default address checkboxes (click the ripple element)
    if (addressData.isDefaultShipping === true) {
      await this.defaultShippingCheckbox.click();
    }
    
    if (addressData.isDefaultMailing === true) {
      await this.defaultMailingCheckbox.click();
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
   * Click "Use My Shipping Address" button to copy shipping address to mailing address
   */
  async useShippingAddressForMailing() {
    await this.navigateToAddressBook();
    await this.useMyShippingAddressButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.useMyShippingAddressButton.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Verify "Use My Shipping Address" button is visible
   * @returns {Promise<boolean>}
   */
  async isUseShippingAddressButtonVisible() {
    return this.useMyShippingAddressButton.isVisible({ timeout: 3000 }).catch(() => false);
  }

  /**
   * Verify address was saved by checking it appears in the default address list
   * @param {string} addressText - Part of the address to look for (e.g., street name or city)
   */
  async verifyAddressSaved(addressText) {
    const addressInList = this.defaultAddressList.getByText(addressText);
    await expect(addressInList).toBeVisible({ timeout: 5000 });
  }



  /**
   * Edit the default shipping address
   * Note: Default addresses can only be edited, not deleted
   */
  async editDefaultShippingAddress() {
    await this.shippingAddressEditButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.shippingAddressEditButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Edit the default mailing address
   * Note: Default addresses can only be edited, not deleted
   */
  async editDefaultMailingAddress() {
    await this.mailingAddressEditButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.mailingAddressEditButton.click();
    await this.page.waitForTimeout(500);
  }
}

module.exports = { AddressPage };
