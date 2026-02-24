import { test, expect } from '@playwright/test';

test.describe('Smart Savings Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Reset mock data if available
    await page.goto('http://localhost:3000/');
    await page.evaluate(() => (window as any).__resetMockData && (window as any).__resetMockData());

    // Login as guest
    await page.getByRole('button', { name: 'Continue as Guest' }).click();

    // Handle Reconciliation Modal if it appears
    try {
        await expect(page.getByText('Monthly Reconciliation')).toBeVisible({ timeout: 5000 });

        // Step 1: Click Next
        await page.getByRole('button', { name: 'Next: Verify Balance' }).click();

        // Step 2: Click Save
        await page.getByRole('button', { name: 'Save & Finish' }).click();
    } catch (e) {
        // Modal did not appear or timed out waiting for it.
    }
  });

  test('should allow creating a new savings goal', async ({ page }) => {
    // Navigate to Smart Savings
    await page.getByTitle('Smart Savings').click();

    // Verify empty state
    await expect(page.getByText('No Savings Goals Yet')).toBeVisible();

    // Click New Goal
    await page.getByRole('button', { name: 'New Goal' }).click();

    // Fill Form
    await page.getByPlaceholder('e.g. New Car, House Deposit').fill('Emergency Fund');

    // Target Date
    await page.locator('input[type="date"]').fill('2025-12-31');

    // Target Amount (first placeholder 0.00)
    await page.getByPlaceholder('0.00').first().fill('10000');

    // Current Amount (second placeholder 0.00)
    await page.getByPlaceholder('0.00').nth(1).fill('2000');

    // Submit
    await page.getByRole('button', { name: 'Create Goal' }).click();

    // Verify Goal Card
    await expect(page.getByText('Emergency Fund')).toBeVisible();

    // Verify Progress (2000 / 10000 = 20%)
    await expect(page.getByText('20%')).toBeVisible();

    // Verify Monthly Contribution
    await expect(page.getByText('Monthly Saving Needed')).toBeVisible();
  });
});
