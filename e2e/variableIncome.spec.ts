import { test, expect } from '@playwright/test';
import { dismissInitialModals } from './fixtures/utils';

test.describe('Variable Income Smoother', () => {
    test.beforeEach(async ({ page }) => {
        // Go to app
        await page.goto('/');

        // Log in as guest & dismiss modals
        await page.getByRole('button', { name: 'Continue as Guest' }).click();
        await dismissInitialModals(page);

        // Wait for dashboard to settle
        await expect(page.locator('text=Current Available Balance')).toBeVisible();
    });

    test('should navigate to Variable Income Smoother view and display key elements', async ({ page }) => {
        // Click on the Variable Income icon in the header nav
        await page.getByTitle('Variable Income').click();

        // Verify we are on the Variable Income Smoother view
        await expect(page.getByRole('heading', { name: 'Variable Income Smoother' })).toBeVisible();

        // Verify key stat cards are visible
        await expect(page.locator('text=Average Income')).toBeVisible();
        await expect(page.getByText('Smoothed Baseline').first()).toBeVisible();
        await expect(page.locator('text=Buffer Fund Target')).toBeVisible();

        // Verify the chart title is visible
        await expect(page.locator('text=Income History vs. Baseline')).toBeVisible();

        // Check if the "Analyze Last" dropdown exists
        const select = page.locator('select');
        await expect(select).toHaveValue('6');

        // Change select value and ensure it updates
        await select.selectOption('3');
        await expect(select).toHaveValue('3');
    });
});
