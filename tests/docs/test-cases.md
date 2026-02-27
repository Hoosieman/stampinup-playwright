# Stampin' Up! Test Cases Documentation

## Project Overview
**Application Under Test:** www.stampinup.com  
**Test Environment:** Production  
**Testing Framework:** Playwright  
**Document Version:** 1.0  
**Last Updated:** February 2026  

---

## Table of Contents
1. [Test Case Naming Convention](#test-case-naming-convention)
2. [Account Creation Test Cases](#1-account-creation-test-cases)
3. [User Profile Setup Test Cases](#2-user-profile-setup-test-cases)
4. [Address Setup Test Cases](#3-address-setup-test-cases)
5. [Search Query Persistence Test Cases](#4-search-query-persistence-test-cases)
6. [Traceability Matrix](#traceability-matrix)

---

## Test Case Naming Convention
- **TC-ACC-XXX:** Account Creation related test cases
- **TC-PRF-XXX:** Profile Setup related test cases
- **TC-ADD-XXX:** Address Setup related test cases
- **TC-SEARCH-XXX:** Search functionality related test cases

---

## 1. Account Creation Test Cases

> **SITE BEHAVIOR NOTES (Observed):**
> - Create Account is a **MODAL POPUP** (not a separate page)
> - Modal opens when clicking "Sign In" link in header
> - **Form Fields:** First Name, Last Name, Email, Password, Confirm Password
> - **Password Validation:** Minimum 8 characters, shows strength indicator ("Weak" in red)
> - **No Terms & Conditions checkbox** observed in modal
> - **After Successful Registration:**
>   1. "Join Stampin' Rewards!" popup appears with "GET STARTED" and "MAYBE LATER" buttons
>   2. Header displays "Hello, [FIRST NAME]" in top right corner

### TC-ACC-001: Successful Account Creation with Valid Data

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-ACC-001 |
| **Title** | Successful Account Creation with Valid Data |
| **Priority** | High |
| **Type** | Functional / Positive |
| **Preconditions** | 1. User has access to a valid email address not previously registered<br>2. User is on the Stampin' Up! homepage<br>3. User is not logged in |
| **Test Data** | - Email: unique_test_[timestamp]@example.com<br>- Password: TestPass123!<br>- First Name: John<br>- Last Name: Doe |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to www.stampinup.com | Homepage loads successfully |
| 2 | Click on "Sign In" link in the header | Create Account modal popup opens |
| 3 | Verify modal displays "CREATE ACCOUNT" heading | Modal shows registration form |
| 4 | Enter First Name in the "First Name" field | First name is accepted |
| 5 | Enter Last Name in the "Last Name" field | Last name is accepted |
| 6 | Enter valid email address in the "Email" field | Email is accepted without validation errors |
| 7 | Enter valid password (8+ chars) in "Password" field | Password is accepted; strength indicator improves |
| 8 | Re-enter password in "Confirm Password" field | Passwords match, no error displayed |
| 9 | Click "CREATE ACCOUNT" button | - Account is created successfully<br>- "Join Stampin' Rewards!" popup appears |
| 10 | Click "MAYBE LATER" or "GET STARTED" | Popup closes |
| 11 | Verify "Hello, [First Name]" appears in header | User is logged in and first name is displayed |

**Expected Result:** User account is created successfully, rewards popup appears, and user is logged in with "Hello, [Name]" displayed in header.

**Postconditions:** User account exists in the system and can be used for subsequent test cases.

---

### TC-ACC-002: Account Creation with Already Registered Email

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-ACC-002 |
| **Title** | Account Creation with Already Registered Email |
| **Priority** | High |
| **Type** | Functional / Negative |
| **Preconditions** | 1. An account with the test email already exists in the system<br>2. User is on the registration page |
| **Test Data** | - Email: existing_user@example.com (pre-registered)<br>- Password: TestPass123! |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to the registration page | Registration form is displayed |
| 2 | Enter an email address that is already registered | Email field accepts the input |
| 3 | Fill in all other required fields with valid data | All fields accept the input |
| 4 | Click "Create Account" button | - Error message is displayed indicating email is already registered<br>- User is prompted to sign in or reset password<br>- Account is NOT created |

**Expected Result:** System prevents duplicate account creation and displays appropriate error message.

---

### TC-ACC-003: Account Creation with Invalid Email Format

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-ACC-003 |
| **Title** | Account Creation with Invalid Email Format |
| **Priority** | High |
| **Type** | Functional / Negative |
| **Preconditions** | User is on the registration page |
| **Test Data** | Invalid email formats:<br>- "invalidemail"<br>- "invalid@"<br>- "@nodomain.com"<br>- "spaces in@email.com"<br>- "missing.domain@"<br>- "" (empty) |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to the registration page | Registration form is displayed |
| 2 | Enter invalid email format (e.g., "invalidemail") | Field accepts input |
| 3 | Move focus to next field or attempt to submit | - Validation error appears<br>- Error message indicates invalid email format<br>- Form submission is prevented |
| 4 | Repeat steps 2-3 with each invalid email format | Each invalid format triggers appropriate validation error |

**Expected Result:** System validates email format and prevents form submission with clear error messaging.

---

### TC-ACC-004: Account Creation with Weak Password

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-ACC-004 |
| **Title** | Account Creation with Weak Password |
| **Priority** | High |
| **Type** | Functional / Negative / Security |
| **Preconditions** | User is on the registration page |
| **Test Data** | Weak passwords:<br>- "123" (too short)<br>- "password" (common password)<br>- "abcdefgh" (no numbers/special chars)<br>- "12345678" (no letters) |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to the registration page | Registration form is displayed |
| 2 | Enter valid email address | Email is accepted |
| 3 | Enter weak password (e.g., "123") | Password field shows strength indicator as weak |
| 4 | Attempt to submit the form | - Validation error appears<br>- Error message indicates password requirements<br>- Form submission is prevented |
| 5 | Verify password requirements are displayed | Password requirements (min length, complexity) are visible |

**Expected Result:** System enforces password complexity requirements and provides clear feedback.

---

### TC-ACC-005: Account Creation with Password Mismatch

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-ACC-005 |
| **Title** | Account Creation with Password Mismatch |
| **Priority** | Medium |
| **Type** | Functional / Negative |
| **Preconditions** | User is on the registration page |
| **Test Data** | - Password: TestPass123!<br>- Confirm Password: DifferentPass456! |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to the registration page | Registration form is displayed |
| 2 | Enter valid email address | Email is accepted |
| 3 | Enter password in password field | Password is accepted |
| 4 | Enter different password in confirm password field | - Mismatch error appears<br>- Visual indicator shows passwords don't match |
| 5 | Attempt to submit the form | Form submission is prevented with clear error message |

**Expected Result:** System validates password confirmation and prevents mismatched passwords.

---

### TC-ACC-006: Account Creation with Empty Required Fields

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-ACC-006 |
| **Title** | Account Creation with Empty Required Fields |
| **Priority** | High |
| **Type** | Functional / Negative |
| **Preconditions** | User is on the registration page |
| **Test Data** | Leave all required fields empty |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to the registration page | Registration form is displayed |
| 2 | Leave all fields empty | Fields remain empty |
| 3 | Click "Create Account" button | - Validation errors appear for all required fields<br>- Error messages clearly indicate which fields are required<br>- Form submission is prevented |
| 4 | Verify each required field is highlighted/indicated | Required field indicators are visible |

**Expected Result:** System validates all required fields and provides specific error messages for each.

---

### TC-ACC-007: Account Creation with Special Characters in Name Fields

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-ACC-007 |
| **Title** | Account Creation with Special Characters in Name Fields |
| **Priority** | Medium |
| **Type** | Functional / Boundary |
| **Preconditions** | User is on the registration page |
| **Test Data** | - First Name: "Jean-Pierre"<br>- First Name: "Mary Ann"<br>- First Name: "O'Connor"<br>- Last Name: "Smith-Jones" |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to the registration page | Registration form is displayed |
| 2 | Enter name with hyphen (e.g., "Jean-Pierre") | Name is accepted |
| 3 | Enter name with space (e.g., "Mary Ann") | Name is accepted |
| 4 | Enter name with apostrophe (e.g., "O'Connor") | Name is accepted |
| 5 | Complete registration with valid data | Account is created successfully with correct name stored |

**Expected Result:** System accepts valid special characters in name fields (hyphens, apostrophes, spaces).

---

### TC-ACC-008: Account Creation - Terms and Conditions Validation

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-ACC-008 |
| **Title** | Account Creation without Accepting Terms and Conditions |
| **Priority** | High |
| **Type** | Functional / Negative / Compliance |
| **Preconditions** | User is on the registration page |
| **Test Data** | All valid data but T&C checkbox unchecked |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to the registration page | Registration form is displayed |
| 2 | Fill in all required fields with valid data | All fields populated |
| 3 | Ensure Terms and Conditions checkbox is NOT checked | Checkbox remains unchecked |
| 4 | Click "Create Account" button | - Error message appears indicating T&C must be accepted<br>- Form submission is prevented |
| 5 | Check the Terms and Conditions checkbox | Checkbox is selected |
| 6 | Click "Create Account" button | Account is created successfully |

**Expected Result:** System requires T&C acceptance before allowing account creation.

---

## 2. User Profile Setup Test Cases

> **SITE BEHAVIOR NOTES (Observed):**
> - Account Settings page is at `/account/settings` (dedicated page)
> - **Page Header:** "MY ACCOUNT | [Full Name]"
> - **Three main sections**, each with their own "EDIT" link:
>
> **1. CONTACT Section (left side):**
> - View mode shows: First Name, Last Name, Email, Phone Number, Preferred Method of Contact, Birthdate
> - Edit mode: Fields become editable inputs
> - Buttons: "SAVE CHANGES" (pink), "CANCEL"
>
> **2. PASSWORD Section (below CONTACT):**
> - Fields: Confirm Current Password, New Password, Confirm New Password
> - Requirement: "Password must have a minimum of 8 characters with at least one capital letter and one number"
> - Buttons: "SAVE CHANGES" (pink), "CANCEL"
>
> **3. COUNTRY Section (right side):**
> - View mode shows: Country with flag, Preferred Language
> - Edit mode: Country dropdown, Preferred Language dropdown
> - Buttons: "SAVE CHANGES" (pink), "CANCEL"
>
> - **Left sidebar:** ACCOUNT SETTINGS, ADDRESSES, PAYMENT, MY ORDERS, MY LISTS, SUBSCRIPTIONS, DEMONSTRATOR, REWARDS, NOTIFICATIONS, SIGN OUT

### TC-PRF-001: Successful Initial Profile Setup

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-PRF-001 |
| **Title** | Successful Initial Profile Setup for New User |
| **Priority** | High |
| **Type** | Functional / Positive |
| **Preconditions** | 1. User has created a new account (TC-ACC-001 passed)<br>2. User is logged into the account<br>3. User profile fields are empty/default |
| **Test Data** | - First Name: John<br>- Last Name: Doe<br>- Phone: (555) 123-4567<br>- Birthdate: 01/15/1990<br>- Preferred Method of Contact: Email |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /account/settings | Account Settings page loads with "MY ACCOUNT" header |
| 2 | Verify CONTACT section displays current info | First Name, Last Name, Email shown (from registration) |
| 3 | Click "EDIT" link next to CONTACT heading | CONTACT fields become editable |
| 4 | Enter Phone Number in "Phone Number" field | Phone number is accepted |
| 5 | Select "Preferred Method of Contact" from dropdown | Selection is made |
| 6 | Enter Birthdate in "Birthdate" field | Date is accepted |
| 7 | Click "SAVE CHANGES" button (pink) | - Success message is displayed<br>- Page returns to view mode<br>- Updated information is displayed |
| 8 | Refresh the page | Saved information persists |
| 9 | Verify all updated fields show new values | Phone, Contact Method, Birthdate are retained |

**Expected Result:** Profile information is saved and persists across page refreshes.

---

### TC-PRF-002: Profile Update with Invalid Phone Number

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-PRF-002 |
| **Title** | Profile Update with Invalid Phone Number Format |
| **Priority** | Medium |
| **Type** | Functional / Negative |
| **Preconditions** | User is logged in and on the profile settings page |
| **Test Data** | Invalid phone formats:<br>- "123" (too short)<br>- "abcdefghij" (letters)<br>- "123-456-789012345" (too long) |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Profile settings | Profile form is displayed |
| 2 | Enter invalid phone number (e.g., "123") | Field accepts input |
| 3 | Attempt to save profile | - Validation error appears<br>- Error indicates invalid phone format<br>- Save is prevented |
| 4 | Enter phone with letters | Validation error appears |
| 5 | Enter valid phone number | Field accepts and formats input |
| 6 | Save profile | Profile saves successfully |

**Expected Result:** System validates phone number format and provides clear error messaging.

---

### TC-PRF-003: Profile Update with Maximum Length Inputs

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-PRF-003 |
| **Title** | Profile Update with Maximum Length Inputs |
| **Priority** | Low |
| **Type** | Functional / Boundary |
| **Preconditions** | User is logged in and on the profile settings page |
| **Test Data** | - First Name: 50+ character string<br>- Last Name: 50+ character string |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Profile settings | Profile form is displayed |
| 2 | Enter very long first name (50+ characters) | - Field either truncates input OR<br>- Field accepts input with character limit indicator |
| 3 | Enter very long last name (50+ characters) | Same behavior as step 2 |
| 4 | Attempt to save profile | - If within limits: saves successfully<br>- If exceeds limits: validation error appears |

**Expected Result:** System handles maximum length inputs gracefully without crashing.

---

### TC-PRF-004: Profile Update - Email Change

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-PRF-004 |
| **Title** | Profile Update with Email Address Change |
| **Priority** | High |
| **Type** | Functional / Positive |
| **Preconditions** | User is logged in and on the profile settings page |
| **Test Data** | - Current Email: old_email@example.com<br>- New Email: new_email@example.com |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Profile/Account settings | Settings page loads |
| 2 | Locate email change section | Email field or change email option is visible |
| 3 | Enter new valid email address | Email is accepted |
| 4 | If required, enter current password for verification | Password is accepted |
| 5 | Click save/update | - Confirmation message appears<br>- Verification email sent to new address (if applicable)<br>- OR email is updated immediately |
| 6 | Verify email change in profile | New email is displayed |

**Expected Result:** Email address is updated successfully with appropriate verification steps.

---

### TC-PRF-005: Profile Update - Cancel Changes

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-PRF-005 |
| **Title** | Profile Update - Canceling Unsaved Changes |
| **Priority** | Medium |
| **Type** | Functional / Usability |
| **Preconditions** | User is logged in and on the profile settings page |
| **Test Data** | Modified profile data that will not be saved |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Profile settings | Profile form displays current data |
| 2 | Note the current values of profile fields | Current values recorded |
| 3 | Modify several profile fields | Fields show new values |
| 4 | Click "Cancel" button or navigate away without saving | - Confirmation dialog may appear (optional)<br>- Changes are discarded |
| 5 | Return to Profile settings | Original values are retained; unsaved changes are lost |

**Expected Result:** Unsaved changes are discarded when user cancels or navigates away.

---

### TC-PRF-006: Profile Setup - Required vs Optional Fields

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-PRF-006 |
| **Title** | Verify Required vs Optional Fields in Profile |
| **Priority** | Medium |
| **Type** | Functional / UI Verification |
| **Preconditions** | User is logged in and on the profile settings page |
| **Test Data** | N/A |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Profile settings | Profile form is displayed |
| 2 | Identify all form fields | All fields are visible |
| 3 | Check for required field indicators (asterisks, labels) | Required fields are clearly marked |
| 4 | Attempt to save with only optional fields filled | - If required fields exist: validation error<br>- If no required fields: saves successfully |
| 5 | Fill all required fields, leave optional fields empty | Profile saves successfully |

**Expected Result:** Required fields are clearly indicated and validated; optional fields can remain empty.

---

## 3. Address Setup Test Cases

> **SITE BEHAVIOR NOTES (Observed):**
> - Address page is a **DEDICATED PAGE** at `/account/address/create`
> - **Access:** Click "Hello, [Name]" dropdown in header > "Addresses"
> - **Left sidebar:** ACCOUNT SETTINGS, ADDRESSES, PAYMENT, MY ORDERS, MY LISTS, SUBSCRIPTIONS, DEMONSTRATOR, REWARDS, NOTIFICATIONS, SIGN OUT
>
> **Form Fields (all required except Address 2):**
> - First Name, Last Name (side by side)
> - Address (main street address)
> - Address 2 (optional - apt, suite, etc.)
> - City
> - State (dropdown)
> - ZIP Code
> - Phone Number
>
> **Checkboxes:**
> - "Make this my default shipping address"
> - "Make this my default mailing address"
>
> **Buttons:** "SAVE ADDRESS" (pink), "CANCEL"
>
> **Validation errors** appear in red below each field:
> - "The First Name field is required."
> - "The Last Name field is required."
> - "The Address field is required."
> - "The City field is required."
> - "The State field is required."
> - "The Zip Code field is required."
> - "The Phone Number field is required."

### TC-ADD-001: Successful Address Setup for New User

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-ADD-001 |
| **Title** | Successful Address Setup in Account Settings |
| **Priority** | High |
| **Type** | Functional / Positive |
| **Preconditions** | 1. User has created a new account<br>2. User is logged in<br>3. No addresses are saved in the account |
| **Test Data** | - First Name: John<br>- Last Name: Doe<br>- Address: 123 Main Street<br>- Address 2: Apt 4B<br>- City: Austin<br>- State: Texas<br>- ZIP Code: 78701<br>- Phone Number: 512-555-1234 |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /account/address/create | Add New Address page loads with form |
| 2 | Verify page heading shows "ADD NEW ADDRESS" | Form is displayed with empty fields |
| 3 | Enter First Name | Field accepts input |
| 4 | Enter Last Name | Field accepts input |
| 5 | Enter Address | Field accepts input |
| 6 | Enter Address 2 (optional) | Field accepts input |
| 7 | Enter City | Field accepts input |
| 8 | Select State from dropdown | State is selected |
| 9 | Enter ZIP Code | ZIP code is accepted |
| 10 | Enter Phone Number | Phone number is accepted |
| 11 | Check "Make this my default shipping address" | Checkbox is selected |
| 12 | Click "SAVE ADDRESS" button (pink) | - Success message is displayed<br>- Address is saved and visible in address list<br>- Address is marked as default |

**Expected Result:** Address is saved successfully and available for use in checkout.

**Postconditions:** Address exists in user's address book.

---

### TC-ADD-002: Address Setup with Invalid ZIP Code

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-ADD-002 |
| **Title** | Address Setup with Invalid ZIP Code Format |
| **Priority** | High |
| **Type** | Functional / Negative |
| **Preconditions** | User is logged in and on the add address page |
| **Test Data** | Invalid ZIP codes (US):<br>- "123" (too short)<br>- "ABCDE" (letters)<br>- "123456789" (too long)<br>- "12 345" (space in middle) |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Add Address form | Form is displayed |
| 2 | Fill in all fields with valid data except ZIP | Fields accept input |
| 3 | Enter invalid ZIP code (e.g., "123") | Field accepts input |
| 4 | Click "Save Address" | - Validation error appears<br>- Error indicates invalid ZIP code format<br>- Address is NOT saved |
| 5 | Enter valid ZIP code (e.g., "78701") | Field accepts input |
| 6 | Click "Save Address" | Address is saved successfully |

**Expected Result:** System validates ZIP code format based on selected country.

---

### TC-ADD-003: Address Setup with Missing Required Fields

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-ADD-003 |
| **Title** | Address Setup with Missing Required Fields |
| **Priority** | High |
| **Type** | Functional / Negative |
| **Preconditions** | User is logged in and on the add address page |
| **Test Data** | Partial address data - missing required fields |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /account/address/create | Form is displayed |
| 2 | Leave all fields empty and click "SAVE ADDRESS" | Validation errors appear for all required fields |
| 3 | Verify error messages appear | - "The First Name field is required."<br>- "The Last Name field is required."<br>- "The Address field is required."<br>- "The City field is required."<br>- "The State field is required."<br>- "The Zip Code field is required."<br>- "The Phone Number field is required." |
| 4 | Fill First Name only, click "SAVE ADDRESS" | First Name error clears, others remain |
| 5 | Fill all required fields | All fields populated |
| 6 | Click "SAVE ADDRESS" | Address is saved successfully |

**Expected Result:** System validates all required address fields individually with clear error messages.

---

### TC-ADD-004: Adding Multiple Addresses

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-ADD-004 |
| **Title** | Adding Multiple Addresses to Account |
| **Priority** | Medium |
| **Type** | Functional / Positive |
| **Preconditions** | 1. User is logged in<br>2. User has at least one address saved |
| **Test Data** | - Address 1: Home address (existing)<br>- Address 2: Work address (new)<br>- Address 3: Alternate address (new) |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Address Book | Existing address is displayed |
| 2 | Click "Add New Address" | Address form is displayed |
| 3 | Enter second address with different data | Form accepts input |
| 4 | Save address | - Second address is saved<br>- Both addresses visible in address book |
| 5 | Add third address | Third address appears in list |
| 6 | Verify all addresses are distinct and correctly saved | All addresses show correct information |

**Expected Result:** User can add and maintain multiple addresses in their account.

---

### TC-ADD-005: Setting Default Address

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-ADD-005 |
| **Title** | Setting and Changing Default Address |
| **Priority** | Medium |
| **Type** | Functional / Positive |
| **Preconditions** | User has multiple addresses saved in account |
| **Test Data** | Multiple existing addresses |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Address Book | Multiple addresses displayed |
| 2 | Identify current default address | Default address is indicated (badge/label) |
| 3 | Click "Set as Default" on a non-default address | Confirmation may appear |
| 4 | Confirm action if prompted | - Selected address becomes default<br>- Previous default is no longer marked as default |
| 5 | Verify only one default address exists | Only one address shows default indicator |

**Expected Result:** User can change default address; only one default address allowed at a time.

---

### TC-ADD-006: Edit Existing Address

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-ADD-006 |
| **Title** | Editing an Existing Address |
| **Priority** | High |
| **Type** | Functional / Positive |
| **Preconditions** | User has at least one address saved |
| **Test Data** | - Original: 123 Main Street<br>- Updated: 456 Oak Avenue |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Address Book | Addresses are displayed |
| 2 | Click "Edit" on existing address | Edit form opens with current address data |
| 3 | Verify all current data is pre-populated | All fields show current values |
| 4 | Modify Address Line 1 | Field accepts new value |
| 5 | Modify City | Field accepts new value |
| 6 | Click "Save" or "Update" | - Success message appears<br>- Updated address is displayed in list |
| 7 | Verify changes persisted | Edited address shows new values |

**Expected Result:** Existing addresses can be edited and changes are saved correctly.

---

### TC-ADD-007: Delete Address

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-ADD-007 |
| **Title** | Deleting an Address from Account |
| **Priority** | Medium |
| **Type** | Functional / Positive |
| **Preconditions** | User has multiple addresses saved (cannot delete if only one) |
| **Test Data** | Existing address to be deleted |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Address Book | Multiple addresses displayed |
| 2 | Note the total number of addresses | Count recorded |
| 3 | Click "Delete" or "Remove" on a non-default address | Confirmation dialog appears |
| 4 | Confirm deletion | - Address is removed<br>- Success message appears<br>- Address count decreases by 1 |
| 5 | Verify address no longer appears in list | Deleted address is gone |

**Expected Result:** Address is permanently deleted from the account.

---

### TC-ADD-008: Address Validation with PO Box

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-ADD-008 |
| **Title** | Address Setup with PO Box |
| **Priority** | Medium |
| **Type** | Functional / Edge Case |
| **Preconditions** | User is logged in and on add address page |
| **Test Data** | - Address Line 1: PO Box 12345<br>- City: Austin<br>- State: TX<br>- ZIP: 78701 |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Add Address form | Form is displayed |
| 2 | Enter "PO Box 12345" in Address Line 1 | Field accepts input |
| 3 | Complete remaining required fields | All fields populated |
| 4 | Click "Save Address" | - Address is saved OR<br>- Warning about PO Box shipping restrictions appears |
| 5 | If warning appears, verify it's informational | User can proceed with appropriate notice |

**Expected Result:** System handles PO Box addresses appropriately with any necessary warnings about shipping restrictions.

---

### TC-ADD-009: International Address Setup

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-ADD-009 |
| **Title** | International Address Setup |
| **Priority** | Medium |
| **Type** | Functional / Positive |
| **Preconditions** | User is logged in and international shipping is supported |
| **Test Data** | - Country: Canada<br>- Address: 789 Maple Road<br>- City: Toronto<br>- Province: Ontario<br>- Postal Code: M5V 1J1 |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Add Address form | Form is displayed |
| 2 | Select Country as "Canada" | - Country is selected<br>- Form may update to show Province instead of State<br>- Postal code format may change |
| 3 | Enter Canadian address details | Fields accept input |
| 4 | Enter Canadian postal code format (e.g., "M5V 1J1") | Postal code is accepted |
| 5 | Click "Save Address" | Address is saved successfully |

**Expected Result:** System supports international address formats with appropriate field labels and validation.

---

## 4. Search Query Persistence Test Cases

> **Note:** These test cases were created based on a discovered bug where the search input field does not retain the user's query after performing a search.

### TC-SEARCH-001: Search Query Not Persisting After Search (Bug Reproduction)

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-SEARCH-001 |
| **Title** | Search Query Should Persist in Input Field After Search |
| **Priority** | High |
| **Type** | Functional / Bug Verification |
| **Bug Status** | Open - Reported |
| **Preconditions** | 1. User is on the Stampin' Up! homepage<br>2. Search functionality is available |
| **Test Data** | Search term: "butterfly" |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to www.stampinup.com | Homepage loads successfully |
| 2 | Locate the search input field in the header | Search field is visible |
| 3 | Enter "butterfly" in the search field | Text appears in search field |
| 4 | Press Enter or click the search button | Search results page loads |
| 5 | Observe the search input field | **Expected:** Search field contains "butterfly"<br>**Actual (Bug):** Search field is empty |

**Expected Result:** After performing a search, the search input field should retain the search query so users can easily modify their search.

**Actual Result (Bug):** The search input field is cleared after the search is performed, forcing users to re-type their entire query if they want to refine it.

**Impact:** Poor user experience when users want to refine their search queries.

---

### TC-SEARCH-002: Verify Search Input Is Not Empty After Search

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-SEARCH-002 |
| **Title** | Search Input Should Display Current Query |
| **Priority** | High |
| **Type** | Functional / Positive |
| **Preconditions** | User is on the homepage |
| **Test Data** | Search term: "stamps" |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to homepage | Page loads |
| 2 | Enter "stamps" in search field | Text entered |
| 3 | Submit search | Results page loads |
| 4 | Check search input value | Input should contain "stamps", not be empty |
| 5 | Check input is not showing placeholder text | Actual value present, not placeholder |

**Expected Result:** Search input displays the current search term, not placeholder or empty.

---

### TC-SEARCH-003: Direct URL Navigation Should Pre-populate Search Input

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-SEARCH-003 |
| **Title** | URL Query Parameter Should Pre-populate Search Field |
| **Priority** | Medium |
| **Type** | Functional / Positive |
| **Preconditions** | None |
| **Test Data** | URL: stampinup.com/search?q=flowers |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate directly to search URL with query parameter | Search results page loads |
| 2 | Observe search input field | Search input should contain "flowers" |
| 3 | Verify results match the query | Results are relevant to "flowers" |

**Expected Result:** When navigating directly to a search URL, the search input should be pre-populated with the query from the URL.

---

### TC-SEARCH-004: User Search Refinement Workflow

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-SEARCH-004 |
| **Title** | User Should Be Able to Refine Search Without Retyping |
| **Priority** | High |
| **Type** | Functional / Usability |
| **Preconditions** | User is on homepage |
| **Test Data** | Initial: "card" → Refined: "card making" |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Search for "card" | Results for "card" appear |
| 2 | Verify "card" is in search input | Search field contains "card" |
| 3 | Click at end of search input | Cursor is placed in field |
| 4 | Add " making" to existing text | Search field shows "card making" |
| 5 | Submit refined search | Results for "card making" appear |

**Expected Result:** User can easily refine search by modifying existing query without retyping.

---

### TC-SEARCH-005: Search Query with Special Characters

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-SEARCH-005 |
| **Title** | Search Query with Special Characters Should Persist |
| **Priority** | Medium |
| **Type** | Functional / Edge Case |
| **Preconditions** | User is on homepage |
| **Test Data** | Search terms: "mother's day", "red & blue", "50% off" |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Search for "mother's day" | Results appear |
| 2 | Verify search input contains "mother's day" | Apostrophe preserved in input |
| 3 | Search for "red & blue" | Results appear |
| 4 | Verify search input contains "red & blue" | Ampersand preserved in input |

**Expected Result:** Special characters in search queries are preserved in the input field after search.

---

### TC-SEARCH-006: Multi-word Search Query Persistence

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-SEARCH-006 |
| **Title** | Multi-word Queries Should Fully Persist |
| **Priority** | High |
| **Type** | Functional / Positive |
| **Preconditions** | User is on homepage |
| **Test Data** | Search term: "happy birthday card stamps" |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter "happy birthday card stamps" in search | Text entered |
| 2 | Submit search | Results page loads |
| 3 | Verify entire phrase is in search input | All four words present in input |
| 4 | Verify no truncation occurred | Complete phrase visible |

**Expected Result:** Multi-word search queries are fully retained without truncation.

---

### TC-SEARCH-007: Search Placeholder vs Actual Value

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-SEARCH-007 |
| **Title** | Distinguish Between Placeholder Text and Search Value |
| **Priority** | Medium |
| **Type** | Functional / UI Verification |
| **Preconditions** | User is on homepage |
| **Test Data** | Search term: "ink pads" |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Observe search input before any interaction | Placeholder text may be visible (e.g., "Search...") |
| 2 | Note placeholder styling (usually lighter color) | Placeholder styling observed |
| 3 | Search for "ink pads" | Search performed |
| 4 | Observe search input styling | Text should be in normal value styling, not placeholder styling |
| 5 | Verify input.value equals "ink pads" | Programmatic value check passes |

**Expected Result:** After search, the input shows an actual value (not placeholder) with appropriate styling.

---

### TC-SEARCH-008: Search via Button vs Enter Key

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-SEARCH-008 |
| **Title** | Query Persistence Should Work for Both Search Methods |
| **Priority** | Medium |
| **Type** | Functional / Positive |
| **Preconditions** | User is on homepage |
| **Test Data** | Search term: "embossing" |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter "embossing" and press Enter key | Search results appear |
| 2 | Verify "embossing" in search input | Query persists |
| 3 | Clear search and enter "embossing" again | Text entered |
| 4 | Click search button instead of Enter | Search results appear |
| 5 | Verify "embossing" in search input | Query persists regardless of submit method |

**Expected Result:** Search query persists regardless of whether user pressed Enter or clicked the search button.

---

### TC-SEARCH-009: Search Query Persistence Across Page Refresh

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-SEARCH-009 |
| **Title** | Search Query Should Persist After Page Refresh |
| **Priority** | Medium |
| **Type** | Functional / Positive |
| **Preconditions** | User has performed a search |
| **Test Data** | Search term: "washi tape" |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Search for "washi tape" | Results page loads |
| 2 | Verify URL contains search parameter | URL shows ?q=washi+tape or similar |
| 3 | Refresh the page (F5 or Ctrl+R) | Page reloads |
| 4 | Verify search input still contains "washi tape" | Query persists after refresh |
| 5 | Verify results are still displayed | Same results shown |

**Expected Result:** Search query and results persist after page refresh.

---

### TC-SEARCH-010: Empty Search Handling

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-SEARCH-010 |
| **Title** | Empty Search Should Not Display False Query |
| **Priority** | Low |
| **Type** | Functional / Edge Case |
| **Preconditions** | User is on homepage |
| **Test Data** | Empty string |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click search input but enter nothing | Field is focused but empty |
| 2 | Press Enter or click search button | - Search is prevented OR<br>- All products shown OR<br>- Error message appears |
| 3 | Observe search input | Input should be empty, not show random value |

**Expected Result:** Empty searches are handled gracefully; input remains empty.

---

### TC-SEARCH-011: Long Search Query Handling

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-SEARCH-011 |
| **Title** | Long Search Queries Should Be Handled Properly |
| **Priority** | Low |
| **Type** | Functional / Boundary |
| **Preconditions** | User is on homepage |
| **Test Data** | 100+ character search string |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter a very long search query (100+ characters) | Input accepts or truncates appropriately |
| 2 | Submit search | Search is performed |
| 3 | Verify input contains the query | Full or truncated query visible |
| 4 | Verify no UI breakage | Search input doesn't overflow or break layout |

**Expected Result:** Long queries are handled without breaking the UI.

---

### TC-SEARCH-012: Numeric Search Query Persistence

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-SEARCH-012 |
| **Title** | Numeric Search Queries Should Persist |
| **Priority** | Low |
| **Type** | Functional / Edge Case |
| **Preconditions** | User is on homepage |
| **Test Data** | Search term: "12345" (product number) |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter "12345" in search field | Numbers entered |
| 2 | Submit search | Results page loads |
| 3 | Verify "12345" is in search input | Numeric query persists |

**Expected Result:** Numeric-only search queries persist like text queries.

---

### TC-SEARCH-013: Industry Standard Comparison

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-SEARCH-013 |
| **Title** | Search Behavior Should Match Industry Standards |
| **Priority** | Medium |
| **Type** | Usability / Benchmark |
| **Preconditions** | Access to comparison sites |
| **Test Data** | Same search term across multiple sites |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Perform search on Amazon.com | Query persists in search input |
| 2 | Perform search on Target.com | Query persists in search input |
| 3 | Perform search on Etsy.com | Query persists in search input |
| 4 | Perform same search on stampinup.com | Query should persist (currently does not) |
| 5 | Document the deviation from standard | Bug report references industry standards |

**Expected Result:** Stampin' Up! search should follow the same UX pattern as major e-commerce sites.

---

## Traceability Matrix

| Requirement | Test Cases | Priority |
|-------------|------------|----------|
| User Registration | TC-ACC-001 through TC-ACC-008 | High |
| Email Validation | TC-ACC-002, TC-ACC-003, TC-PRF-004 | High |
| Password Security | TC-ACC-004, TC-ACC-005 | High |
| Profile Management | TC-PRF-001 through TC-PRF-006 | High/Medium |
| Address Management | TC-ADD-001 through TC-ADD-009 | High/Medium |
| Data Validation | TC-ACC-003, TC-ACC-006, TC-ADD-002, TC-ADD-003 | High |
| Default Settings | TC-ADD-005 | Medium |
| CRUD Operations | TC-ADD-001, TC-ADD-006, TC-ADD-007 | High |
| Search Functionality | TC-SEARCH-001 through TC-SEARCH-013 | High/Medium |
| Search Query Persistence (Bug) | TC-SEARCH-001, TC-SEARCH-002, TC-SEARCH-004 | High |
| Search UX Standards | TC-SEARCH-009, TC-SEARCH-013 | Medium |

---

## Test Execution Notes

### Environment Requirements
- Supported browsers: Chrome (latest), Firefox (latest), Safari (latest), Edge (latest)
- Screen resolutions: 1920x1080, 1366x768, Mobile (375x667)
- Network conditions: Standard broadband

### Test Data Management
- Use unique timestamps for email generation to avoid conflicts
- Clean up test accounts after test suite completion when possible
- Use realistic but fake data for all PII fields

### Known Limitations
- Tests require a live site connection
- Some tests may require manual email verification
- Rate limiting may affect rapid test execution

---

*Document prepared for QA Technical Assessment*
*Stampin' Up! E-commerce Platform Testing*
