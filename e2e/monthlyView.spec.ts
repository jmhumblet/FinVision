import { test, expect } from '@playwright/test';

test.describe('Monthly Focus View Flow', () => {
  test.setTimeout(30000);
  test.beforeEach(async ({ page }) => {
    // Reset mock data via the helper we exposed in mockFirebaseService
    await page.goto('/');
    await page.evaluate(() => (window as any).__resetMockData());
  });

  test('should complete monthly setup and view monthly dashboard', async ({ page }) => {
    // 1. Login
    await page.getByRole('button', { name: /Continue as Guest/i }).click();

    // 2. Verify Monthly Setup Modal appears
    await expect(page.getByText(/Monthly Setup for/i)).toBeVisible();

    // 3. Enter balance
    await page.getByLabel(/Actual Bank Balance/i).fill('5000');

    // 4. Clear a transaction (Rent from mockData is 'Rent')
    // The mock data projection for rent is 'Rent'
    await page.getByRole('checkbox', { name: /\bRent\b/i }).check();

    // 5. Set as default view
    await page.getByLabel(/Set Monthly View as my default landing page/i).check();

    // 6. Save
    await page.getByRole('button', { name: /Save & Continue/i }).click();

    // 7. Verify redirection to Monthly Dashboard
    await expect(page.getByText(/Monthly Focus/i)).toBeVisible();
    await expect(page.getByText(/Remaining Spendable/i)).toBeVisible();
    
    // Summary calculation check:
    // Initial Balance (mock) is 0, but we entered 5000.
    // Monthly Salary (mock) is 3000.
    // Rent (mock) is 1200 - we cleared it.
    // So Remaining Spendable = 5000 (actual) + 3000 (salary) = 8000.
    // Wait, if I cleared Rent, it means it's ALREADY in the 5000. 
    // Remaining Spendable = ActualBalance + RemainingProjections.
    // Remaining Income = 3000 (Salary). Remaining Expenses = 0 (Rent cleared).
    // Remaining Spendable = 5000 + 3000 = 8000.
    await expect(page.getByText(/€8,000/i)).toBeVisible();

    // 8. Test switching back to Main View
    await page.getByTitle(/Switch to Charts/i).click();
    await expect(page.getByText(/Current Available Balance/i)).toBeVisible();
    await expect(page.getByText(/Projected Balance/i)).toBeVisible();

    // Wait for the success toast which confirms saving
    await expect(page.getByText(/Monthly setup saved!/i)).toBeVisible();
    // Wait for toast to potentially start fading and sync to settle
    await page.waitForTimeout(2000);

    // 9. Reload and verify it defaults to Monthly View
    await page.reload();
    await expect(page.getByText(/Monthly Focus/i)).toBeVisible();
  });
});
