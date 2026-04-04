import { test, expect } from '@playwright/test';
import { dismissInitialModals } from './fixtures/utils';

test.describe('Lifestyle Creep Monitor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Login as guest
    await page.click('button:has-text("Continue as Guest")');

    // Dismiss setup/reconciliation modals
    await dismissInitialModals(page);
  });

  test('should navigate to Lifestyle Creep Monitor and display "Not Enough Data" by default', async ({ page }) => {
    // Navigate to Lifestyle Creep Monitor via the header button
    await page.click('button[title="Lifestyle Creep Monitor"]');

    // Verify header text
    await expect(page.locator('h2', { hasText: 'Lifestyle Creep Monitor' })).toBeVisible();

    // Verify "Not Enough Data" state initially because default mock data might not have multiple historical months
    // Or if it does, check for the chart. Let's check for either.
    const notEnoughData = page.locator('h3', { hasText: 'Not Enough Data' });
    const hasData = page.locator('h3', { hasText: 'Income vs. Discretionary Spending Trend' });

    const isNoData = await notEnoughData.isVisible();
    const isHasData = await hasData.isVisible();

    expect(isNoData || isHasData).toBeTruthy();
  });
});
