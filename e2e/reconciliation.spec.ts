import { test, expect } from '@playwright/test';

test.describe('Reconciliation and Navigation Flow', () => {
  test.setTimeout(30000);
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => (window as any).__resetMockData());
  });

  test('should perform reconciliation and create adjustment', async ({ page }) => {
    await page.getByRole('button', { name: /Continue as Guest/i }).click();

    // 1. Step 1: Projections
    await expect(page.getByText(/Monthly Reconciliation/i)).toBeVisible();
    await page.getByRole('button', { name: /Next: Verify Balance/i }).click();

    // 2. Step 2: Balance
    await page.getByLabel(/What is your actual bank balance today?/i).fill('5000');
    
    // Check "Set as default view" to ensure we stay in Monthly View
    await page.getByLabel(/Set Monthly View as my default landing page/i).check();

    await page.getByRole('button', { name: /Save & Finish/i }).click();

    // 3. Verify adjustment transaction exists
    await expect(page.getByText(/Reconciliation complete!/i)).toBeVisible();
    // Use getByDisplayValue if we can figure out why it failed, 
    // or just find the input inside the table.
    await expect(page.locator('table input[type="text"]').first()).toHaveValue(/Balance Correction/i);
  });

  test('should navigate between months and update data', async ({ page }) => {
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    await page.getByRole('button', { name: /Next: Verify Balance/i }).click();
    await page.getByLabel(/What is your actual bank balance today?/i).fill('1000');
    await page.getByLabel(/Set Monthly View as my default landing page/i).check();
    await page.getByRole('button', { name: /Save & Finish/i }).click();

    // Current Month Name (e.g. February 2026)
    const currentMonthLabel = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    await expect(page.getByText(currentMonthLabel)).toBeVisible();

    // Navigate to next month
    await page.getByTitle(/Next Month/i).click();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthLabel = nextMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    await expect(page.getByText(nextMonthLabel)).toBeVisible();
  });

  test('should show smart toast when adding transaction for different month', async ({ page }) => {
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    await page.getByRole('button', { name: /Next: Verify Balance/i }).click();
    await page.getByLabel(/What is your actual bank balance today?/i).fill('1000');
    await page.getByLabel(/Set Monthly View as my default landing page/i).check();
    await page.getByRole('button', { name: /Save & Finish/i }).click();

    // Add transaction for next month
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split('T')[0];
    
    await page.getByRole('button', { name: /Add Row/i }).first().click();
    
    // Find the date input of the NEW transaction (usually first when sorted by desc date? 
    // Actually table defaults to desc date, so today is likely first.
    // Let's just find ANY date input and fill it.
    await page.locator('input[type="date"]').first().fill(nextMonthStr);

    // Wait for toast
    await expect(page.getByText(/Entry added for/i)).toBeVisible();
    
    // Click "Go to Month"
    const nextMonthName = nextMonth.toLocaleDateString('en-GB', { month: 'long' });
    await page.getByRole('button', { name: `Go to ${nextMonthName}` }).click();

    // Give it a moment to re-render and filter
    await page.waitForTimeout(1000);

    // Verify we moved
    // The navigator should show the next month
    const nextMonthLabel = nextMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    await expect(page.getByText(nextMonthLabel)).toBeVisible();
    
    // Ensure we are in Monthly View
    await expect(page.getByText(/Forecasted End of Month/i)).toBeVisible();

    // In the new month view, only the March transaction should be visible
    const transactionTable = page.locator('table').first();
    // We expect only 1 transaction in March (the one we just added)
    // Jan 1, Jan 15, Feb 11 (correction) should all be filtered out.
    await expect(transactionTable.locator('tbody tr')).toHaveCount(1);
    await expect(transactionTable.locator('input[type="date"]')).toHaveValue(nextMonthStr);
  });
});
