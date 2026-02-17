import { test, expect } from '@playwright/test';
import { dismissInitialModals } from './fixtures/utils';

test.describe('Projection Planning', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      if ((window as any).__resetMockData) {
        (window as any).__resetMockData();
      }
    });
    // Use helper to handle guest login and initial modals (reconciliation/setup)
    await dismissInitialModals(page);
    await expect(page.getByRole('heading', { name: 'FinVision' })).toBeVisible();
  });

  test('should add a new projection', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Projection' }).click();
    const nameInput = page.getByPlaceholder('E.g., Rent, Salary, Trip').last();
    await nameInput.fill('New E2E Projection');
    const amountInput = page.locator('input[type="number"]').last();
    await amountInput.fill('500');
    
    await expect(page.locator('input[value="New E2E Projection"]')).toBeVisible();
  });

  test('should edit a projection frequency', async ({ page }) => {
    // Target "Monthly Salary" from mock data
    const row = page.locator('tbody tr', { has: page.locator('input[value="Monthly Salary"]') });
    
    // Check initial frequency (Monthly)
    const select = row.locator('select').nth(1); // Second select is frequency
    await expect(select).toHaveValue('MONTHLY');
    
    // Change to Weekly
    await select.selectOption('WEEKLY');
    await expect(select).toHaveValue('WEEKLY');
  });
  
  test('should delete a projection', async ({ page }) => {
    const row = page.locator('tbody tr', { has: page.locator('input[value="Monthly Salary"]') });
    await row.hover();
    const deleteBtn = row.locator('button').last();
    await deleteBtn.click();
    
    await expect(page.locator('input[value="Monthly Salary"]')).not.toBeVisible();
  });
});
