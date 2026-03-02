# Stampin' Up! E2E Test Suite

A comprehensive Playwright test suite for testing account creation, profile setup, and address management on www.stampinup.com.

## Project Structure

```
tests/
├── docs/
│   └── test-cases.md          # Detailed test case documentation
├── e2e/
│   ├── account-creation.spec.js       # Account registration tests (TC-ACC-001 to TC-ACC-008)
│   ├── address-setup.spec.js          # Address management tests (TC-ADD-001 to TC-ADD-004)
│   └── user-profile.spec.js           # Profile setup tests (TC-PRF-001 to TC-PRF-006)
├── fixtures/
│   └── test-data.js           # Test data factories and constants
├── pages/
│   ├── index.js               # Page object exports
│   ├── base.page.js           # Base page with common methods
│   ├── login.page.js          # Login page object
│   ├── signup.page.js         # Registration page object
│   ├── profile.page.js        # Profile settings page object
│   └── address.page.js        # Address book page object
├── sql/
│   └── sql-answers.md         # SQL interview questions and answers
└── README.md
```

## Site Behavior Notes (Observed)

### Account Creation Flow
- **Create Account is a MODAL POPUP** - Not a separate page
- Opens when clicking "Sign In" link in the header
- **Form Fields:**
  - First Name
  - Last Name
  - Email
  - Password (with strength indicator)
  - Confirm Password
- **Password Validation:**
  - Minimum 8 characters required
  - Shows strength indicator ("Weak" in red, etc.)
  - Error message: "The Password field must be at least 8 characters long."
- **After Successful Registration:**
  1. "Join Stampin' Rewards!" popup appears
     - Options: "GET STARTED" or "MAYBE LATER"
  2. Header displays "Hello, [FIRST NAME]" in top right corner
- **No Terms & Conditions checkbox** observed in the modal

### User Profile Setup Flow
- **Account Settings page is a DEDICATED PAGE** at `/account/settings`
- **Page header:** "MY ACCOUNT | [Full Name]"
- **Three main sections**, each with their own "EDIT" link:

**1. CONTACT Section (left side):**
- View mode shows: First Name, Last Name, Email, Phone Number, Preferred Method of Contact, Birthdate
- Edit mode: Fields become editable inputs
- Buttons: "SAVE CHANGES" (pink), "CANCEL"

**2. PASSWORD Section (below CONTACT):**
- Fields: Confirm Current Password, New Password, Confirm New Password
- Requirement: "Password must have a minimum of 8 characters with at least one capital letter and one number"
- Buttons: "SAVE CHANGES" (pink), "CANCEL"

**3. COUNTRY Section (right side):**
- View mode shows: Country with flag, Preferred Language
- Edit mode: Country dropdown, Preferred Language dropdown
- Buttons: "SAVE CHANGES" (pink), "CANCEL"


### Address Setup Flow
- **Address List page:** `/account/address`
- **Access:** Click "Hello, [Name]" dropdown in header > "Addresses"

**Address List Page (`/account/address`):**
- **DEFAULT SHIPPING ADDRESS** section with EDIT button (`address-list-default`)
- **DEFAULT MAILING ADDRESS** section with EDIT button (`mailing-address`)
  - If no default mailing: "Use My Shipping Address" button appears
- **Note:** Default addresses can only be edited, not deleted

**Add Address Form Fields:**
- First Name, Last Name, Address, Address 2 (optional), City, State, ZIP Code, Phone Number
- **Checkboxes:** "Make this my default shipping/mailing address"
- **Buttons:** "SAVE ADDRESS" (`address-save`), "CANCEL"

---

## Test Coverage

### Account Creation (TC-ACC-001 to TC-ACC-008)
- [x] TC-ACC-001: Successful account creation with valid data (verifies "Hello, [Name]" appears)
- [x] TC-ACC-002: Duplicate email validation
- [x] TC-ACC-003: Invalid email format validation
- [x] TC-ACC-004: Weak password validation (min 8 chars, strength indicator)
- [x] TC-ACC-005: Password mismatch validation
- [x] TC-ACC-006: Empty required fields validation
- [x] TC-ACC-007: Special characters in name fields
- [x] TC-ACC-008: Terms and conditions validation (may be skipped - no T&C checkbox observed)

### User Profile Setup (TC-PRF-001 to TC-PRF-006)
- [x] TC-PRF-001: Successful initial profile setup (CONTACT section edit)
- [x] TC-PRF-002: Email address change
- [x] TC-PRF-003: Cancel unsaved changes
- [x] TC-PRF-004: Required vs optional field identification
- [x] TC-PRF-005: Password change (PASSWORD section)
- [x] TC-PRF-006: Country change to France (COUNTRY section - verifies "Bonjour" greeting)

### Address Setup (TC-ADD-001 to TC-ADD-004)
Focus: Default Shipping and Default Mailing addresses only (cannot be deleted, only edited)

- [x] TC-ADD-001: Add new address as default shipping
- [x] TC-ADD-002: Edit default shipping address
- [x] TC-ADD-003: Edit default mailing address
- [x] TC-ADD-004: Use shipping address for default mailing address

## Setup

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install

# Install Playwright browsers
pnpm exec playwright install
```

### Environment Variables

Create a `.env.local` file for test credentials:

```env
TEST_USER_EMAIL=your_test_account@example.com
TEST_USER_PASSWORD=your_test_password
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests with UI mode (interactive)
pnpm test:ui

# Run tests in headed mode (see browser)
pnpm test:headed

# Run tests in debug mode
pnpm test:debug

# View test report
pnpm test:report
```

### Run Specific Test Suites

```bash
# Run only account creation tests
pnpm exec playwright test account-creation

# Run only profile tests
pnpm exec playwright test user-profile

# Run only address tests
pnpm exec playwright test address-setup
```

### Run on Specific Browsers

```bash
# Run on Chrome only
pnpm exec playwright test --project=chromium

# Run on Firefox only
pnpm exec playwright test --project=firefox
```

## Test Data

The test suite uses `@faker-js/faker` to generate realistic test data. Key test data utilities are in `tests/fixtures/test-data.js`:

- `generateValidUserData()` - Creates valid user registration data
- `generateValidUSAddress()` - Creates valid US address data
- `TestAddresses` - Pre-defined address scenarios (Texas, California, PO Box, Canada)
- `InvalidEmails`, `WeakPasswords`, `InvalidZipCodes` - Negative test data

## Page Object Model

The test suite follows the Page Object Model (POM) pattern:

- **BasePage** - Common functionality (navigation, wait helpers, cookie handling)
- **LoginPage** - Authentication methods
- **SignupPage** - Registration form interactions
- **ProfilePage** - Profile settings management
- **AddressPage** - Address book operations

