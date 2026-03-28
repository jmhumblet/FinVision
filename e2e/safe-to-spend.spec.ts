import { test, expect } from '@playwright/test';
import { dismissInitialModals } from './fixtures/utils';

test.describe('Safe-to-Spend Daily Metric', () => {
  test.beforeEach(async ({ page }) => {
    // page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    await page.goto('/');

    // Use helper to handle guest login and initial modals
    await dismissInitialModals(page);
    await expect(page.getByRole('heading', { name: 'FinVision' })).toBeVisible();
  });

  test('should render Safe-to-Spend card on the main dashboard', async ({ page }) => {
    // The main dashboard should be visible
    await expect(page.getByText('Current Available Balance')).toBeVisible();

    // Verify the new card is rendered
    await expect(page.getByText('"Safe-to-Spend" Daily')).toBeVisible();

    // The text / day should be visible
    await expect(page.getByText('/ day')).toBeVisible();

    // Check for the info text
    await expect(page.getByText(/Calculated by reserving funds for upcoming bills/)).toBeVisible();
  });
});
