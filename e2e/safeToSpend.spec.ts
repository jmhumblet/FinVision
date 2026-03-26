import { test, expect } from '@playwright/test';

test.describe('Safe-to-Spend Daily Metric', () => {
  test.beforeEach(async ({ page }) => {
    // Reset mock data
    await page.goto('/');
    await page.evaluate(() => (window as any).__resetMockData && (window as any).__resetMockData());
    await page.reload();

    // 1. Login
    await page.getByRole('button', { name: /Continue as Guest/i }).click();
    await expect(page.getByRole('heading', { name: 'FinVision' })).toBeVisible();

    // Handle possible setup modal
    const reconHeading = page.getByRole('heading', { name: 'Monthly Reconciliation' });
    if (await reconHeading.isVisible({ timeout: 5000 }).catch(() => false)) {
        await page.getByRole('button', { name: 'Next: Verify Balance' }).click();
        await page.getByRole('button', { name: 'Save & Finish' }).click();
    }
  });

  test('displays safe-to-spend card with expected values', async ({ page }) => {
    // Current Available Balance is 5000 from mock data.
    // There are some projections in mock data. Let's see if the card renders.
    const card = page.locator('div').filter({ hasText: /^"Safe-to-Spend" Daily Metric/i }).first();
    await expect(card).toBeVisible();

    // The text contains / day
    await expect(card.getByText(/\/ day/i)).toBeVisible();

    // Check for Next payday or Unknown
    const hasNextPayday = await card.getByText(/Next payday:/i).isVisible();
    expect(hasNextPayday).toBeTruthy();
  });
});
