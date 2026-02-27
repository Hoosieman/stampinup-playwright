/**
 * Search Page Object
 * Handles search functionality on stampinup.com
 */

const { expect } = require('@playwright/test');
const { BasePage } = require('./base.page');

class SearchPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    
    // Search input selectors (trying multiple possible selectors)
    this.searchInputHeader = page.locator('header input[type="search"], header input[type="text"][placeholder*="Search"], header .search-input, header #search-input, header [data-testid="search-input"], header input[name="q"]');
    this.searchInputAlt = page.locator('input[type="search"], input[placeholder*="Search"], .search-bar input, #search input');
    this.searchButton = page.locator('header button[type="submit"], header .search-button, header [data-testid="search-button"], header button[aria-label*="search"], header .search-icon');
    this.searchForm = page.locator('header form[action*="search"], header .search-form, form[role="search"]');
    
    // Search results page elements
    this.searchResultsHeading = page.locator('h1, h2, .search-results-heading, [data-testid="search-heading"]');
    this.searchResultsContainer = page.locator('.search-results, #search-results, [data-testid="search-results"]');
    this.productResults = page.locator('.product-card, .product-item, .search-result-item, [data-testid="product-card"]');
    this.noResultsMessage = page.locator('.no-results, .empty-results, [data-testid="no-results"]');
    
    // URLs
    this.searchResultsUrlPattern = /\/search/;
  }

  /**
   * Get the search input element (tries multiple selectors)
   * @returns {Promise<import('@playwright/test').Locator>}
   */
  async getSearchInput() {
    // Try header search input first
    if (await this.searchInputHeader.first().isVisible().catch(() => false)) {
      return this.searchInputHeader.first();
    }
    // Fallback to alternative selectors
    return this.searchInputAlt.first();
  }

  /**
   * Navigate to homepage
   */
  async navigateToHomepage() {
    await this.navigate('/');
    await this.waitForPageLoad();
  }

  /**
   * Navigate directly to search results page
   * @param {string} query - Search query
   */
  async navigateToSearchResults(query) {
    await this.navigate(`/search?q=${encodeURIComponent(query)}`);
    await this.waitForPageLoad();
  }

  /**
   * Click on the search input to focus it
   */
  async clickSearchInput() {
    const searchInput = await this.getSearchInput();
    await searchInput.click();
  }

  /**
   * Type a search query into the search input
   * @param {string} query - Search query to type
   */
  async typeSearchQuery(query) {
    const searchInput = await this.getSearchInput();
    await searchInput.fill(query);
  }

  /**
   * Submit the search form
   */
  async submitSearch() {
    const searchInput = await this.getSearchInput();
    await searchInput.press('Enter');
    await this.waitForPageLoad();
  }

  /**
   * Click the search button to submit
   */
  async clickSearchButton() {
    await this.searchButton.first().click();
    await this.waitForPageLoad();
  }

  /**
   * Perform a complete search operation
   * @param {string} query - Search query
   */
  async performSearch(query) {
    await this.clickSearchInput();
    await this.typeSearchQuery(query);
    await this.submitSearch();
  }

  /**
   * Get the current value of the search input field
   * @returns {Promise<string>}
   */
  async getSearchInputValue() {
    const searchInput = await this.getSearchInput();
    return await searchInput.inputValue();
  }

  /**
   * Get the placeholder text of the search input
   * @returns {Promise<string>}
   */
  async getSearchInputPlaceholder() {
    const searchInput = await this.getSearchInput();
    return await searchInput.getAttribute('placeholder') || '';
  }

  /**
   * Check if search input is empty
   * @returns {Promise<boolean>}
   */
  async isSearchInputEmpty() {
    const value = await this.getSearchInputValue();
    return value === '' || value === null;
  }

  /**
   * Check if we're on the search results page
   * @returns {Promise<boolean>}
   */
  async isOnSearchResultsPage() {
    const currentUrl = this.page.url();
    return this.searchResultsUrlPattern.test(currentUrl);
  }

  /**
   * Get the search results heading text
   * @returns {Promise<string>}
   */
  async getSearchResultsHeadingText() {
    await this.searchResultsHeading.first().waitFor({ state: 'visible', timeout: 10000 });
    return await this.searchResultsHeading.first().textContent();
  }

  /**
   * Verify search results heading contains the query
   * @param {string} query - Expected query in heading
   */
  async verifySearchResultsHeadingContainsQuery(query) {
    const headingText = await this.getSearchResultsHeadingText();
    expect(headingText.toLowerCase()).toContain(query.toLowerCase());
  }

  /**
   * Verify search input retains the query (THIS IS THE BUG TEST)
   * @param {string} expectedQuery - The query that should be in the input
   */
  async verifySearchInputRetainsQuery(expectedQuery) {
    const inputValue = await this.getSearchInputValue();
    expect(inputValue).toBe(expectedQuery);
  }

  /**
   * Verify search input is NOT empty
   */
  async verifySearchInputNotEmpty() {
    const isEmpty = await this.isSearchInputEmpty();
    expect(isEmpty).toBe(false);
  }

  /**
   * Get the query parameter from the current URL
   * @returns {Promise<string|null>}
   */
  async getQueryFromUrl() {
    const url = new URL(this.page.url());
    return url.searchParams.get('q');
  }

  /**
   * Wait for search results to load
   */
  async waitForSearchResults() {
    await this.page.waitForLoadState('networkidle');
    // Wait for either results or no-results message
    await Promise.race([
      this.productResults.first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
      this.noResultsMessage.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
      this.searchResultsHeading.first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {})
    ]);
  }

  /**
   * Clear the search input
   */
  async clearSearchInput() {
    const searchInput = await this.getSearchInput();
    await searchInput.clear();
  }

  /**
   * Modify existing search query
   * @param {string} additionalText - Text to append to existing query
   */
  async appendToSearchQuery(additionalText) {
    const searchInput = await this.getSearchInput();
    await searchInput.press('End');
    await searchInput.type(additionalText);
  }
}

module.exports = { SearchPage };
