import { test, expect } from '@playwright/test';
import { dismissInitialModals } from './fixtures/utils';

test.describe('Smart Bill Calendar', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to base URL
    await page.goto('/');

    // Dismiss initial modals (login, reconciliation)
    // Providing a balance ensures we get past the setup modal if it appears
    await dismissInitialModals(page, { actualBalance: '5000' });

    // Ensure we are on the main dashboard first
    await expect(page.getByRole('heading', { name: 'FinVision' })).toBeVisible();
  });

  test('should verify calendar view elements and add a transaction', async ({ page }) => {
    // 1. Navigate to Smart Bill Calendar via the icon button in header
    // The button has title="Smart Bill Calendar"
    const calendarBtn = page.locator('button[title="Smart Bill Calendar"]');
    await expect(calendarBtn).toBeVisible();
    await calendarBtn.click();

    // 2. Verify Header and basic elements
    // H2 "Smart Bill Calendar"
    await expect(page.getByRole('heading', { name: 'Smart Bill Calendar' })).toBeVisible();

    // Check for "Jump to Today" button
    const todayBtn = page.getByRole('button', { name: 'Jump to Today' });
    await expect(todayBtn).toBeVisible();

    // 3. Check for Grid Headers (Days of week)
    // Use exact: true to avoid matching "Monday" if we only show "MON"
    // Note: The text is "Mon" in the DOM but displayed as "MON" via CSS.
    await expect(page.getByText('Mon', { exact: true })).toBeVisible();

    // 4. Verify clicking a day adds a transaction
    // Find all day cells. They have min-h-[140px] class in my implementation.
    // CSS selector needs escaping for brackets: .min-h-\\[140px\\]
    const dayCells = page.locator('.min-h-\\[140px\\]');

    // Wait for cells to render
    await expect(dayCells.first()).toBeVisible();

    // Count existing "New Transaction" texts.
    const initialCount = await page.getByText('New Transaction').count();

    // Click the 15th cell (arbitrary day likely in current month view)
    // We assume the calendar renders at least 15 days.
    await dayCells.nth(15).click();

    // 5. Verify a new transaction with "New Transaction" description appears
    // It should appear immediately in the list within the day cell
    // We check if the count increased.
    await expect(page.getByText('New Transaction')).toHaveCount(initialCount + 1);

    // Also verify the amount is €0 (default)
    // Scope to the clicked cell to be precise
    const clickedCell = dayCells.nth(15);
    await expect(clickedCell.getByText('New Transaction')).toBeVisible();

    // Note: The app uses 'en-IE' locale which formats 0 as €0
    await expect(clickedCell.getByText('€0', { exact: false })).toBeVisible();
  });
});
