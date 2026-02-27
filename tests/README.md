# Stampin' Up! E2E Test Suite

A comprehensive Playwright test suite for testing account creation, profile setup, address management, and search functionality on www.stampinup.com.

## Project Structure

```
tests/
├── docs/
│   └── test-cases.md          # Detailed test case documentation
├── e2e/
│   ├── account-creation.spec.js       # Account registration tests (TC-ACC-001 to TC-ACC-008)
│   ├── address-setup.spec.js          # Address management tests (TC-ADD-001 to TC-ADD-009)
│   ├── search-query-persistence.spec.js # Search bug verification tests (TC-SEARCH-001 to TC-SEARCH-013)
│   └── user-profile.spec.js           # Profile setup tests (TC-PRF-001 to TC-PRF-006)
├── fixtures/
│   └── test-data.js           # Test data factories and constants
├── pages/
│   ├── index.js               # Page object exports
│   ├── base.page.js           # Base page with common methods
│   ├── login.page.js          # Login page object
│   ├── signup.page.js         # Registration page object
│   ├── profile.page.js        # Profile settings page object
│   ├── address.page.js        # Address book page object
│   └── search.page.js         # Search functionality page object
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
- [x] TC-PRF-001: Successful initial profile setup
- [x] TC-PRF-002: Invalid phone number validation
- [x] TC-PRF-003: Maximum length input handling
- [x] TC-PRF-004: Email address change
- [x] TC-PRF-005: Cancel unsaved changes
- [x] TC-PRF-006: Required vs optional field identification

### Address Setup (TC-ADD-001 to TC-ADD-009)
- [x] TC-ADD-001: Successful address setup
- [x] TC-ADD-002: Invalid ZIP code validation
- [x] TC-ADD-003: Missing required fields validation
- [x] TC-ADD-004: Multiple address support
- [x] TC-ADD-005: Default address management
- [x] TC-ADD-006: Edit existing address
- [x] TC-ADD-007: Delete address
- [x] TC-ADD-008: PO Box address handling
- [x] TC-ADD-009: International address support

### Search Query Persistence (TC-SEARCH-001 to TC-SEARCH-013)

> **Bug Found:** Search input field does not retain user's query after performing a search, impacting UX when users want to refine their searches.

- [x] TC-SEARCH-001: Search query not persisting after search (bug reproduction)
- [x] TC-SEARCH-002: Verify search input is not empty after search
- [x] TC-SEARCH-003: Direct URL navigation should pre-populate search input
- [x] TC-SEARCH-004: User search refinement workflow friction
- [x] TC-SEARCH-005: Search query with special characters persistence
- [x] TC-SEARCH-006: Multi-word search query persistence
- [x] TC-SEARCH-007: Search placeholder vs actual value verification
- [x] TC-SEARCH-008: Search via button vs Enter key consistency
- [x] TC-SEARCH-009: Search query persistence across page refresh
- [x] TC-SEARCH-010: Empty search handling
- [x] TC-SEARCH-011: Long search query handling
- [x] TC-SEARCH-012: Numeric search query persistence
- [x] TC-SEARCH-013: Industry standard comparison benchmark

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

# Run only search persistence tests (bug verification)
pnpm exec playwright test search-query-persistence
```

### Run on Specific Browsers

```bash
# Run on Chrome only
pnpm exec playwright test --project=chromium

# Run on Firefox only
pnpm exec playwright test --project=firefox

# Run on Mobile Chrome
pnpm exec playwright test --project=mobile-chrome
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
- **SearchPage** - Search input and results interactions

### Using Page Objects

```javascript
const { test } = require('@playwright/test');
const { SignupPage } = require('../pages');

test('example test', async ({ page }) => {
  const signupPage = new SignupPage(page);
  await signupPage.navigateToSignup();
  await signupPage.fillRegistrationForm({
    email: 'test@example.com',
    password: 'SecurePass123!',
    // ...
  });
  await signupPage.submitRegistration();
  await signupPage.verifyRegistrationSuccess();
});
```

## Configuration

Playwright configuration is in `playwright.config.js`:

- **Base URL**: https://www.stampinup.com
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Timeouts**: 60s test timeout, 15s action timeout
- **Retries**: 2 on CI, 0 locally
- **Artifacts**: Screenshots on failure, video on retry, trace on retry

## Reports

After running tests, view the HTML report:

```bash
pnpm test:report
```

Reports are generated in:
- `playwright-report/` - HTML report
- `test-results/results.json` - JSON results
- `test-results/screenshots/` - Failure screenshots

## Best Practices Demonstrated

1. **Page Object Model** - Encapsulated page interactions
2. **Data-Driven Testing** - Parameterized tests with multiple data sets
3. **Test Independence** - Each test can run independently
4. **Proper Assertions** - Clear expected outcomes
5. **Error Handling** - Graceful handling of dynamic elements
6. **Cross-Browser Testing** - Multi-browser configuration
7. **Mobile Testing** - Responsive viewport testing
8. **Test Documentation** - Comprehensive test case documentation

## Known Limitations

1. Tests target a live production site - some tests may require existing accounts
2. Email verification tests may need manual intervention
3. Rate limiting may affect rapid test execution
4. Some selectors may need adjustment based on site changes

## Troubleshooting

### Common Issues

**Tests failing on login:**
- Verify test credentials in environment variables
- Check if account exists on the live site

**Element not found:**
- Site structure may have changed
- Update selectors in page objects

**Timeout errors:**
- Increase timeout in playwright.config.ts
- Check network connectivity

### Debug Mode

Run tests in debug mode to step through:

```bash
pnpm test:debug
```

Use `await page.pause()` in tests to pause execution.

## Contributing

When adding new tests:

1. Add test case documentation to `tests/docs/test-cases.md`
2. Create or update page objects as needed
3. Follow existing naming conventions (TC-XXX-NNN)
4. Include positive and negative test scenarios
5. Use test data factories for dynamic data
