const { expect } = require('@playwright/test');

/**
 * Base Page Object containing common functionality
 * All other page objects should extend this class
 */
class BasePage {
  /**
   * @param {import('@playwright/test').Page} page 
   */
  constructor(page) {
    this.page = page;
    
    // Initialize common locators - using data-testid selectors (most stable)
    this.signInLink = page.getByTestId('menu-user-btn-signin');
    this.cartIcon = page.locator('[data-testid="cart-icon"], .cart-icon, [aria-label*="cart"]').first();
    this.searchInput = page.getByRole('searchbox').or(page.locator('input[type="search"], input[placeholder*="search" i]')).first();
    this.logo = page.locator('.logo, [alt*="Stampin"], header img').first();
  }

  /**
   * Navigate to a specific URL path
   * @param {string} path 
   */
  async goto(path = '/') {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to fully load
   * Note: Avoiding 'networkidle' as sites with analytics/chat widgets never reach idle state
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    // Use 'load' instead of 'networkidle' - more reliable for sites with continuous network activity
    await this.page.waitForLoadState('load');
    // Small buffer for any JavaScript to initialize
    await this.page.waitForTimeout(500);
    // Check for CAPTCHA and wait if detected
    await this.waitForCaptchaIfPresent();
  }

  /**
   * Detect CAPTCHA/bot protection and pause to allow manual completion
   * Checks for Incapsula/hCaptcha security pages
   */
  async waitForCaptchaIfPresent() {
    try {
      // Check for Incapsula/hCaptcha security page indicators
      const captchaIndicators = [
        'text="I am human"',
        'text="Additional security check"',
        'iframe[src*="hcaptcha"]',
        'text="Incapsula"',
      ];
      
      for (const selector of captchaIndicators) {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
          console.log('[v0] CAPTCHA detected! Please solve it manually. Waiting up to 2 minutes...');
          // Wait for CAPTCHA to disappear (user solved it) or for main site content to appear
          await this.page.waitForSelector('[data-testid="menu-user-btn-signin"], .logo, header', { 
            timeout: 120000 
          });
          console.log('[v0] CAPTCHA completed, continuing test...');
          await this.page.waitForTimeout(1000);
          break;
        }
      }
    } catch {
      // No CAPTCHA or already solved, continue
    }
  }

  /**
   * Click sign in link from header
   */
  async clickSignIn() {
    await this.signInLink.click();
    // Wait for modal/page transition rather than full page load
    await this.page.waitForTimeout(1000);
  }

  /**
   * Get current page URL
   * @returns {Promise<string>}
   */
  async getCurrentUrl() {
    return this.page.url();
  }

  /**
   * Get page title
   * @returns {Promise<string>}
   */
  async getPageTitle() {
    return this.page.title();
  }

  /**
   * Check if element is visible
   * @param {import('@playwright/test').Locator} locator 
   * @returns {Promise<boolean>}
   */
  async isVisible(locator) {
    try {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for element and click
   * @param {import('@playwright/test').Locator} locator 
   */
  async waitAndClick(locator) {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  /**
   * Fill input field with text
   * @param {import('@playwright/test').Locator} locator 
   * @param {string} text 
   */
  async fillInput(locator, text) {
    await locator.waitFor({ state: 'visible' });
    await locator.clear();
    await locator.fill(text);
  }

  /**
   * Accept cookies/consent banner if present
   */
  async acceptCookiesIfPresent() {
    try {
      const cookieButton = this.page.locator(
        'button:has-text("Accept"), button:has-text("Accept All"), [data-testid="cookie-accept"]'
      ).first();
      
      if (await cookieButton.isVisible({ timeout: 3000 })) {
        await cookieButton.click();
      }
    } catch {
      // Cookie banner not present, continue
    }
  }

  /**
   * Close any modal/popup if present
   */
  async closeModalIfPresent() {
    try {
      const closeButton = this.page.locator(
        '[aria-label="Close"], button:has-text("Close"), .modal-close, [data-dismiss="modal"]'
      ).first();
      
      if (await closeButton.isVisible({ timeout: 2000 })) {
        await closeButton.click();
      }
    } catch {
      // No modal present, continue
    }
  }

  /**
   * Take screenshot with timestamp
   * @param {string} name 
   */
  async takeScreenshot(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true
    });
  }

  /**
   * Scroll to element
   * @param {import('@playwright/test').Locator} locator 
   */
  async scrollToElement(locator) {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Verify success message is displayed
   * @param {string} [expectedText] 
   */
  async verifySuccessMessage(expectedText) {
    const successMessage = this.page.locator(
      '.success, .alert-success, [role="alert"]:has-text("success"), .notification-success'
    ).first();
    
    await expect(successMessage).toBeVisible();
    
    if (expectedText) {
      await expect(successMessage).toContainText(expectedText, { ignoreCase: true });
    }
  }

  /**
   * Verify error message is displayed
   * @param {string} [expectedText] 
   */
  async verifyErrorMessage(expectedText) {
    const errorMessage = this.page.locator(
      '.error, .alert-error, .alert-danger, [role="alert"]:has-text("error"), .validation-error, .field-error'
    ).first();
    
    await expect(errorMessage).toBeVisible();
    
    if (expectedText) {
      await expect(errorMessage).toContainText(expectedText, { ignoreCase: true });
    }
  }
}

module.exports = { BasePage };
