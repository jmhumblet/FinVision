import { test, expect } from '@playwright/test';
import { dismissInitialModals } from './fixtures/utils';

test.describe('Safe-to-Spend Daily Metric', () => {
  test.beforeEach(async ({ page }) => {
    // Reset mock data to ensure clean state
    await page.goto('/');
    await page.evaluate(() => {
        if ((window as any).__resetMockData) {
            (window as any).__resetMockData();
        }
    });
    await page.goto('/');

    // Handle guest login and modals
    await dismissInitialModals(page);
    await expect(page.getByRole('heading', { name: 'FinVision' })).toBeVisible();
  });

  test('should display the Safe-to-Spend card on the main dashboard', async ({ page }) => {
    // Verify the card is visible by looking for its heading
    const heading = page.getByText('Safe-to-Spend', { exact: true });
    await expect(heading).toBeVisible();

    // Verify it shows some formatted currency amount for total available
    const totalAvailableText = page.getByText(/Total Available:/);
    await expect(totalAvailableText).toBeVisible();

    // Verify it shows "Next payday"
    const nextPaydayText = page.getByText(/Next payday:/);
    await expect(nextPaydayText).toBeVisible();

    // Look for the "day" text next to the amount
    const perDayText = page.getByText('/ day', { exact: true });
    await expect(perDayText).toBeVisible();
  });
});
