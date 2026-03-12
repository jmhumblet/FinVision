import { test, expect } from '@playwright/test';

test.describe('Market Trends Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and bypass login by using mock auth if configured
    await page.goto('/');

    // Login as guest to access the main app
    const guestButton = page.getByRole('button', { name: /continue as guest/i });
    if (await guestButton.isVisible()) {
      await guestButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('navigates to Market Trends and displays content', async ({ page }) => {
    // Dismiss any modal that might pop up (like monthly setup)
    const closeBtn = page.getByRole('button', { name: 'Close', exact: true });
    if (await closeBtn.isVisible()) {
        await closeBtn.click();
    }
    const continueBtn = page.getByRole('button', { name: /continue to dashboard/i });
    if (await continueBtn.isVisible()) {
        await continueBtn.click();
    }

    // Click the Market Trends button in the header nav
    const marketTrendsBtn = page.locator('button[title="Market Trends"]');
    await marketTrendsBtn.click();

    // Verify Market Trends view is rendered
    await expect(page.locator('text="Market Trends & Insights"')).toBeVisible();

    // Verify AI Financial Insight section
    await expect(page.locator('text="AI Financial Insight"')).toBeVisible();

    // Verify News Feed section
    await expect(page.locator('text="Curated Financial News"')).toBeVisible();

    // Wait for the mock data to load
    await page.waitForTimeout(2000);

    // Verify indices loaded
    await expect(page.locator('text="S&P 500"')).toBeVisible();
    await expect(page.locator('text="NASDAQ"')).toBeVisible();

    // Verify insight text loaded (mock text says something about "easing inflation")
    await expect(page.locator('text=/Based on current global trends/i')).toBeVisible();
  });
});
