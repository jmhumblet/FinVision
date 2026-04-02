import { test, expect } from '@playwright/test';
import { dismissInitialModals } from './fixtures/utils';

test.describe('Emergency Fund Stress Test', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and wait for it to load
    await page.goto('/');

    // Dismiss any initial modals to get a clean state on the Main Dashboard
    await dismissInitialModals(page);
  });

  test('should navigate to the Emergency Fund Stress Test view and display correct elements', async ({ page }) => {
    // 1. Find and click the Emergency Fund Stress Test navigation button
    // It has title="Emergency Fund Stress Test"
    const stressTestBtn = page.locator('button[title="Emergency Fund Stress Test"]');
    await expect(stressTestBtn).toBeVisible();
    await stressTestBtn.click();

    // 2. Verify the Header is present
    await expect(page.getByRole('heading', { name: 'Emergency Fund Stress Test' })).toBeVisible();

    // 3. Verify the main metric cards are present
    await expect(page.getByText('Current Runway')).toBeVisible();
    await expect(page.getByText('Sudden Income Loss', { exact: true })).toBeVisible();
    await expect(page.getByText('Large Unexpected Expense', { exact: true })).toBeVisible();
    await expect(page.getByText('Macro Shock (High Inflation)', { exact: true })).toBeVisible();

    // 4. Verify Recommendations section is present
    await expect(page.getByText('Actionable Recommendations')).toBeVisible();

    // By default, mock data should have some runway calculation.
    // It should say something like "mo" in the current runway container.
    const runwayContainer = page.locator('.text-4xl.font-extrabold').first();
    await expect(runwayContainer).toContainText('mo');
  });
});
