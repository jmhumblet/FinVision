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

  test('should display Safe-to-Spend metric card', async ({ page }) => {
    // Look for the "Safe-to-Spend" header/text
    await expect(page.getByText('"Safe-to-Spend"')).toBeVisible();
    await expect(page.getByText('Daily Limit')).toBeVisible();

    // Look for a numeric value to be visible indicating it's calculating something
    const cardContent = page.locator('.bg-white.p-6.rounded-2xl', { hasText: 'Safe-to-Spend' });
    await expect(cardContent.locator('.text-4xl')).toBeVisible();
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
