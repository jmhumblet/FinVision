import { test, expect } from '@playwright/test';
// Since mockData doesn't have these, we'll mock it inline or just use generic app setup

test.describe('Cash Flow Alerts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Handle Auth and Modals
    const guestBtn = page.getByRole('button', { name: /Continue as Guest/i });
    if (await guestBtn.isVisible({ timeout: 2000 })) {
      await guestBtn.click();
    }

    const verifyBtn = page.getByRole('button', { name: /Next: Verify Balance/i });
    if (await verifyBtn.isVisible({ timeout: 5000 })) {
        await verifyBtn.click();
        await page.getByRole('button', { name: /Save & Finish/i }).click();
    }

  });

  test('should display a Cash Flow Alert when projected balance drops below zero within 30 days', async ({ page }) => {
    // Wait for initial load
    await expect(page.getByText(/Current Available Balance/i)).toBeVisible();

    // Clear all existing projections first so there's no pre-existing overdraft
    const deleteButtons = page.locator('table').locator('button').filter({ has: page.locator('svg.lucide-trash2') });
    while (await deleteButtons.count() > 0) {
      await deleteButtons.first().click();
      await page.waitForTimeout(100); // brief wait to let state update
    }

    // Assert that the alert goes away if it was there
    await expect(page.getByText(/Cash Flow Alert/i)).not.toBeVisible({ timeout: 5000 });

    // 1. Add a massive one-time expense projection to force an overdraft tomorrow
    await page.getByRole('button', { name: /Add Projection/i }).click();

    // Wait for the new item to appear
    // Projections table might be nested or have different structure, find by finding a row with 'New Item' value in input
    const nameInput = page.locator('input[value="New Item"]').first();
    await nameInput.waitFor();
    const row = nameInput.locator('xpath=./ancestor::tr');

    // Locate the inputs inside the specific row to avoid matching inputs outside the table
    const amountInput = row.locator('input[type="number"], input[inputmode="decimal"]').first();
    await amountInput.waitFor();
    await amountInput.fill('50000');
    await amountInput.press('Enter');

    // We want it to be an expense. In the component:
    // {p.type === TransactionType.INCOME ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
    // The classes are 'bg-emerald-100' for INCOME and 'bg-slate-100' for EXPENSE.
    // It is an expense by default when adding a new projection via App.tsx (type: TransactionType.EXPENSE)
    // We can verify it has 'bg-slate-100'
    const typeToggle = row.locator('button').locator('svg.lucide-arrow-up-right, svg.lucide-arrow-down-left').first().locator('xpath=./..');
    const classAttr = await typeToggle.getAttribute('class');
    if (classAttr && classAttr.includes('bg-emerald-100')) {
        await typeToggle.click(); // Toggle to Exp
    }

    // Set frequency to ONCE
    const freqSelect = row.locator('select').nth(1); // second select is frequency
    await freqSelect.selectOption('ONCE');

    // Set Date to Tomorrow
    const dateInput = row.locator('input[type="date"]').first();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const d = String(tomorrow.getDate()).padStart(2, '0');
    const tomorrowStr = `${y}-${m}-${d}`;

    await dateInput.fill(tomorrowStr);
    await dateInput.press('Enter');

    // Wait for the chart/timeline to recalculate and the alert to appear
    await expect(page.getByText(/Cash Flow Alert/i)).toBeVisible({ timeout: 5000 });

    // Since it's tomorrow, it should be marked as "Urgent"
    await expect(page.getByText(/Urgent/i)).toBeVisible();

    // Verify actionable steps are displayed
    await expect(page.getByText(/Actionable Steps/i)).toBeVisible();
    await expect(page.getByText(/Delay non-essential purchases/i)).toBeVisible();
  });
});
