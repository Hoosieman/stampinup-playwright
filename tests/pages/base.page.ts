import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page Object containing common functionality
 * All other page objects should extend this class
 */
export class BasePage {
  readonly page: Page;
  
  // Common header elements
  readonly signInLink: Locator;
  readonly cartIcon: Locator;
  readonly searchInput: Locator;
  readonly logo: Locator;
  
  constructor(page: Page) {
    this.page = page;
    
    // Initialize common locators - these may need adjustment based on actual site structure
    this.signInLink = page.getByRole('link', { name: /sign in/i }).first();
    this.cartIcon = page.locator('[data-testid="cart-icon"], .cart-icon, [aria-label*="cart"]').first();
    this.searchInput = page.getByRole('searchbox').or(page.locator('input[type="search"], input[placeholder*="search" i]')).first();
    this.logo = page.locator('.logo, [alt*="Stampin"], header img').first();
  }

  /**
   * Navigate to a specific URL path
   */
  async goto(path: string = '/') {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to fully load
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click sign in link from header
   */
  async clickSignIn() {
    await this.signInLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Get current page URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Check if element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for element and click
   */
  async waitAndClick(locator: Locator) {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  /**
   * Fill input field with text
   */
  async fillInput(locator: Locator, text: string) {
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
   */
  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true
    });
  }

  /**
   * Scroll to element
   */
  async scrollToElement(locator: Locator) {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Verify success message is displayed
   */
  async verifySuccessMessage(expectedText?: string) {
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
   */
  async verifyErrorMessage(expectedText?: string) {
    const errorMessage = this.page.locator(
      '.error, .alert-error, .alert-danger, [role="alert"]:has-text("error"), .validation-error, .field-error'
    ).first();
    
    await expect(errorMessage).toBeVisible();
    
    if (expectedText) {
      await expect(errorMessage).toContainText(expectedText, { ignoreCase: true });
    }
  }
}
