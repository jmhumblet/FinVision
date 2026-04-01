import { test, expect } from '@playwright/test';
import { dismissInitialModals } from './fixtures/utils';

test.describe('Variable Income Smoother', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissInitialModals(page);
  });

  test('should display the Variable Income Smoother dashboard correctly', async ({ page }) => {
    // Navigate to the Variable Income Smoother view
    await page.getByTitle('Variable Income Smoother').click();

    // Verify the header is present
    await expect(page.getByRole('heading', { name: 'Variable Income Smoother' })).toBeVisible();

    // Verify the KPI cards are present
    await expect(page.getByText('Avg Historical Income')).toBeVisible();
    await expect(page.getByText('Smoothed Baseline', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Base Monthly Expenses')).toBeVisible();
    await expect(page.getByText('Buffer Fund Target')).toBeVisible();

    // Verify the chart header is present
    await expect(page.getByRole('heading', { name: 'Historical vs Smoothed Income' })).toBeVisible();

    // Verify the stress tests section is present
    await expect(page.getByRole('heading', { name: 'Stress Tests & Scenarios' })).toBeVisible();

    // Toggle a stress test scenario and verify it updates (e.g. Major Client Drops)
    const clientDropCheckbox = page.getByRole('checkbox', { name: /Major Client Drops/i });
    await clientDropCheckbox.check();
    await expect(clientDropCheckbox).toBeChecked();
  });
});
