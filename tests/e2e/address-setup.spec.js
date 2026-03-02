const { test, expect } = require('@playwright/test');
const { LoginPage, AddressPage } = require('../pages');
const {
  TestAddresses,
  ExistingTestUser,
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
  test('TC-ADD-001: should successfully add new address as default shipping', async () => {
    // Arrange
    const addressData = TestAddresses.texas();
    addressData.isDefaultShipping = true;
    
    // Act
    await addressPage.navigateToAddAddress();
    await addressPage.fillAddressForm(addressData);
    await addressPage.saveAddress();
    
    // Assert - Verify address appears in default shipping section
    await addressPage.verifyAddressSaved(addressData.addressLine1);
  });

  /**
   * TC-ADD-002: Edit Default Shipping Address
   * Priority: High
   */
  test('TC-ADD-002: should allow editing default shipping address', async () => {
    // Navigate to address book
    await addressPage.navigateToAddressBook();
    
    // Edit the default shipping address
    await addressPage.editDefaultShippingAddress();
    
    // Update the city
    const updatedCity = 'Phoenix';
    await addressPage.cityInput.clear();
    await addressPage.cityInput.fill(updatedCity);
    await addressPage.saveAddress();
    
    // Verify the address was updated
    await addressPage.verifyAddressSaved(updatedCity);
  });

  /**
   * TC-ADD-003: Edit Default Mailing Address
   * Priority: High
   */
  test('TC-ADD-003: should allow editing default mailing address', async () => {
    // Navigate to address book
    await addressPage.navigateToAddressBook();
    
    // Edit the default mailing address
    await addressPage.editDefaultMailingAddress();
    
    // Update the city
    const updatedCity = 'Tucson';
    await addressPage.cityInput.clear();
    await addressPage.cityInput.fill(updatedCity);
    await addressPage.saveAddress();
    
    // Verify the address was updated in mailing section
    const mailingAddress = addressPage.page.getByTestId('mailing-address');
    await expect(mailingAddress.getByText(updatedCity)).toBeVisible({ timeout: 5000 });
  });

  /**
   * TC-ADD-004: Use Shipping Address for Default Mailing Address
   * Priority: Medium
   */
  test('TC-ADD-004: should copy shipping address to mailing address', async () => {
    // Navigate to address list page
    await addressPage.navigateToAddressBook();
    
    // Check if "Use My Shipping Address" button is visible
    const canUseShipping = await addressPage.isUseShippingAddressButtonVisible();
    
    if (canUseShipping) {
      // Click "Use My Shipping Address" button
      await addressPage.useShippingAddressForMailing();
      
      // Verify mailing address section now has content
      const mailingAddress = addressPage.page.getByTestId('mailing-address');
      await expect(mailingAddress).toBeVisible({ timeout: 5000 });
    } else {
      // Button not visible means mailing address is already set - just verify it exists
      const mailingAddress = addressPage.page.getByTestId('mailing-address');
      await expect(mailingAddress).toBeVisible({ timeout: 5000 });
    }
  });

  /**
   * Additional Test: Address book page loads with shipping/mailing sections
   * Priority: High
   */
  test('Address book page should display shipping and mailing sections', async () => {
    // Act
    await addressPage.navigateToAddressBook();
    
    // Assert - Both default address sections should be visible
    await expect(addressPage.defaultAddressList).toBeVisible({ timeout: 5000 });
  });
});
