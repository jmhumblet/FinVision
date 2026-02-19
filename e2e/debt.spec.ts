import { test, expect } from '@playwright/test';
import { dismissInitialModals } from './fixtures/utils';

test.describe('Debt Payoff Strategist', () => {
  test.beforeEach(async ({ page }) => {
    // Reset mock data
    await page.goto('/');
    await page.evaluate(() => {
      if ((window as any).__resetMockData) {
        (window as any).__resetMockData();
      }
    });

    // Login as guest and handle modals
    await dismissInitialModals(page);
    await expect(page.getByRole('heading', { name: 'FinVision' })).toBeVisible();
  });

  test('should navigate to Debt Strategist and add a debt', async ({ page }) => {
    // Navigate to Debt Strategist
    await page.getByTitle('Debt Strategist').click();

    // Check if we are on the Debt Dashboard
    await expect(page.getByRole('heading', { name: 'Payoff Strategy' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Your Debts' })).toBeVisible();

    // Add a Debt
    await page.getByRole('button', { name: 'Add Debt' }).click();

    // Fill in debt details
    // Wait for row to appear
    const row = page.locator('tbody tr').first();
    await expect(row).toBeVisible();

    await row.locator('input[type="text"]').first().fill('Test Credit Card');

    // Balance (number input 1)
    await row.locator('input[type="number"]').nth(0).fill('5000');

    // Interest (number input 2)
    await row.locator('input[type="number"]').nth(1).fill('18.5');

    // Min Payment (number input 3)
    await row.locator('input[type="number"]').nth(2).fill('150');

    // Wait for debounce/state update
    await page.waitForTimeout(500);

    // Verify Total Balance updated in header
    // The text might be split in spans. "Total:" and ",000.00" - locally it's "Total: €5,000"
    // We use a looser regex to match currency format
    await expect(page.locator('text=5,000.00')).toBeVisible();

    // Verify Chart shows data (not empty state)
    await expect(page.getByText('Add debts to see projection.')).not.toBeVisible();
    await expect(page.getByText('Debt Free Date:')).toBeVisible();

    // Change Strategy
    await page.getByRole('button', { name: 'Avalanche Method' }).click();

    // Check active state class
    const avalancheBtn = page.getByRole('button', { name: 'Avalanche Method' });
    await expect(avalancheBtn).toHaveClass(/text-emerald-700/);

    // Set Extra Payment
    // Target input inside the strategy toggle area
    await page.locator('div').filter({ hasText: /^Extra Monthly Payment/ }).locator('input').fill('200');

    // Wait for save
    await page.waitForTimeout(1000);

    // Verify persistence
    await page.reload();
    // After reload, we might need to handle modals again if session isn't persisted perfectly in test env
    // But dismissInitialModals handles login flow. If session persists, we might just be on dashboard.
    // Let's check where we are.

    // If we were redirected to login (unlikely with mock), we'd need to login.
    // Assuming we stay logged in or can just navigate.

    // If modal reappears (because monthly setup isn't saved in mock or resets), we need to close it.
    // However, the test resets data in beforeEach, so save *should* persist for the duration of the test unless we cleared storage.
    // We rely on standard navigation.

    // Check if we need to dismiss modal again?
    // Just in case, let's try to dismiss if visible, or just proceed.
    // Playwright's reload might not clear localStorage if using same context.

    // Wait for app load
    await expect(page.getByRole('heading', { name: 'FinVision' })).toBeVisible();

    await page.getByTitle('Debt Strategist').click();

    await expect(page.locator('text=5,000.00')).toBeVisible();
    await expect(page.inputValue('input[value="Test Credit Card"]')).toBe('Test Credit Card');
  });
});
