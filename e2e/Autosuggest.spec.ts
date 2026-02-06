import { test, expect } from '@playwright/test';

test.describe('what3words Autosuggest (Mocked API)', () => {
  
  test.beforeEach(async ({ page }) => {
    // Intercept the what3words API call
    await page.route('**/autosuggest*', async (route) => {
      const url = new URL(route.request().url());
      const input = url.searchParams.get('input');

      // Mock successful response for a specific input
      if (input?.includes('filled.count')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            suggestions: [
              { words: 'filled.count.soap', nearestPlace: 'London', country: 'GB', rank: 1, language: 'en' },
              { words: 'filled.count.book', nearestPlace: 'Manchester', country: 'GB', rank: 2, language: 'en' }
            ]
          }),
        });
      } 
      // Mock empty results
      else if (input === 'no.results.here') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ suggestions: [] }),
        });
      }
      // Mock API Failure
      else {
        await route.abort('failed');
      }
    });

    await page.goto('http://localhost:5173'); 
  });

  test('should display mocked suggestions and allow selection', async ({ page }) => {
    const input = page.getByRole('combobox');
    
    await input.fill('filled.count.s');

    // Verify the mock data appears in the UI
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    
    const firstOption = page.getByRole('option').first();
    await expect(firstOption).toContainText('filled.count.soap');

    // Select and verify
    await firstOption.click();
    await expect(input).toHaveValue('filled.count.soap');
  });

  test('should show error message when API fails', async ({ page }) => {
    const input = page.getByRole('combobox');
    await input.fill('cause.error.now');

    const errorMsg = page.getByText(/failed to fetch suggestions/i);
    await expect(errorMsg).toBeVisible();
  });
});
