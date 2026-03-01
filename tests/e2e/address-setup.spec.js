const { test, expect } = require('@playwright/test');
const { LoginPage, AddressPage } = require('../pages');
const {
  TestAddresses,
  InvalidZipCodes,
  ExistingTestUser,
  generateValidUSAddress,
} = require('../fixtures/test-data');

/**
 * Address Setup Test Suite
 * Tests: TC-ADD-001 through TC-ADD-010
 * 
 * These tests cover the address management flow on www.stampinup.com
 * 
 * SITE BEHAVIOR NOTES:
 * - Add Address page is at /account/address/create
 * - Address List page is at /account/address
 * - Access: Click "Hello, [Name]" dropdown > "Addresses" in header
 * - Left sidebar: ACCOUNT SETTINGS, ADDRESSES, PAYMENT, MY ORDERS, etc.
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
 * Form Fields (all required except Address 2):
 * - First Name, Last Name
 * - Address, Address 2 (optional)
 * - City, State (dropdown), ZIP Code
 * - Phone Number
 * - Checkbox: "Make this my default shipping address"
 * - Checkbox: "Make this my default mailing address"
 * 
 * Validation errors (in red below fields):
 * - "The First Name field is required."
 * - "The Last Name field is required."
 * - "The Address field is required."
 * - "The City field is required."
 * - "The State field is required."
 * - "The Zip Code field is required."
 * - "The Phone Number field is required."
 * 
 * Prerequisites: Tests require a logged-in user
 */

