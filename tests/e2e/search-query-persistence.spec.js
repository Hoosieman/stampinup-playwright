/**
 * Search Query Persistence Bug Tests
 * 
 * Bug Report: Search query is not persisted in the search input field 
 * after navigating to the search results page
 * 
 * Priority: Medium | Severity: Major
 * Reporter: Cole Smith | Created: Feb 6, 2026
 * Repro Rate: Always (100%)
 * 
 * Bug Description:
 * After performing a search on stampinup.com, the search results page correctly 
 * displays the heading 'Product Search Results for "TEST"', but the search input 
 * field in the site header is cleared and shows the placeholder text 'Search' 
 * instead of retaining the user's query.
 * 
 * Expected Behavior:
 * Search input should retain the user's query after results load, allowing
 * users to easily modify their search terms without retyping.
 * 
 * @see https://www.stampinup.com/search?q=TEST
 */

const { test, expect } = require('@playwright/test');
const { SearchPage } = require('../pages/search.page');

test.describe('Search Query Persistence Bug', () => {
  /** @type {SearchPage} */
  let searchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
  });

  /**
   * TC-SEARCH-001: Verify search query persists after form submission
   * This is the primary bug reproduction test
   */
  test('TC-SEARCH-001: Search query should persist in input after submitting search', async ({ page }) => {
    // Test data
    const searchQuery = 'TEST';

    // Step 1: Navigate to homepage
    await searchPage.navigateToHomepage();

    // Step 2: Click on the search bar
    await searchPage.clickSearchInput();

    // Step 3: Type search query
    await searchPage.typeSearchQuery(searchQuery);

    // Step 4: Submit search (press Enter)
    await searchPage.submitSearch();

    // Step 5: Wait for search results page to load
    await searchPage.waitForSearchResults();

    // Step 6: Verify we're on the search results page
    expect(await searchPage.isOnSearchResultsPage()).toBe(true);

    // Step 7: Verify the URL contains the query parameter
    const urlQuery = await searchPage.getQueryFromUrl();
    expect(urlQuery).toBe(searchQuery);

    // Step 8: Verify the search results heading shows the query
    // (This confirms the search was processed correctly)
    await searchPage.verifySearchResultsHeadingContainsQuery(searchQuery);

    // Step 9: THE BUG CHECK - Verify search input RETAINS the query
    // Expected: Input should contain 'TEST'
    // Actual (Bug): Input is empty, showing only placeholder 'Search'
    const inputValue = await searchPage.getSearchInputValue();
    
    // This assertion will FAIL due to the bug
    expect(inputValue, 
      `Bug: Search input should retain query "${searchQuery}" but was "${inputValue || '(empty)'}"`
    ).toBe(searchQuery);
  });

  /**
   * TC-SEARCH-002: Verify search input is not empty after search
   * Alternative check for the bug
   */
  test('TC-SEARCH-002: Search input should not be empty after navigating to results', async ({ page }) => {
    const searchQuery = 'stamps';

    await searchPage.navigateToHomepage();
    await searchPage.performSearch(searchQuery);
    await searchPage.waitForSearchResults();

    // The input should NOT be empty
    const isEmpty = await searchPage.isSearchInputEmpty();
    
    expect(isEmpty, 
      'Bug: Search input is empty after search submission'
    ).toBe(false);
  });

  /**
   * TC-SEARCH-003: Verify query persistence when navigating directly to search URL
   */
  test('TC-SEARCH-003: Search input should show query when navigating directly to search URL', async ({ page }) => {
    const searchQuery = 'TEST';

    // Navigate directly to search results URL
    await searchPage.navigateToSearchResults(searchQuery);
    await searchPage.waitForSearchResults();

    // Verify URL has correct query
    const urlQuery = await searchPage.getQueryFromUrl();
    expect(urlQuery).toBe(searchQuery);

    // Verify heading shows the query (confirms page processed it)
    await searchPage.verifySearchResultsHeadingContainsQuery(searchQuery);

    // Bug check: Input should be pre-populated with the query from URL
    const inputValue = await searchPage.getSearchInputValue();
    expect(inputValue,
      `Bug: Search input should be pre-populated with "${searchQuery}" from URL`
    ).toBe(searchQuery);
  });

  /**
   * TC-SEARCH-004: Verify user can refine search without retyping
   * Tests the UX impact of the bug
   */
  test('TC-SEARCH-004: User should be able to refine search without retyping entire query', async ({ page }) => {
    const initialQuery = 'card';
    const refinedQuery = 'card stock';

    // Perform initial search
    await searchPage.navigateToHomepage();
    await searchPage.performSearch(initialQuery);
    await searchPage.waitForSearchResults();

    // Get current input value
    const inputAfterSearch = await searchPage.getSearchInputValue();

    // If bug exists, input will be empty and user must retype
    // If fixed, input should contain 'card' and user can just add ' stock'
    
    if (inputAfterSearch === initialQuery) {
      // Expected behavior: Just append to existing query
      await searchPage.appendToSearchQuery(' stock');
    } else {
      // Bug behavior: Must retype entire query
      // This test documents the extra user friction
      test.info().annotations.push({
        type: 'bug',
        description: 'User had to retype entire query due to input being cleared'
      });
      await searchPage.typeSearchQuery(refinedQuery);
    }

    await searchPage.submitSearch();
    await searchPage.waitForSearchResults();

    // Verify the refined search worked
    const finalUrlQuery = await searchPage.getQueryFromUrl();
    expect(finalUrlQuery).toContain('card');
  });

  /**
   * TC-SEARCH-005: Verify query persistence with special characters
   */
  test('TC-SEARCH-005: Search query with special characters should persist', async ({ page }) => {
    const searchQuery = 'birthday & celebration';

    await searchPage.navigateToHomepage();
    await searchPage.performSearch(searchQuery);
    await searchPage.waitForSearchResults();

    // Check if query persists (accounting for URL encoding)
    const inputValue = await searchPage.getSearchInputValue();
    expect(inputValue).toBe(searchQuery);
  });

  /**
   * TC-SEARCH-006: Verify query persistence with multiple words
   */
  test('TC-SEARCH-006: Multi-word search query should persist completely', async ({ page }) => {
    const searchQuery = 'rubber stamp ink pad';

    await searchPage.navigateToHomepage();
    await searchPage.performSearch(searchQuery);
    await searchPage.waitForSearchResults();

    const inputValue = await searchPage.getSearchInputValue();
    
    expect(inputValue,
      `Bug: Multi-word query "${searchQuery}" was not retained. Found: "${inputValue || '(empty)'}"`
    ).toBe(searchQuery);
  });

  /**
   * TC-SEARCH-007: Verify placeholder text appears only when input is intentionally empty
   */
  test('TC-SEARCH-007: Placeholder should only show when user has not searched', async ({ page }) => {
    const searchQuery = 'TEST';

    // First, check placeholder on homepage (should show)
    await searchPage.navigateToHomepage();
    const placeholderBefore = await searchPage.getSearchInputPlaceholder();
    expect(placeholderBefore.toLowerCase()).toContain('search');

    // After search, placeholder should NOT be visible (input should have value)
    await searchPage.performSearch(searchQuery);
    await searchPage.waitForSearchResults();

    const inputValue = await searchPage.getSearchInputValue();
    
    // If input has value, placeholder is hidden (correct behavior)
    // If input is empty, placeholder shows (bug behavior)
    expect(inputValue.length,
      'Bug: Search input is empty, showing placeholder instead of retaining query'
    ).toBeGreaterThan(0);
  });

  /**
   * TC-SEARCH-008: Verify query persistence after clicking search button (vs Enter key)
   */
  test('TC-SEARCH-008: Search query should persist when using search button instead of Enter', async ({ page }) => {
    const searchQuery = 'embossing';

    await searchPage.navigateToHomepage();
    await searchPage.clickSearchInput();
    await searchPage.typeSearchQuery(searchQuery);
    
    // Use button click instead of Enter
    await searchPage.clickSearchButton();
    await searchPage.waitForSearchResults();

    const inputValue = await searchPage.getSearchInputValue();
    expect(inputValue,
      `Bug: Query not retained after button click submission`
    ).toBe(searchQuery);
  });

  /**
   * TC-SEARCH-009: Compare behavior with industry standards
   * Documents expected behavior based on e-commerce conventions
   */
  test('TC-SEARCH-009: Behavior comparison - query should persist like major e-commerce sites', async ({ page }) => {
    const searchQuery = 'TEST';

    await searchPage.navigateToHomepage();
    await searchPage.performSearch(searchQuery);
    await searchPage.waitForSearchResults();

    const inputValue = await searchPage.getSearchInputValue();
    const urlQuery = await searchPage.getQueryFromUrl();
    const headingText = await searchPage.getSearchResultsHeadingText();

    // Document the state for comparison
    test.info().annotations.push({
      type: 'comparison',
      description: `
        Industry Standard (Amazon, Etsy, Target): Search input retains query
        
        Current Stampin' Up State:
        - URL Query Parameter: ${urlQuery}
        - Results Heading: ${headingText}
        - Search Input Value: "${inputValue || '(EMPTY - BUG)'}"
        
        Expected: Input should contain "${searchQuery}"
      `
    });

    // The actual assertion
    expect(inputValue).toBe(searchQuery);
  });

  /**
   * TC-SEARCH-010: Verify query persistence after page refresh
   */
  test('TC-SEARCH-010: Search query should persist in input after page refresh', async ({ page }) => {
    const searchQuery = 'TEST';

    // Navigate to search results
    await searchPage.navigateToSearchResults(searchQuery);
    await searchPage.waitForSearchResults();

    // Refresh the page
    await page.reload();
    await searchPage.waitForSearchResults();

    // Query should still be in input after refresh
    const inputValue = await searchPage.getSearchInputValue();
    expect(inputValue,
      'Bug: Search query not retained after page refresh'
    ).toBe(searchQuery);
  });
});

