import { test, expect } from '@playwright/test';

test.describe('Financial Health Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and bypass auth (Guest mode)
    await page.goto('/');

    // Clear any previous mock data to ensure a clean slate
    await page.evaluate(() => {
        if ((window as any).__resetMockData) {
            (window as any).__resetMockData();
        }
    });

    // Enter guest mode
    await page.click('button:has-text("Continue as Guest")');
    await expect(page.locator('h1', { hasText: 'FinVision' })).toBeVisible();
  });

  test('navigates to Financial Health view and displays score gauge', async ({ page }) => {
    // Click the Financial Health navigation button
    // It has the title "Financial Health"
    await page.click('button[title="Financial Health"]');

    // Verify we are on the Financial Health view
    await expect(page.locator('h2', { hasText: 'Financial Health Score' })).toBeVisible();

    // Verify the health score element exists
    const scoreElement = page.getByTestId('health-score');
    await expect(scoreElement).toBeVisible();

    // Verify the metric breakdown cards are present
    await expect(page.locator('h3', { hasText: 'Savings Rate' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Debt-to-Income' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Emergency Fund' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Cash Flow' })).toBeVisible();
  });
});
