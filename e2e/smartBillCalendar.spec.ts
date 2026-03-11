import { test, expect } from '@playwright/test';

test.describe('Smart Bill Calendar E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Reset mock data
    await page.goto('/');
    await page.evaluate(() => (window as any).__resetMockData && (window as any).__resetMockData());
    await page.reload();

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
  });

  test('Navigate to Calendar, add projection, and verify it appears', async ({ page }) => {
    // 1. Navigate to Calendar View
    const calendarBtn = page.locator('button[title="Calendar"]');
    await calendarBtn.waitFor({ state: 'visible' });
    await calendarBtn.click();

    // Verify calendar header
    await expect(page.locator('text=Smart Bill Calendar')).toBeVisible();

    // Because mock data system time is set to 2026 for E2E tests, the Calendar component's `new Date()` will render 2026.
    // handleAddProjection uses `new Date()`, which will also be 2026.

    // Check if we can see existing mock projections like "Rent"
    // Since mock projections are active, they should appear in the 2026 calendar view
    const rentPill = page.locator('div[draggable="true"]', { hasText: 'Rent' }).first();
    await expect(rentPill).toBeVisible({ timeout: 5000 });

    // 2. Add a new bill from the calendar top bar
    const addBillBtn = page.getByRole('button', { name: 'Bill / Income' });
    await addBillBtn.click();

    // Check Dashboard to verify the projection was added
    const dashboardBtn = page.locator('button[title="Dashboard"]');
    await dashboardBtn.click();

    // Look for "New Item" in the projections table
    const newItemInput = page.locator('input[value="New Item"]').first();
    await expect(newItemInput).toBeVisible();

    // Navigate back to Calendar to continue tests
    await calendarBtn.click();

    // 4. Test clicking a cell to add a transaction
    // Let's click on the first "15" we find in the grid
    const cell15 = page.getByText('15', { exact: true }).first();
    const cellContainer = cell15.locator('..').locator('..'); // go up to the min-h-[120px] container
    await cellContainer.click();

    // Clicking a cell triggers handleAddTransaction, which adds a "New Transaction"
    // Since we're in Calendar view, it adds it for today's date (or the specific date)
    // We should be able to switch to Dashboard and see it, but we can't see transactions directly in the calendar.
    // Switch to Dashboard
    await dashboardBtn.click();

    // Look for "New Transaction" in the table
    const newTx = page.locator('input[value="New Transaction"]').first();
    await expect(newTx).toBeVisible();
  });
});
