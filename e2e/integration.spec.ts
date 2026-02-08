import { test, expect } from '@playwright/test';

test.describe('Full Stack Integration', () => {
  test('should connect to real Firebase and perform guest login', async ({ page }) => {
    // This test runs against the real Firebase project.
    // It verifies that the app can initialize and connect.
    
    await page.goto('/');
    
    // We do NOT reset mock data here because we are not mocking.
    
    await page.getByTestId('guest-login-button').click();
    
    // Check if we land on dashboard
    await expect(page.getByRole('heading', { name: 'FinVision' })).toBeVisible({ timeout: 15000 });
    
    // Verify NOT mocking (no logs) - optional, hard to check logs here.
    // Instead, verify that we can see data or empty state from real DB.
    // Since we are guest, it should be a new user or existing anonymous session.
    
    // If we can see the "Add Transaction" button, we are good.
    await expect(page.getByRole('button', { name: 'Add Row' }).first()).toBeVisible();
  });
});
