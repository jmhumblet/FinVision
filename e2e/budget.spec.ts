import { test, expect } from '@playwright/test';

test.describe('Category Budgeting', () => {
  test.beforeEach(async ({ page }) => {
    // Reset mock data
    await page.goto('/');
    await page.evaluate(() => (window as any).__resetMockData && (window as any).__resetMockData());
    await page.reload();
  });

  test('User can set a budget limit and see progress', async ({ page }) => {
    // 1. Login
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    await expect(page.getByRole('heading', { name: 'FinVision' })).toBeVisible();

    // Handle Reconciliation Modal (appears on first load/reset)
    const reconHeading = page.getByRole('heading', { name: 'Monthly Reconciliation' });
    if (await reconHeading.isVisible({ timeout: 5000 }).catch(() => false)) {
        await page.getByRole('button', { name: 'Next: Verify Balance' }).click();
        await page.getByRole('button', { name: 'Save & Finish' }).click();
        await expect(reconHeading).not.toBeVisible();
    }

    // 2. Go to Monthly Dashboard
    await page.getByTitle('Monthly Focus').click();
    await expect(page.getByTestId('monthly-dashboard')).toBeVisible();

    // 3. Add a transaction for the current month (since mock data is in 2026)
    // The table should be empty initially.
    await page.getByRole('button', { name: 'Add Row' }).click();

    // Fill details: Change Category to Groceries and Amount to 150
    // Use locator by value since getByDisplayValue might be flaky in some envs or just fallback
    await page.locator('input[value="New Transaction"]').fill('Groceries Purchase');

    // Target the specific row we just edited
    const txRow = page.getByRole('row', { name: /Groceries Purchase/ });
    await txRow.getByRole('combobox').selectOption({ label: 'Groceries' });
    await txRow.locator('input[type="number"]').fill('150');

    // 4. Open Budget Settings
    // Initially, there are no budgets set (based on mockData defaults).
    await page.getByRole('button', { name: 'Setup Budgets' }).click();

    // 5. Set limit for "Groceries"
    const groceriesRow = page.locator('div').filter({ hasText: 'Groceries' }).filter({ has: page.getByPlaceholder('0') }).last();
    const input = groceriesRow.getByPlaceholder('0');
    await input.fill('200');

    // 6. Save/Close
    await page.getByRole('button', { name: 'Done' }).click();

    // 7. Verify Budget List shows Groceries
    await expect(page.getByText('Category Budgets', { exact: true })).toBeVisible(); // Header
    const budgetCard = page.locator('div').filter({ hasText: 'Groceries' }).filter({ hasText: 'of €200' }).first();
    await expect(budgetCard).toBeVisible();

    // 8. Verify Progress (We added €150 transaction)
    // Spending: 150 / 200 => 75%
    // Text should show €150
    await expect(budgetCard.getByText('€150', { exact: true })).toBeVisible();
    await expect(budgetCard.getByText('On Track')).toBeVisible();

    // 9. Edit the limit to be lower than spent (e.g., 100)
    await page.getByTitle('Budget Limits').click();
    // We need to re-locate the input as the modal was re-rendered
    const input2 = page.locator('div').filter({ hasText: 'Groceries' }).filter({ has: page.getByPlaceholder('0') }).last().getByPlaceholder('0');
    await input2.fill('100');
    await page.getByRole('button', { name: 'Done' }).click();

    // 10. Verify Over Budget
    const budgetCardUpdated = page.locator('div').filter({ hasText: 'Groceries' }).filter({ hasText: 'of €100' }).first();
    await expect(budgetCardUpdated.getByText('Over Budget')).toBeVisible();
    // Exceeded by 50
    await expect(budgetCardUpdated.getByText('Exceeded by €50')).toBeVisible();
  });
});
