import { test, expect } from '@playwright/test';
import { dismissInitialModals } from './fixtures/utils';

test.describe('Monthly Focus View Flow', () => {
  test.setTimeout(30000);
  test.beforeEach(async ({ page }) => {
    // Reset mock data via the helper we exposed in mockFirebaseService
    await page.goto('/');
    await page.evaluate(() => (window as any).__resetMockData());
  });

  test('should complete monthly setup and view monthly dashboard', async ({ page }) => {
    // Use helper to handle guest login and initial modals
    // We set a specific balance and enable default view
    await dismissInitialModals(page, { actualBalance: '5000', setDefaultView: true });

    // Verify redirection to Monthly Dashboard
    const monthName = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    await expect(page.getByText(monthName)).toBeVisible();
    await expect(page.getByText(/Remaining Budget/i)).toBeVisible();
    
    // Summary calculation check:
    // Actual 5000 + Salary 3000 - Rent 1200 = 6800.
    await expect(page.getByText(/€6,800/i)).toBeVisible();

    // Test switching back to Main View
    await page.getByTitle(/Switch to Charts/i).click();
    await expect(page.getByText(/Current Available Balance/i)).toBeVisible();
    await expect(page.getByText(/Projected Balance/i)).toBeVisible();

    // 9. Reload and verify it defaults back to Monthly View because we checked the box
    await page.reload();
    const monthNameFinal = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    await expect(page.getByText(monthNameFinal)).toBeVisible();
    await expect(page.getByText(/Remaining Budget/i)).toBeVisible();
  });
});