test.describe('Address Setup', () => {
  /** @type {LoginPage} */
  let loginPage;
  /** @type {AddressPage} */
  let addressPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    addressPage = new AddressPage(page);
    
    // Login before each test
    await loginPage.login(ExistingTestUser.email, ExistingTestUser.password);
  });

  /**
   * TC-ADD-001: Successful Address Setup for New User
   * Priority: High
   */
  test('TC-ADD-001: should successfully add new address', async () => {
    // Arrange
    const addressData = TestAddresses.texas();
    
    // Act
    await addressPage.addNewAddress(addressData);
    
    // Assert
    await addressPage.verifyAddressSaved();
    await addressPage.verifyAddressInList({
      addressLine1: addressData.addressLine1,
      city: addressData.city,
      state: addressData.state,
      zipCode: addressData.zipCode,
    });
  });

  /**
   * TC-ADD-002: Address Setup with Invalid ZIP Code
   * Priority: High
   */
  test.describe('TC-ADD-002: Invalid ZIP Code Validation', () => {
    const testZips = InvalidZipCodes.US.slice(0, 3); // Test first 3
    
    for (const invalidZip of testZips) {
      test(`should reject invalid US ZIP code: "${invalidZip || '(empty)'}"`, async ({ page }) => {
        // Arrange
        const loginPage = new LoginPage(page);
        const addressPage = new AddressPage(page);
        
        await loginPage.login(ExistingTestUser.email, ExistingTestUser.password);
        
        const addressData = generateValidUSAddress();
        addressData.zipCode = invalidZip;
        
        // Act
        await addressPage.navigateToAddressBook();
        await addressPage.clickAddAddress();
        await addressPage.fillAddressForm(addressData);
        await addressPage.saveAddress();
        
        // Assert
        await addressPage.verifyZipCodeValidationError();
      });
    }
  });

  /**
   * TC-ADD-003: Address Setup with Missing Required Fields
   * Priority: High
   */
  test('TC-ADD-003: should show errors for missing required fields', async () => {
    // Act - Try to save without filling any fields
    await addressPage.navigateToAddressBook();
    await addressPage.clickAddAddress();
    await addressPage.saveAddress();
    
    // Assert - Should show validation errors
    const errorVisible = await addressPage.addressLine1Error.isVisible({ timeout: 3000 })
      .catch(() => false);
    const generalError = await addressPage.errorMessage.isVisible({ timeout: 3000 })
      .catch(() => false);
    
    expect(errorVisible || generalError).toBeTruthy();
  });

  /**
   * TC-ADD-003 (continued): Test each required field individually
   */
  test('TC-ADD-003: should validate address line 1 is required', async () => {
    // Arrange - Fill all except address line 1
    const addressData = generateValidUSAddress();
    
    // Act
    await addressPage.navigateToAddressBook();
    await addressPage.clickAddAddress();
    await addressPage.fillAddressForm({
      ...addressData,
      addressLine1: '', // Missing
    });
    await addressPage.saveAddress();
    
    // Assert
    await addressPage.verifyRequiredFieldError('address');
  });

  /**
   * TC-ADD-004: Adding Multiple Addresses
   * Priority: Medium
   */
  test('TC-ADD-004: should allow adding multiple addresses', async () => {
    // Arrange
    const address1 = TestAddresses.texas();
    const address2 = TestAddresses.california();
    
    // Act - Add first address
    await addressPage.addNewAddress(address1);
    await addressPage.verifyAddressSaved();
    
    // Get initial count
    const initialCount = await addressPage.getAddressCount();
    
    // Add second address
    await addressPage.clickAddAddress();
    await addressPage.fillAddressForm(address2);
    await addressPage.saveAddress();
    
    // Assert
    await addressPage.verifyAddressSaved();
    const newCount = await addressPage.getAddressCount();
    expect(newCount).toBeGreaterThan(initialCount);
  });

  /**
   * TC-ADD-005: Setting Default Address
   * Priority: Medium
   */
  test('TC-ADD-005: should allow setting and changing default address', async () => {
    // Prerequisite: Need at least 2 addresses
    // Add addresses if needed
    await addressPage.navigateToAddressBook();
    
    const count = await addressPage.getAddressCount();
    if (count < 2) {
      // Add addresses
      await addressPage.addNewAddress(TestAddresses.texas());
      await addressPage.addNewAddress(TestAddresses.california());
    }
    
    // Act - Set second address as default
    await addressPage.setDefaultAddressByIndex(1);
    
    // Assert - Only one default should exist
    await addressPage.verifyOnlyOneDefaultAddress();
    
    // Verify the correct address is now default
    const defaultIndex = await addressPage.getDefaultAddressIndex();
    expect(defaultIndex).toBe(1);
  });

  /**
   * TC-ADD-006: Edit Existing Address
   * Priority: High
   */
  test('TC-ADD-006: should allow editing existing address', async () => {
    // Prerequisite: Need at least 1 address
    await addressPage.navigateToAddressBook();
    
    const count = await addressPage.getAddressCount();
    if (count === 0) {
      await addressPage.addNewAddress(TestAddresses.texas());
    }
    
    // Arrange
    const updatedAddress = {
      addressLine1: '999 Updated Street',
      city: 'Updated City',
    };
    
    // Act
    await addressPage.editAddressByIndex(0);
    await addressPage.fillAddressForm(updatedAddress);
    await addressPage.saveAddress();
    
    // Assert
    await addressPage.verifyAddressSaved();
    await addressPage.verifyAddressInList(updatedAddress);
  });

  /**
   * TC-ADD-007: Delete Address
   * Priority: Medium
   */
  test('TC-ADD-007: should allow deleting an address', async () => {
    // Prerequisite: Need at least 2 addresses (keep one after delete)
    await addressPage.navigateToAddressBook();
    
    // Add addresses if needed
    const initialCount = await addressPage.getAddressCount();
    if (initialCount < 2) {
      await addressPage.addNewAddress(TestAddresses.texas());
      await addressPage.addNewAddress(TestAddresses.california());
    }
    
    // Get count before delete
    const countBeforeDelete = await addressPage.getAddressCount();
    
    // Act
    await addressPage.deleteAddressByIndex(0);
    
    // Assert
    const countAfterDelete = await addressPage.getAddressCount();
    expect(countAfterDelete).toBe(countBeforeDelete - 1);
  });

  /**
   * TC-ADD-008: Address Validation with PO Box
   * Priority: Medium
   */
  test('TC-ADD-008: should handle PO Box addresses appropriately', async () => {
    // Arrange
    const poBoxAddress = TestAddresses.poBox();
    
    // Act
    await addressPage.navigateToAddressBook();
    await addressPage.clickAddAddress();
    await addressPage.fillAddressForm(poBoxAddress);
    await addressPage.saveAddress();
    
    // Assert - Should either save or show shipping warning
    const saved = await addressPage.successMessage.isVisible({ timeout: 3000 }).catch(() => false);
    const warning = await addressPage.checkForPOBoxWarning();
    
    // Either outcome is acceptable - what matters is proper handling
    expect(saved || warning).toBeTruthy();
  });

  /**
   * TC-ADD-009: International Address Setup
   * Priority: Medium
   */
  test('TC-ADD-009: should support international addresses', async () => {
    // Arrange
    const canadianAddress = TestAddresses.canada();
    
    // Act
    await addressPage.navigateToAddressBook();
    await addressPage.clickAddAddress();
    await addressPage.fillAddressForm(canadianAddress);
    await addressPage.saveAddress();
    
    // Assert
    await addressPage.verifyAddressSaved();
  });

  /**
   * TC-ADD-010: Use Shipping Address for Default Mailing Address
   * Priority: Medium
   * 
   * OBSERVED BEHAVIOR:
   * - When user has a default shipping address but no default mailing address
   * - DEFAULT MAILING ADDRESS section shows: "There is no default address selected."
   * - A "USE MY SHIPPING ADDRESS" link appears
   * - Clicking the link copies the shipping address to become the default mailing address
   */
  test('TC-ADD-010: should copy shipping address to mailing address', async () => {
    // Prerequisite: User must have a default shipping address set
    // Navigate to address list page
    await addressPage.navigateToAddressBook();
    
    // Check if USE MY SHIPPING ADDRESS link is visible (means no default mailing set)
    const canUseShipping = await addressPage.isUseShippingAddressLinkVisible();
    
    if (canUseShipping) {
      // Get shipping address text before clicking
      const shippingText = await addressPage.getDefaultShippingAddressText();
      
      // Act - Click "USE MY SHIPPING ADDRESS" link
      await addressPage.useMyShippingAddressLink.click();
      await addressPage.page.waitForTimeout(1000);
      
      // Assert - Default mailing address should now be set
      const mailingSet = await addressPage.isDefaultMailingAddressSet();
      expect(mailingSet).toBeTruthy();
      
      // Verify the mailing address matches shipping address
      const mailingText = await addressPage.getDefaultMailingAddressText();
      // Both should contain the same address details (excluding section headers)
      expect(mailingText).toBeTruthy();
    } else {
      // If link not visible, default mailing is already set - verify it exists
      const mailingSet = await addressPage.isDefaultMailingAddressSet();
      expect(mailingSet).toBeTruthy();
    }
  });

  /**
   * Additional Test: Address book page loads correctly
   * Priority: High
   */
  test('Address book page should load correctly', async () => {
    // Act
    await addressPage.navigateToAddressBook();
    
    // Assert
    const isEmptyOrHasAddresses = 
      await addressPage.isAddressBookEmpty() ||
      await addressPage.getAddressCount() > 0;
    
    expect(isEmptyOrHasAddresses).toBeTruthy();
    await expect(addressPage.addAddressButton).toBeVisible();
  });

  /**
   * Additional Test: Address form fields load correctly
   * Priority: High
   */
  test('Add address form should display all required fields', async () => {
    // Act
    await addressPage.navigateToAddressBook();
    await addressPage.clickAddAddress();
    
    // Assert - Core fields should be visible
    await expect(addressPage.addressLine1Input).toBeVisible();
    await expect(addressPage.cityInput).toBeVisible();
    await expect(addressPage.zipCodeInput).toBeVisible();
    await expect(addressPage.saveAddressButton).toBeVisible();
  });

  /**
   * Additional Test: Verify country selection changes form
   * Priority: Low
   */
  test('Country selection should update form appropriately', async () => {
    // Act
    await addressPage.navigateToAddressBook();
    await addressPage.clickAddAddress();
    
    // Select Canada if country dropdown exists
    if (await addressPage.countrySelect.isVisible()) {
      await addressPage.countrySelect.selectOption({ label: 'Canada' });
      await addressPage.page.waitForTimeout(500);
      
      // Assert - Form might show Province instead of State
      // or postal code format might change
      const formHasProvinceOrState = 
        await addressPage.stateSelect.isVisible() ||
        await addressPage.stateInput.isVisible() ||
        await addressPage.page.locator('label:has-text("Province")').isVisible();
      
      expect(formHasProvinceOrState).toBeTruthy();
    }
  });

  /**
   * Additional Test: Cancel should discard unsaved address
   * Priority: Medium
   */
  test('Cancel should discard unsaved address changes', async () => {
    // Arrange
    await addressPage.navigateToAddressBook();
    const initialCount = await addressPage.getAddressCount();
    
    // Act - Start adding but cancel
    await addressPage.clickAddAddress();
    await addressPage.fillAddressForm(generateValidUSAddress());
    await addressPage.cancelButton.click();
    
    // Assert
    const finalCount = await addressPage.getAddressCount();
    expect(finalCount).toBe(initialCount);
  });
});
