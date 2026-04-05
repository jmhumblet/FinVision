import { test, expect } from '@playwright/test';
import { dismissInitialModals } from './fixtures/utils';

test.describe('Lifestyle Creep Monitor', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate and clear mock data for a clean slate
    await page.goto('http://localhost:3000/');
    await page.evaluate(() => (window as any).__resetMockData && (window as any).__resetMockData());

    // Login as guest
    await page.getByRole('button', { name: 'Continue as Guest' }).click();

    // Handle Reconciliation Modal if it appears
    await dismissInitialModals(page);
  });

  test('should verify lifestyle creep monitor renders properly with mock data', async ({ page }) => {
    // Navigate to Lifestyle Creep Monitor
    await page.getByTitle('Lifestyle Creep Monitor').click();

    // Verify header
    await expect(page.getByRole('heading', { name: 'Lifestyle Creep Monitor', exact: true })).toBeVisible();

    // With the standard mock data, there should be some analysis visible, not the "not enough data" message
    await expect(page.getByText('Income vs Discretionary Spending')).toBeVisible();
    await expect(page.getByText('Growth Summary')).toBeVisible();
  });
});
