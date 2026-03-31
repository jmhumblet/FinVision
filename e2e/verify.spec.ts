import { test, expect } from '@playwright/test';
import { dismissInitialModals } from './fixtures/utils';

test.describe('Verification', () => {
    test('Generate Screenshot', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'Continue as Guest' }).click();
        await dismissInitialModals(page);

        await page.getByTitle('Variable Income').click();
        await expect(page.getByRole('heading', { name: 'Variable Income Smoother' })).toBeVisible();
        await page.waitForTimeout(1000);

        await page.screenshot({ path: '/home/jules/verification/variable_income.png' });
    });
});
