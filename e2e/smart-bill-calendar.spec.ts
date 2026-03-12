import { test, expect } from '@playwright/test';

test.describe('Smart Bill Calendar', () => {
  test.beforeEach(async ({ page }) => {
    // Reset mock data if available
    await page.goto('http://localhost:3000/');
    await page.evaluate(() => (window as any).__resetMockData && (window as any).__resetMockData());

    // Login as guest
    await page.getByRole('button', { name: 'Continue as Guest' }).click();

    // Handle Reconciliation Modal if it appears
    try {
        await expect(page.getByText('Monthly Reconciliation')).toBeVisible({ timeout: 5000 });
        // Step 1: Click Next
        await page.getByRole('button', { name: 'Next: Verify Balance' }).click();
        // Step 2: Click Save
        await page.getByRole('button', { name: 'Save & Finish' }).click();
    } catch (e) {
        // Modal did not appear or timed out waiting for it.
    }
  });

  test('should navigate to Bill Calendar and view events', async ({ page }) => {
    // Navigate to Bill Calendar
    await page.getByTitle('Bill Calendar').click();

    // Verify Calendar Header
    await expect(page.getByText('Bill Calendar', { exact: true })).toBeVisible();
    await expect(page.getByText('Visualize your cash flow')).toBeVisible();

    // Verify Calendar Grid
    await expect(page.getByText('Mon', { exact: true })).toBeVisible();
    await expect(page.getByText('Sun', { exact: true })).toBeVisible();

    // Click on a day number (e.g., 15)
    await page.getByText('15', { exact: true }).first().click();

    // Verify Modal
    await expect(page.getByText('Add Transaction')).toBeVisible();

    // Add a Transaction - Opens the form modal
    await page.getByRole('button', { name: 'Add Transaction' }).click();

    // Fill form
    await page.getByPlaceholder('e.g. Groceries').fill('Coffee Shop');
    await page.getByPlaceholder('0.00').fill('5.50');

    // Save
    await page.getByRole('button', { name: 'Save Transaction' }).click();

    // Verify "Coffee Shop" appears on the calendar (grid view)
    // It might take a moment for state to update
    await expect(page.getByText('Coffee Shop')).toBeVisible();
  });
});
