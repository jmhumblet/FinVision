import { test, expect } from '@playwright/test';
import { dismissInitialModals } from './fixtures/utils';

test.describe('Emergency Fund Stress Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissInitialModals(page);
    await expect(page.getByRole('heading', { name: 'FinVision' })).toBeVisible();
  });

  test('should render the Emergency Fund Stress Test view', async ({ page }) => {
    // Click the navigation button for Emergency Fund Stress Test
    await page.getByRole('button', { name: 'Emergency Fund Stress Test' }).click();

    // Verify main components are present
    await expect(page.getByRole('heading', { name: 'Emergency Fund Stress Test' })).toBeVisible();
    await expect(page.getByText('Liquid Assets')).toBeVisible();
    await expect(page.getByText('Base Monthly Expenses')).toBeVisible();
    await expect(page.getByText('Current Runway')).toBeVisible();

    // Check for the chart elements
    await expect(page.getByText('Runway Scenarios')).toBeVisible();
    await expect(page.getByText('Base', { exact: true })).toBeVisible();
    await expect(page.getByText('Income Loss', { exact: true })).toBeVisible();
    await expect(page.getByText('Macro Shock', { exact: true })).toBeVisible();

    // Ensure Actionable Recommendations exist
    await expect(page.getByText('Actionable Recommendations')).toBeVisible();
  });
});
