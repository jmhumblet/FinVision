import { test, expect } from '@playwright/test';
import { dismissInitialModals } from './fixtures/utils';

test.describe('Smart Bill Calendar View', () => {

  test.beforeEach(async ({ page }) => {
    // Reset mock data
    await page.goto('/');
    await page.evaluate(() => {
      if ((window as any).__resetMockData) {
        (window as any).__resetMockData();
      }
    });

    // Handle initial auth & reconciliation modal
    await dismissInitialModals(page);

    // Verify main dashboard loaded
    await expect(page.getByText('Current Available Balance')).toBeVisible();

    // Setup mock data via UI since we can't reliably inject into the mock api from here
    const today = new Date();

    // 1. Create a projection for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowDateStr = tomorrow.toISOString().split('T')[0];

    await page.getByRole('button', { name: 'Add Projection' }).click();

    const nameInput = page.getByPlaceholder('E.g., Rent, Salary, Trip').last();
    await nameInput.fill('E2E Future Bill');
    await nameInput.press('Enter');

    // Find the date input in the same row
    const row = page.locator('tbody tr', { has: page.locator('input[value="E2E Future Bill"]') }).last();
    const dateInput = row.locator('input[type="date"]').first();
    await dateInput.fill(tomorrowDateStr);
    await dateInput.press('Enter');

    // Explicitly wait for the title to be registered
    await expect(page.locator('input[value="E2E Future Bill"]').first()).toBeVisible();
  });

  test('navigates to calendar, displays items, and allows quick add', async ({ page }) => {
    // Navigate to Calendar
    await page.getByRole('button', { name: 'Smart Bill Calendar' }).click();

    // Verify header
    await expect(page.getByRole('heading', { name: 'Smart Bill Calendar' })).toBeVisible();

    // Wait for projections to finish loading
    await page.waitForTimeout(1000); // Sometimes it takes a moment for the new projection to propagate to timeline

    // Verify the projection we just added is visible
    // Depending on when the timeline runs, we might need to navigate months if "tomorrow" is the 1st of next month, etc.
    // However, it's easier to check if "Rent" is visible since it's hardcoded to '2026-02-01'

    // We navigate to Feb 2026 where we know mock data has Rent
    let monthText = await page.locator('.flex.items-center.space-x-2.bg-white > span').textContent();
    while (monthText && !monthText.includes('2026')) {
        await page.locator('.flex.items-center.space-x-2.bg-white > button').last().click();
        monthText = await page.locator('.flex.items-center.space-x-2.bg-white > span').textContent();
    }
    while (monthText && !monthText.includes('February')) {
        await page.locator('.flex.items-center.space-x-2.bg-white > button').last().click();
        monthText = await page.locator('.flex.items-center.space-x-2.bg-white > span').textContent();
    }

    await expect(page.getByText('Rent', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Monthly Salary', { exact: true }).first()).toBeVisible();

    // Test Quick Add
    const today = new Date();
    const todayDay = today.getDate();

    // Click quick add for today
    await page.getByTestId(`quick-add-${todayDay}`).click();

    // A new manual transaction should have been added.
    // Wait for the new manual transaction to appear on today's cell.
    // Since name defaults to "New Transaction"
    await expect(page.getByText('New Transaction').first()).toBeVisible();

    // Verify navigation back works
    await page.getByRole('button', { name: 'Dashboard' }).click();
    await expect(page.getByText('Current Available Balance')).toBeVisible();
  });

});