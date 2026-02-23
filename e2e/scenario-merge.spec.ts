import { test, expect } from '@playwright/test';
import { dismissInitialModals } from './fixtures/utils';

test.describe('Scenario Merging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      if ((window as any).__resetMockData) {
        (window as any).__resetMockData();
      }
    });
    await dismissInitialModals(page);
    await expect(page.getByRole('heading', { name: 'FinVision' })).toBeVisible();
  });

  test('should merge a scenario into the base plan', async ({ page }) => {
    // 1. Verify initial state (Monthly Salary is 3000)
    // We check the Projections table input value
    // Locate the row containing "Monthly Salary"
    const salaryInput = page.locator('input[value="Monthly Salary"]').first();
    await expect(salaryInput).toBeVisible();

    // Find the row containing this input
    // The input is inside a cell, inside a row
    const row = page.locator('tr', { has: salaryInput });

    // Find the amount input in that row. It is usually the second input (first number input)
    const amountInput = row.locator('input[type="number"]').first();
    await expect(amountInput).toHaveValue('3000');

    // 2. Create Scenario
    await page.getByText('What-If Scenarios').click();
    await page.getByPlaceholder('Scenario Name (e.g. New Job, Baby)').fill('Promotion');
    await page.getByRole('button', { name: 'Create' }).click();

    // 3. Add Adjustment
    const scenarioCard = page.locator('div.border-slate-200', { hasText: 'Promotion' }).first();
    const projSelect = scenarioCard.locator('select[data-testid="adj-projection-select"]');

    // Select Monthly Salary
    // Wait for options to populate
    await expect(projSelect.locator('option', { hasText: 'Monthly Salary' })).toHaveCount(1);
    const optionValue = await projSelect.locator('option', { hasText: 'Monthly Salary' }).first().getAttribute('value');
    await projSelect.selectOption(optionValue!);

    // Set +10%
    // PERCENT_INC is the value for AdjustmentType.PERCENTAGE_INCREASE
    await scenarioCard.locator('select[data-testid="adj-type-select"]').selectOption('PERCENT_INC');
    await scenarioCard.locator('input[data-testid="adj-value-input"]').fill('10');
    await scenarioCard.locator('button[data-testid="add-adjustment-btn"]').click();

    // Verify adjustment added to UI
    await expect(scenarioCard.getByText('Increase by 10%')).toBeVisible();

    // 4. Merge Scenario
    // Handle dialog
    page.on('dialog', dialog => dialog.accept());

    await scenarioCard.locator('button[data-testid^="merge-scenario-"]').click();

    // 5. Verify Scenario Removed
    await expect(scenarioCard).not.toBeVisible();
    await expect(page.getByText('Promotion')).not.toBeVisible();

    // 6. Verify Base Plan Updated
    // 3000 + 10% = 3300
    // Wait for the update to reflect in the input
    await expect(amountInput).toHaveValue('3300');
  });
});
