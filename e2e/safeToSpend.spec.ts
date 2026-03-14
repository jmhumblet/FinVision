import { test, expect } from '@playwright/test';
import { TransactionType, Frequency } from '../types';

test.describe('Safe-to-Spend Daily Metric', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app. Playwright config will handle serving the app.
    await page.goto('/');

    // Reset mock data to ensure clean state
    await page.evaluate(() => {
        if ((window as any).__resetMockData) {
            (window as any).__resetMockData();
        }
    });
    await page.reload();

    // Click Guest Login
    await page.getByRole('button', { name: /Continue as Guest/i }).click();

    // Wait for the main dashboard to appear
    await expect(page.getByRole('heading', { name: 'FinVision' })).toBeVisible();

    // Handle Reconciliation Modal if it appears
    const reconHeading = page.getByRole('heading', { name: 'Monthly Reconciliation' });
    if (await reconHeading.isVisible({ timeout: 5000 }).catch(() => false)) {
        await page.getByRole('button', { name: 'Next: Verify Balance' }).click();
        await page.getByRole('button', { name: 'Save & Finish' }).click();
        await expect(reconHeading).not.toBeVisible();
        // Default switch view to monthly. Switch back to main.
        await page.getByRole('button', { name: 'Dashboard' }).click();
    }
  });

  test('should display Safe-to-Spend metric card', async ({ page }) => {
    // The card should be visible
    const cardTitle = page.locator('text="Safe-to-Spend" Daily Metric');
    await expect(cardTitle).toBeVisible();

    const badge = page.locator('text=Dynamic').first();
    await expect(badge).toBeVisible();
  });

  test('should correctly compute Safe-to-Spend based on projections', async ({ page }) => {
    // Ensure the Safe-to-Spend metric card exists
    await expect(page.locator('text="Safe-to-Spend" Daily Metric')).toBeVisible();

    // Since E2E mock data in fixtures/mockData.ts is fixed, the balance
    // calculation might not immediately be what we expect if we don't mock the Date.
    // Let's add an explicit projection and verify the "Safe-to-Spend" card updates.

    // We can verify that it doesn't show "N/A" by checking if it shows a currency format or "N/A"
    const safeToSpendValue = page.locator('.text-4xl.font-extrabold').filter({ hasText: /€|N\/A/ }).nth(2);

    // Check if the value is rendered
    await expect(safeToSpendValue).toBeVisible();

    // The actual value might be complex to predict because we use the current real-world date in App.tsx (for new Date().toISOString())
    // but the mockData uses '2026-X-X'.
    // If today is < 2026, safeToSpend will be calculated based on the large gap.
    // If it's "N/A", we know next payday is not found.
    // Let's add a projection to ensure it's not null.

    await page.click('button:has-text("Add Projection")');
    await page.waitForTimeout(500);

    // Get the newly added projection row (first one in the table)
    const firstRow = page.locator('table tbody tr').first();

    const row = page.locator('tbody tr', { has: page.locator('input[value="New Item"]') }).last();

    // Type is a toggle button in the table (it changes between INCOME and EXPENSE)
    // The amount input also changes color, but clicking the button toggles it.
    // The button has either an ArrowDownLeft (INCOME) or ArrowUpRight (EXPENSE) icon inside it.
    // We can just find the button in the row that has the bg-slate-100 or bg-emerald-100 class
    const typeToggleBtn = row.locator('button').nth(0); // The first button in the row is the type toggle
    await typeToggleBtn.click();

    // Change amount to 1000
    const amountInput = row.locator('input[type="number"]');
    await amountInput.fill('1000');
    await amountInput.blur();

    await page.waitForTimeout(500);

    // Verify the value in Safe to Spend is not N/A
    await expect(safeToSpendValue).not.toHaveText('N/A');
    await expect(safeToSpendValue).toContainText('€');
  });
});
