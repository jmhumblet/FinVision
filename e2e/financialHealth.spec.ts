import { test, expect } from '@playwright/test';

import { dismissInitialModals } from './fixtures/utils';

test.describe('Financial Health Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => {
        if ((window as any).__resetMockData) {
            (window as any).__resetMockData();
        }
    });

    await dismissInitialModals(page);
    await expect(page.getByRole('heading', { name: 'FinVision' })).toBeVisible();

    // Navigate to Financial Health View
    await page.click('button[title="Financial Health"]');
  });

  test('displays all key sections of the financial health dashboard', async ({ page }) => {
    // Wait for main title
    await expect(page.locator('h1', { hasText: 'Financial Health Score' })).toBeVisible();

    // Verify metric cards
    await expect(page.getByText('Savings Rate', { exact: true })).toBeVisible();
    await expect(page.getByText('Debt-to-Income', { exact: true })).toBeVisible();
    await expect(page.getByText('Emergency Fund', { exact: true })).toBeVisible();
    await expect(page.getByText('Cash Flow Stability', { exact: true })).toBeVisible();

    // Verify Actionable Insights section
    await expect(page.getByText('Actionable Insights')).toBeVisible();

    // Look for the score gauge
    await expect(page.locator('text=out of 100')).toBeVisible();
  });
});
