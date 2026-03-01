// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright Configuration for Stampin' Up! E2E Tests
 * 
 * This configuration is set up for testing against www.stampinup.com
 * Run tests with: pnpm test
 * Run with UI: pnpm test:ui
 * Run headed: pnpm test:headed
 */

module.exports = defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // Run tests sequentially (one at a time) for easier debugging
  fullyParallel: false,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Run one test at a time (set to higher number for parallel execution)
  workers: 1,
  
  // Reporter to use
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL for the application under test
    baseURL: 'https://www.stampinup.com',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Capture screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'on-first-retry',
    
    // Global timeout for each action
    actionTimeout: 15000,
    
    // Navigation timeout
    navigationTimeout: 30000,
    
    // Viewport size
    viewport: { width: 1280, height: 720 },
    
    // Slow down actions to avoid bot detection (milliseconds between actions)
    launchOptions: {
      slowMo: 500, // 500ms delay between actions
    },
  },

  // Configure projects - Chromium only to reduce bot detection triggers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment webkit when needed:
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Global setup and teardown
  globalSetup: undefined,
  globalTeardown: undefined,

  // Output directory for test artifacts
  outputDir: 'test-results/',
  
  // Timeout for each test
  timeout: 60000,
  
  // Expect timeout
  expect: {
    timeout: 10000,
  },
});
