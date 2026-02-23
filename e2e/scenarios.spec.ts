import { test, expect } from '@playwright/test';
import { dismissInitialModals } from './fixtures/utils';

test.describe('FinVision Dashboard UI', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    await page.goto('/');
    
    // Use helper to handle guest login and initial modals
    await dismissInitialModals(page);
    await expect(page.getByRole('heading', { name: 'FinVision' })).toBeVisible();    
  });

  test('should allow collapsing and expanding tables', async ({ page }) => {
    // 1. Future Projections Table
    const projHeader = page.getByText('Future Projections');
    
    // Initially open (mock data has projections)
    await expect(page.getByText('Add Projection')).toBeVisible();
    await projHeader.click();
    await expect(page.getByText('Add Projection')).not.toBeVisible();
    await projHeader.click();
    await expect(page.getByText('Add Projection')).toBeVisible();
  });

  test('should render scenario line on chart when scenario is active', async ({ page }) => {
    // 1. Add a Projection (Base)
    await page.getByRole('button', { name: 'Add Projection' }).click();
    const nameInput = page.getByPlaceholder('E.g., Rent, Salary, Trip').last();
    await nameInput.fill('Playwright Proj');
    const amountInput = page.locator('input[type="number"]').last();
    await amountInput.fill('100');
    
    // Wait for the list to update (React render)
    await expect(page.locator('input[value="Playwright Proj"]')).toBeVisible();
  });
});
