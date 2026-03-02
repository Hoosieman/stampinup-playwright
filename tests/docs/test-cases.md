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
5. [Traceability Matrix](#traceability-matrix)

---

## Test Case Naming Convention
- **TC-ACC-XXX:** Account Creation related test cases
- **TC-PRF-XXX:** Profile Setup related test cases
- **TC-ADD-XXX:** Address Setup related test cases

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

### TC-ADD-001: Add New Address as Default Shipping

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-ADD-001 |
| **Title** | Add New Address as Default Shipping Address |
| **Priority** | High |
| **Preconditions** | 1. User is logged in<br>2. User navigates to Addresses via "Hello, [Name]" dropdown |
| **Test Data** | - First Name: John<br>- Last Name: Doe<br>- Address: 123 Main Street<br>- City: Austin<br>- State: Texas<br>- ZIP Code: 78701<br>- Phone Number: 512-555-1234 |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in and click "Hello, [Name]" > "Addresses" | Address page loads |
| 2 | Fill in address form fields | All fields accept input |
| 3 | Check "Make this my default shipping address" | Checkbox is selected |
| 4 | Click "SAVE ADDRESS" button | Address is saved |
| 5 | Verify address appears in default shipping section | Address text visible in address-list-default |

**Expected Result:** Address is saved and displayed in the default shipping address section.

---

### TC-ADD-002: Edit Default Shipping Address

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-ADD-002 |
| **Title** | Edit Default Shipping Address |
| **Priority** | High |
| **Preconditions** | User is logged in and has a default shipping address |
| **Test Data** | Updated city name |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Address Book | Address page loads with default shipping address |
| 2 | Click Edit button on default shipping address | Edit form opens with current data |
| 3 | Update the city field | Field accepts new value |
| 4 | Click "SAVE ADDRESS" | Address is updated |
| 5 | Verify updated city appears in shipping section | New city visible in address list |

**Expected Result:** Default shipping address can be edited and changes are saved.

**Note:** Default addresses cannot be deleted, only edited.

---

### TC-ADD-003: Edit Default Mailing Address

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-ADD-003 |
| **Title** | Edit Default Mailing Address |
| **Priority** | High |
| **Preconditions** | User is logged in and has a default mailing address |
| **Test Data** | Updated city name |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Address Book | Address page loads with default mailing address |
| 2 | Click Edit button on default mailing address | Edit form opens with current data |
| 3 | Update the city field | Field accepts new value |
| 4 | Click "SAVE ADDRESS" | Address is updated |
| 5 | Verify updated city appears in mailing section | New city visible in mailing-address section |

**Expected Result:** Default mailing address can be edited and changes are saved.

**Note:** Default addresses cannot be deleted, only edited.

---

### TC-ADD-004: Use Shipping Address for Default Mailing Address

| Field | Description |
|-------|-------------|
| **Test Case ID** | TC-ADD-004 |
| **Title** | Copy Shipping Address to Default Mailing Address |
| **Priority** | Medium |
| **Preconditions** | 1. User is logged in<br>2. User has a default shipping address set |
| **Test Data** | Existing shipping address |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Address Book | Address list page loads |
| 2 | Verify "Use My Shipping Address" button is visible | Button is clickable |
| 3 | Click "Use My Shipping Address" button | Button is clicked |
| 4 | Verify mailing address section is populated | Mailing address section shows address data |

**Expected Result:** Clicking "Use My Shipping Address" copies the default shipping address to become the default mailing address.

---


