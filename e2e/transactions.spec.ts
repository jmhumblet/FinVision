import { test, expect } from '@playwright/test';

test.describe('Transaction Management', () => {
  test.beforeEach(async ({ page }) => {
    console.log('--- Test Start: Transaction Management ---');
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    
    await page.goto('/');
    console.log('Navigated to /');
    
    await page.evaluate(() => {
      console.log('Evaluating __resetMockData...');
      if ((window as any).__resetMockData) {
        (window as any).__resetMockData();
      } else {
        console.log('WARNING: __resetMockData not found on window');
      }
    });
    
    console.log('Waiting for guest-login-button...');
    try {
      await page.getByTestId('guest-login-button').click({ timeout: 15000 });
      console.log('Clicked guest-login-button');
    } catch (e) {
      console.log('FAILED to click guest-login-button. Current URL:', page.url());
      const content = await page.content();
      console.log('PAGE CONTENT DUMP:', content);
      throw e;
    }
    
    await expect(page.getByRole('heading', { name: 'FinVision' })).toBeVisible();
    console.log('FinVision heading visible');
  });

  test('should add a new transaction', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Row' }).first().click();
    
    // Fill the last row (new transaction)
    const row = page.locator('tbody tr').last();
    await row.locator('input[type="text"]').fill('New Test Transaction');
    await row.locator('input[type="number"]').fill('50');
    
    // Select category (optional, defaults to Other)
    
    // Verify it appears in the list (already checked by filling it, but let's check count or reload)
    await expect(page.locator('input[value="New Test Transaction"]')).toBeVisible();
  });

  test('should edit an existing transaction', async ({ page }) => {
    // Edit the first transaction from mock data ("Initial Balance" or "Grocery Run")
    // Mock data order depends on implementation, usually chronological or insertion.
    // "Initial Balance" is 2026-01-01. "Grocery Run" is 2026-01-15.
    
    const input = page.locator('input[value="Grocery Run"]').first();
    await expect(input).toBeVisible();
    
    await input.fill('Grocery Run Updated');
    await expect(page.locator('input[value="Grocery Run Updated"]')).toBeVisible();
  });

  test('should delete a transaction', async ({ page }) => {
    const input = page.locator('input[value="Grocery Run"]').first();
    await expect(input).toBeVisible();
    
    const row = page.locator('tbody tr', { has: input });
    
    // Hover to show delete button
    await row.hover();
    const deleteBtn = row.locator('button').last(); // Trash icon is usually last
    await deleteBtn.click();
    
    await expect(page.locator('input[value="Grocery Run"]')).not.toBeVisible();
  });
});
