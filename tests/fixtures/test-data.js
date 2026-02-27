const { faker } = require('@faker-js/faker');

/**
 * Test Data Factory
 * Generates realistic test data for Stampin' Up! E2E tests
 */

/**
 * Generate unique email for testing
 * Uses timestamp to ensure uniqueness
 * @returns {string}
 */
function generateUniqueEmail() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `test_user_${timestamp}_${random}@testmail.com`;
}

/**
 * Generate valid password meeting typical requirements
 * - At least 8 characters
 * - Contains uppercase, lowercase, number, and special character
 * @returns {string}
 */
function generateValidPassword() {
  return `Test${faker.string.alphanumeric(4)}@${faker.number.int({ min: 100, max: 999 })}`;
}

/**
 * Generate valid user registration data
 * @returns {Object}
 */
function generateValidUserData() {
  const password = generateValidPassword();
  return {
    email: generateUniqueEmail(),
    password,
    confirmPassword: password,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    phone: faker.phone.number('###-###-####'),
    acceptTerms: true,
  };
}

/**
 * Pre-defined test users for specific scenarios
 */
const TestUsers = {
  // Valid new user for registration
  newUser: () => generateValidUserData(),
  
  // User with special characters in name
  specialCharName: () => ({
    ...generateValidUserData(),
    firstName: "Jean-Pierre",
    lastName: "O'Connor-Smith",
  }),
  
  // User with maximum length inputs
  maxLengthUser: () => ({
    ...generateValidUserData(),
    firstName: faker.string.alpha(50),
    lastName: faker.string.alpha(50),
  }),
};

/**
 * Invalid email formats for negative testing
 */
const InvalidEmails = [
  'invalidemail',
  'invalid@',
  '@nodomain.com',
  'spaces in@email.com',
  'missing.domain@',
  '',
  'double@@email.com',
  '.startswithdot@email.com',
];

/**
 * Weak passwords for negative testing
 */
const WeakPasswords = [
  '123',           // Too short
  'password',      // Common password
  'abcdefgh',      // No numbers or special chars
  '12345678',      // No letters
  'Password',      // No numbers or special chars
  'pass',          // Too short
];

/**
 * Generate valid US address
 * NOTE: stampinup.com address form requires firstName and lastName
 * @returns {Object}
 */
function generateValidUSAddress() {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    addressLine1: faker.location.streetAddress(),
    addressLine2: `Apt ${faker.number.int({ min: 1, max: 999 })}`,
    city: faker.location.city(),
    state: faker.location.state(),
    zipCode: faker.location.zipCode('#####'),
    country: 'United States',
    phone: faker.phone.number('###-###-####'),
    isDefaultShipping: false,
    isDefaultMailing: false,
  };
}

/**
 * Pre-defined test addresses
 * NOTE: All addresses include firstName and lastName as required by stampinup.com
 */
const TestAddresses = {
  // Valid US address
  validUS: () => generateValidUSAddress(),
  
  // Address in Texas (specific for testing)
  texas: () => ({
    firstName: 'John',
    lastName: 'Smith',
    addressLine1: '123 Main Street',
    addressLine2: 'Suite 100',
    city: 'Austin',
    state: 'Texas',
    zipCode: '78701',
    country: 'United States',
    phone: '512-555-1234',
    isDefaultShipping: true,
    isDefaultMailing: false,
  }),
  
  // Address in California
  california: () => ({
    firstName: 'Jane',
    lastName: 'Doe',
    addressLine1: '456 Oak Avenue',
    city: 'Los Angeles',
    state: 'California',
    zipCode: '90001',
    country: 'United States',
    phone: '310-555-5678',
    isDefaultShipping: false,
    isDefaultMailing: false,
  }),
  
  // PO Box address
  poBox: () => ({
    firstName: 'Bob',
    lastName: 'Wilson',
    addressLine1: 'PO Box 12345',
    city: 'Houston',
    state: 'Texas',
    zipCode: '77001',
    country: 'United States',
    phone: '713-555-0000',
    isDefaultShipping: false,
    isDefaultMailing: false,
  }),
  
  // Canadian address
  canada: () => ({
    firstName: 'Sarah',
    lastName: 'Johnson',
    addressLine1: '789 Maple Road',
    city: 'Toronto',
    state: 'Ontario',
    zipCode: 'M5V 1J1',
    country: 'Canada',
    phone: '416-555-9012',
    isDefaultShipping: false,
    isDefaultMailing: false,
  }),
  
  // Minimal required fields only
  minimal: () => ({
    firstName: 'Test',
    lastName: 'User',
    addressLine1: '100 Test Street',
    city: 'New York',
    state: 'New York',
    zipCode: '10001',
    country: 'United States',
    phone: '212-555-1111',
    isDefaultShipping: false,
    isDefaultMailing: false,
  }),
};

