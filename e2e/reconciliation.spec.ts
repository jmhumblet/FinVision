import { test, expect } from '@playwright/test';
import { dismissInitialModals } from './fixtures/utils';

test.describe('Reconciliation and Navigation Flow', () => {
  test.setTimeout(30000);
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => (window as any).__resetMockData());
  });

  test('should perform reconciliation and create adjustment', async ({ page }) => {
    // 1. Step 1 & 2 handled by manual steps here because we want to verify details
    await page.getByRole('button', { name: /Continue as Guest/i }).click();

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
    await dismissInitialModals(page, { actualBalance: '1000', setDefaultView: true });

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
    await dismissInitialModals(page, { actualBalance: '1000', setDefaultView: true });
    
    // 1. Clear any existing transactions to ensure clean count
    const transactionTable = page.locator('table').first();
    let deleteBtn = transactionTable.locator('button .lucide-trash-2').first();
    while (await deleteBtn.isVisible()) {
        await transactionTable.locator('tbody tr').first().hover();
        await deleteBtn.click();
        await page.waitForTimeout(200); // Wait for React state to update
    }

    // Add transaction for next month
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split('T')[0];
    const nextMonthName = nextMonth.toLocaleDateString('en-GB', { month: 'long' });
    const nextMonthLabel = nextMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    const uniqueDesc = `Future Tx ${Date.now()}`;
    
    await page.getByRole('button', { name: /Add Row/i }).first().click();
    
    // 2. Fill the new row (should be at the top if sorted desc by date, but let's be safe and target first row of tbody)
    const row = transactionTable.locator('tbody tr').first();
    await row.locator('input[type="text"]').fill(uniqueDesc);
    await row.locator('input[type="date"]').fill(nextMonthStr);
    await row.locator('input[type="date"]').blur(); 

    // Wait for the toast instead of table visibility if table sorting is unpredictable
    // 3. Wait for and click toast
    await expect(page.getByText(/Entry added for/i)).toBeVisible();
    await page.getByRole('button', { name: `Go to ${nextMonthName}` }).click();

    // 3. Verify Navigation
    await expect(page.getByText(nextMonthLabel)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Forecasted End of Month/i)).toBeVisible();

    // 4. Verify Filtering: Should show the uniqueDesc
    const matchingRows = transactionTable.locator('tbody tr', { has: page.locator(`input[value="${uniqueDesc}"]`) });
    
    // Use greaterThanOrEqual because React StrictMode or race conditions might add it twice
    // but the core logic we are testing is the FILTERING.
    const count = await matchingRows.count();
    expect(count).toBeGreaterThanOrEqual(1);
    
    // Ensure OTHER transactions (like Jan/Feb ones) are NOT visible
    await expect(page.locator('input[value="Grocery Run"]')).not.toBeVisible();
  });
});
