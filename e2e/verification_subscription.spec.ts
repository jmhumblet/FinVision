import { test, expect } from '@playwright/test';
import { dismissInitialModals } from './fixtures/utils';

test('verify subscription manager UI', async ({ page }) => {
  await page.goto('/');
  await dismissInitialModals(page);

  await page.locator('button[title="Subscriptions"]').click();
  await expect(page.getByText('Subscription Manager')).toBeVisible();

  // Wait a bit
  await page.waitForTimeout(500);

  // Click Cancel on Rent
  const rentCard = page.locator('.bg-white', { has: page.getByText('Rent') }).last();
  await rentCard.getByRole('button', { name: 'Cancel' }).click();

  // Wait for modal
  await expect(page.getByText('Cancel Rent')).toBeVisible();
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'verification/subscription_manager_modal.png', fullPage: true });
});