/**
 * Additional edge case tests
 */
test.describe('Search Query Persistence - Edge Cases', () => {
  /** @type {SearchPage} */
  let searchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
  });

  /**
   * TC-SEARCH-011: Empty search should show empty input (not a bug)
   */
  test('TC-SEARCH-011: Empty search submission should result in empty input', async ({ page }) => {
    await searchPage.navigateToHomepage();
    await searchPage.clickSearchInput();
    
    // Submit empty search
    await searchPage.submitSearch();
    
    // Empty input is expected here (not a bug)
    const inputValue = await searchPage.getSearchInputValue();
    expect(inputValue).toBe('');
  });

  /**
   * TC-SEARCH-012: Very long search query should persist completely
   */
  test('TC-SEARCH-012: Long search query should persist without truncation', async ({ page }) => {
    const longQuery = 'handmade birthday card supplies for paper crafting enthusiasts';

    await searchPage.navigateToHomepage();
    await searchPage.performSearch(longQuery);
    await searchPage.waitForSearchResults();

    const inputValue = await searchPage.getSearchInputValue();
    expect(inputValue,
      'Bug: Long search query was truncated or cleared'
    ).toBe(longQuery);
  });

  /**
   * TC-SEARCH-013: Search query with numbers should persist
   */
  test('TC-SEARCH-013: Search query containing numbers should persist', async ({ page }) => {
    const searchQuery = 'stamp set 2024';

    await searchPage.navigateToHomepage();
    await searchPage.performSearch(searchQuery);
    await searchPage.waitForSearchResults();

    const inputValue = await searchPage.getSearchInputValue();
    expect(inputValue).toBe(searchQuery);
  });
});
