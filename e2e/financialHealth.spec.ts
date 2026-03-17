import { test, expect } from '@playwright/test';

test.describe('Financial Health Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and bypass login
    await page.goto('/');

    // Check if we are on the Auth screen and click "Continue as Guest"
    const guestButton = page.getByRole('button', { name: /Continue as Guest/i });
    if (await guestButton.isVisible()) {
      await guestButton.click();
    }

    // Dismiss the Reconciliation Modal if it appears
    const nextButton = page.getByRole('button', { name: /Next: Verify Balance/i });
    if (await nextButton.isVisible()) {
      await nextButton.click();
      const completeButton = page.getByRole('button', { name: /Complete/i });
      if (await completeButton.isVisible()) {
        await completeButton.click();
      }
    }
  });

  test('navigates to Financial Health view and displays metrics', async ({ page }) => {
    // Click the Financial Health icon in the header
    const healthButton = page.locator('button[title="Financial Health"]');
    await expect(healthButton).toBeVisible();
    await healthButton.click();

    // Verify the dashboard title
    await expect(page.getByText('Financial Health Score')).toBeVisible();

    // Verify the score breakdown cards
    await expect(page.getByText('Score Breakdown')).toBeVisible();
    await expect(page.getByText('Savings Rate', { exact: true })).toBeVisible();
    await expect(page.getByText('Debt-to-Income', { exact: true })).toBeVisible();
    await expect(page.getByText('Emergency Fund', { exact: true })).toBeVisible();
    await expect(page.getByText('Cash Flow Stability', { exact: true })).toBeVisible();

    // Verify the Actionable Insights section
    await expect(page.getByText('Actionable Insights')).toBeVisible();
  });
});
