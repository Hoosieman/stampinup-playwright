const { expect } = require('@playwright/test');
const { BasePage } = require('./base.page');

/**
 * Page Object Model for Address Book/Address Settings Page
 * Covers: TC-ADD-001 through TC-ADD-010
 * 
 * SITE BEHAVIOR NOTES (Observed):
 * - Add Address page is at /account/address/create
 * - Address List page is at /account/address
 * - Access: Click "Hello, [Name]" dropdown > "Addresses" in header
 * - Left sidebar navigation: ACCOUNT SETTINGS, ADDRESSES, PAYMENT, MY ORDERS, MY LISTS, 
 *   SUBSCRIPTIONS, DEMONSTRATOR, REWARDS, NOTIFICATIONS, SIGN OUT
 * 
 * ADDRESS LIST PAGE (/account/address):
 * - Note: "Updates made on this page don't apply to your subscriptions..."
 * - DEFAULT SHIPPING ADDRESS section (left) with EDIT link
 * - DEFAULT MAILING ADDRESS section (right):
 *   - If no default: "There is no default address selected." with "USE MY SHIPPING ADDRESS" link
 *   - If set: Shows address with EDIT link
 * - OTHER SAVED ADDRESSES section
 * - "+ ADD NEW ADDRESS" button
 * 
 * ADD ADDRESS FORM Fields (all required except Address 2):
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
    
    // Navigation - Account dropdown menu items (using role selectors from codegen)
    this.accountDropdown = page.getByRole('button', { name: /Hello\s*,/i });
    this.addressesMenuLink = page.getByRole('menuitem', { name: 'Addresses' });
    
    // Left sidebar navigation
    this.sidebarAccountSettings = page.locator('text="ACCOUNT SETTINGS", a:has-text("Account Settings")').first();
    this.sidebarAddresses = page.locator('text="ADDRESSES", a:has-text("Addresses")').first();
    this.sidebarPayment = page.locator('text="PAYMENT", a:has-text("Payment")').first();
    this.sidebarMyOrders = page.locator('text="MY ORDERS", a:has-text("My Orders")').first();
    this.sidebarSignOut = page.locator('text="SIGN OUT", a:has-text("Sign Out")').first();
    
    // Add new address button - only visible AFTER first address is added
    // When adding the first address, the form fields are already displayed
    this.addNewAddressButton = page.getByTestId('btn-create');
    
    // Address list page elements (observed at /account/address)
    this.defaultShippingAddressSection = page.locator('text="DEFAULT SHIPPING ADDRESS"').first();
    this.defaultMailingAddressSection = page.locator('text="DEFAULT MAILING ADDRESS"').first();
    this.noDefaultMailingMessage = page.locator('text="There is no default address selected."').first();
    this.useMyShippingAddressLink = page.locator(
      'a:has-text("USE MY SHIPPING ADDRESS"), button:has-text("USE MY SHIPPING ADDRESS")'
    ).first();
    this.otherSavedAddressesSection = page.locator('text="OTHER SAVED ADDRESSES"').first();
    this.shippingAddressEditLink = page.locator(
      'section:has-text("DEFAULT SHIPPING ADDRESS") a:has-text("EDIT"), ' +
      'div:has-text("DEFAULT SHIPPING ADDRESS") a:has-text("EDIT")'
    ).first();
    this.mailingAddressEditLink = page.locator(
      'section:has-text("DEFAULT MAILING ADDRESS") a:has-text("EDIT"), ' +
      'div:has-text("DEFAULT MAILING ADDRESS") a:has-text("EDIT")'
    ).first();
    
    // Form fields - using data-testid selectors from Playwright codegen
    this.firstNameInput = page.getByTestId('address-field-first-name');
    this.lastNameInput = page.getByTestId('address-field-last-name');
    this.addressLine1Input = page.getByTestId('address.addressLine1');
    this.addressLine2Input = page.getByTestId('address-field-addressLine2');
    this.cityInput = page.getByTestId('address-field-city');
    this.stateSelect = page.getByTestId('autocomplete-field-div'); // State dropdown
    this.zipCodeInput = page.getByTestId('address-field-postalCode');
    this.phoneInput = page.getByTestId('address-telephone');
    
    // Default address checkboxes (Vuetify ripple elements)
    this.defaultShippingCheckbox = page.locator('.v-input--selection-controls__ripple').first();
    this.defaultMailingCheckbox = page.locator('div:nth-child(5) > .col > .v-input > .v-input__control > .v-input__slot > .v-input--selection-controls__input > .v-input--selection-controls__ripple');
    
    // Action buttons - using data-testid
    this.saveAddressButton = page.getByTestId('address-save');
    this.cancelButton = page.getByTestId('cancelButton');
    
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
    
    // Address list elements - using data-testid from codegen
    // To verify address was added, check that address text appears in the default address list
    this.defaultAddressList = page.getByTestId('address-list-default');
    
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
   * Click "USE MY SHIPPING ADDRESS" link to copy shipping address to mailing address
   * TC-ADD-010: Use shipping address for default mailing address
   */
  async useShippingAddressForMailing() {
    await this.navigateToAddressBook();
    await this.useMyShippingAddressLink.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Verify "USE MY SHIPPING ADDRESS" link is visible (when no default mailing set)
   * @returns {Promise<boolean>}
   */
  async isUseShippingAddressLinkVisible() {
    return this.useMyShippingAddressLink.isVisible({ timeout: 3000 }).catch(() => false);
  }

  /**
   * Verify default mailing address is set (no "USE MY SHIPPING ADDRESS" link visible)
   * @returns {Promise<boolean>}
   */
  async isDefaultMailingAddressSet() {
    const noDefaultMsg = await this.noDefaultMailingMessage.isVisible({ timeout: 2000 }).catch(() => false);
    return !noDefaultMsg;
  }

  /**
   * Get default shipping address text
   * @returns {Promise<string>}
   */
  async getDefaultShippingAddressText() {
    const section = this.page.locator('section:has-text("DEFAULT SHIPPING ADDRESS"), div:has-text("DEFAULT SHIPPING ADDRESS")').first();
    return section.textContent();
  }

  /**
   * Get default mailing address text
   * @returns {Promise<string>}
   */
  async getDefaultMailingAddressText() {
    const section = this.page.locator('section:has-text("DEFAULT MAILING ADDRESS"), div:has-text("DEFAULT MAILING ADDRESS")').first();
    return section.textContent();
  }

  /**
   * Verify address was saved successfully by checking it appears in the default address list
   * Note: Site does not show success/error messages - verify by checking address appears in list
   * @param {string} addressText - Part of the address to look for (e.g., street name)
   */
  async verifyAddressSaved(addressText) {
    // After saving, we should be back on the address list page
    // Verify the address appears in the default address list
    const addressInList = this.defaultAddressList.getByText(addressText);
    await expect(addressInList).toBeVisible({ timeout: 5000 });
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
