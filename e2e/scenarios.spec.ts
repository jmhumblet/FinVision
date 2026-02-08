import { test, expect } from '@playwright/test';

test.describe('FinVision Dashboard UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Continue as Guest' }).click();
    await expect(page.getByText('FinVision')).toBeVisible();
  });

  test('should allow collapsing and expanding tables', async ({ page }) => {
    const projHeader = page.getByText('Future Projections');
    await expect(page.getByRole('button', { name: 'Add Projection' })).toBeVisible();
    await projHeader.click();
    await expect(page.getByRole('button', { name: 'Add Projection' })).not.toBeVisible();
    await projHeader.click();
    await expect(page.getByRole('button', { name: 'Add Projection' })).toBeVisible();

    const scenarioHeader = page.getByText('What-If Scenarios');
    await expect(page.getByPlaceholder('Scenario Name (e.g. New Job, Baby)')).not.toBeVisible();
    await scenarioHeader.click();
    await expect(page.getByPlaceholder('Scenario Name (e.g. New Job, Baby)')).toBeVisible();
  });

  test('should render scenario line on chart when scenario is active', async ({ page }) => {
    // 1. Add a Projection (Base)
    await page.getByRole('button', { name: 'Add Projection' }).click();
    const nameInput = page.getByPlaceholder('E.g., Rent, Salary, Trip').last();
    await nameInput.fill('Playwright Proj');
    const amountInput = page.locator('input[type="number"]').last();
    await amountInput.fill('100');
    
    // Ensure the projection is truly added and processed
    await page.waitForTimeout(2000); 

    // 2. Create a Scenario
    const scenarioHeader = page.getByText('What-If Scenarios');
    await scenarioHeader.click();
    await page.getByPlaceholder('Scenario Name (e.g. New Job, Baby)').fill('Test Scenario');
    await page.getByRole('button', { name: 'Create' }).click();
    
    // 3. Edit Scenario - Auto-edit mode
    const scenarioCard = page.locator('div.border-slate-200', { hasText: 'Test Scenario' }).first();
    const projSelect = scenarioCard.locator('select[data-testid="adj-projection-select"]');
    await expect(projSelect).toBeVisible();
    
    // Wait for option to appear in the DOM
    await expect(projSelect.locator('option', { hasText: 'Playwright Proj' })).toHaveCount(1, { timeout: 10000 });
    
    const optionValue = await projSelect.locator('option', { hasText: 'Playwright Proj' }).first().getAttribute('value');
    await projSelect.selectOption(optionValue!);
    
    await scenarioCard.locator('input[data-testid="adj-value-input"]').fill('50'); 
    await scenarioCard.locator('button[data-testid="add-adjustment-btn"]').click();
    
    // 4. Verify Chart
    await expect(page.locator('.recharts-legend-item-text', { hasText: 'Test Scenario' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('svg .recharts-line-curve')).toBeVisible();
  });

  test('should support Remove Item adjustment', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Projection' }).click();
    await page.getByPlaceholder('E.g., Rent, Salary, Trip').last().fill('To Be Removed');
    await page.waitForTimeout(2000);
    
    await page.getByText('What-If Scenarios').click();
    await page.getByPlaceholder('Scenario Name (e.g. New Job, Baby)').fill('Removal Scenario');
    await page.getByRole('button', { name: 'Create' }).click();
    
    const scenarioCard = page.locator('div.border-slate-200', { hasText: 'Removal Scenario' }).first();
    const projSelect = scenarioCard.locator('select[data-testid="adj-projection-select"]');
    await expect(projSelect).toBeVisible();
    
    // Wait for option
    await expect(projSelect.locator('option', { hasText: 'To Be Removed' })).toHaveCount(1, { timeout: 10000 });
    
    const optionValue = await projSelect.locator('option', { hasText: 'To Be Removed' }).first().getAttribute('value');
    await projSelect.selectOption(optionValue!);
    
    await scenarioCard.locator('select[data-testid="adj-type-select"]').selectOption('REMOVE');
    await scenarioCard.locator('button[data-testid="add-adjustment-btn"]').click();
    
    await expect(page.getByText('Remove this item')).toBeVisible();
  });

  test('should allow adding scenario-only items', async ({ page }) => {
    await page.getByText('What-If Scenarios').click();
    await page.getByPlaceholder('Scenario Name (e.g. New Job, Baby)').fill('Budget Cut');
    await page.getByRole('button', { name: 'Create' }).click();
    
    const scenarioCard = page.locator('div.border-slate-200', { hasText: 'Budget Cut' }).first();
    
    const addBtn = scenarioCard.locator('button[data-testid="add-scenario-item-btn"]');
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    
    // Wait explicitly for the new inputs to appear
    const nameInput = scenarioCard.locator('input[value="New Scenario Item"]').first();
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    
    await nameInput.fill('Secret Savings');
    const amountInput = scenarioCard.locator('input[type="number"]').last();
    await amountInput.fill('500');
    
    // We expect "Budget Cut" to appear in legend even if it has no base adjustments, 
    // because it now has a scenario-only projection.
    await expect(page.locator('.recharts-legend-item-text', { hasText: 'Budget Cut' })).toBeVisible({ timeout: 10000 });
  });

  test('should support AI Smart Categorize', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Row' }).click();
    const row = page.locator('tbody tr').last();
    await row.locator('input[type="text"]').fill('Netflix');
    
    await page.getByRole('button', { name: 'AI Smart Categorize' }).click();
    await expect(page.getByText(/categorized|could not categorize/)).toBeVisible();
  });
});