/**
 * Invalid ZIP codes for negative testing
 */
const InvalidZipCodes = {
  US: [
    '123',           // Too short
    'ABCDE',         // Letters
    '123456789',     // Too long
    '12 345',        // Space in middle
    '1234',          // 4 digits
    '',              // Empty
  ],
  Canada: [
    '123',           // Wrong format
    'M5V1J1',        // No space (might be valid)
    '12345',         // US format
    'AAAAAA',        // Invalid letters
  ],
};

/**
 * Generate profile update data
 * @returns {Object}
 */
function generateProfileUpdateData() {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    phone: faker.phone.number('(###) ###-####'),
  };
}

/**
 * Invalid phone numbers for negative testing
 */
const InvalidPhoneNumbers = [
  '123',              // Too short
  'abcdefghij',       // Letters
  '123-456-789012345', // Too long
  '',                 // Empty
  '555',              // Too short
];

/**
 * Test credentials for existing user scenarios
 * Note: In real tests, these would be environment variables or test fixtures
 */
const ExistingTestUser = {
  email: process.env.TEST_USER_EMAIL || 'existing_test_user@example.com',
  password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
};

/**
 * State abbreviations mapping
 */
const StateAbbreviations = {
  'Alabama': 'AL',
  'Alaska': 'AK',
  'Arizona': 'AZ',
  'Arkansas': 'AR',
  'California': 'CA',
  'Colorado': 'CO',
  'Connecticut': 'CT',
  'Delaware': 'DE',
  'Florida': 'FL',
  'Georgia': 'GA',
  'Hawaii': 'HI',
  'Idaho': 'ID',
  'Illinois': 'IL',
  'Indiana': 'IN',
  'Iowa': 'IA',
  'Kansas': 'KS',
  'Kentucky': 'KY',
  'Louisiana': 'LA',
  'Maine': 'ME',
  'Maryland': 'MD',
  'Massachusetts': 'MA',
  'Michigan': 'MI',
  'Minnesota': 'MN',
  'Mississippi': 'MS',
  'Missouri': 'MO',
  'Montana': 'MT',
  'Nebraska': 'NE',
  'Nevada': 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  'Ohio': 'OH',
  'Oklahoma': 'OK',
  'Oregon': 'OR',
  'Pennsylvania': 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  'Tennessee': 'TN',
  'Texas': 'TX',
  'Utah': 'UT',
  'Vermont': 'VT',
  'Virginia': 'VA',
  'Washington': 'WA',
  'West Virginia': 'WV',
  'Wisconsin': 'WI',
  'Wyoming': 'WY',
};

module.exports = {
  generateUniqueEmail,
  generateValidPassword,
  generateValidUserData,
  TestUsers,
  InvalidEmails,
  WeakPasswords,
  generateValidUSAddress,
  TestAddresses,
  InvalidZipCodes,
  generateProfileUpdateData,
  InvalidPhoneNumbers,
  ExistingTestUser,
  StateAbbreviations,
};
