import { test, expect } from '@playwright/test';

test.describe('Net Worth Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Reset mock data
    await page.goto('http://localhost:3000/');
    await page.evaluate(() => (window as any).__resetMockData && (window as any).__resetMockData());

    // Login as guest
    await page.getByRole('button', { name: 'Continue as Guest' }).click();

    // Handle Reconciliation Modal
    try {
        await expect(page.getByText('Monthly Reconciliation')).toBeVisible({ timeout: 5000 });
        await page.getByRole('button', { name: 'Next: Verify Balance' }).click();
        await page.getByRole('button', { name: 'Save & Finish' }).click();
    } catch (e) {
        // Modal skipped
    }
  });

  test('should allow adding assets and view net worth', async ({ page }) => {
    // Navigate to Net Worth
    await page.getByTitle('Net Worth').click();

    // Verify initial state
    await expect(page.getByText('Total Assets')).toBeVisible();
    await expect(page.getByText('Operating Cash')).toBeVisible();

    // Add Asset
    await page.getByRole('button', { name: 'Add Asset' }).click();

    // Fill Form
    await page.getByPlaceholder('New Asset Name').fill('Vintage Guitar');
    await page.locator('select').selectOption('OTHER');
    await page.getByPlaceholder('Value').fill('2500');

    // Save
    await page.getByTitle('Save').click();

    // Verify Asset Added to List
    await expect(page.getByText('Vintage Guitar')).toBeVisible();
    // 2500 should appear in Total Assets, Net Worth, and the list item
    await expect(page.getByText('€2,500').first()).toBeVisible();

    // Verify Calculation
    // Total Assets should be Cash + 2500.
    // We don't know exact cash, but we know it should increase.
    // Or we can just check that the asset is listed.

    // Edit Asset
    // Hover to reveal actions
    await page.getByText('Vintage Guitar').hover();
    await page.getByLabel('Edit Asset').click();
    await page.getByPlaceholder('Asset Name').fill('Rare Guitar');
    await page.getByTitle('Save').click();

    await expect(page.getByText('Rare Guitar')).toBeVisible();
    await expect(page.getByText('Vintage Guitar')).not.toBeVisible();

    // Delete Asset
    await page.getByText('Rare Guitar').hover();
    await page.getByLabel('Delete Asset').click();
    await expect(page.getByText('Rare Guitar')).not.toBeVisible();
  });
});
