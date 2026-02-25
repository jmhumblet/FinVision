import { test, expect } from '@playwright/test';
import { dismissInitialModals } from './fixtures/utils';

test.describe('Subscription Manager', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Dismiss modals if any
    await dismissInitialModals(page);

    // Ensure we are on the main page
    await expect(page.getByText('FinVision', { exact: true })).toBeVisible();
  });

  test('should display subscription view', async ({ page }) => {
    // 1. Click on Subscriptions button in header
    await page.locator('button[title="Subscriptions"]').click();

    // 2. Verify Subscription Manager view is active
    await expect(page.getByText('Subscription Manager')).toBeVisible();
    await expect(page.getByText('Track recurring expenses and upcoming renewals')).toBeVisible();

    // 3. Verify Rent is present (assuming mock data has Rent as recurring expense)
    await expect(page.getByText('Rent')).toBeVisible();

    // 4. Verify Total Cost is displayed
    await expect(page.getByText(/Total Monthly Cost/i)).toBeVisible();
  });

  test('should toggle between monthly and yearly view', async ({ page }) => {
    await page.locator('button[title="Subscriptions"]').click();

    // Default is Monthly
    await expect(page.getByText(/Total Monthly Cost/i)).toBeVisible();

    // Switch to Yearly
    await page.getByRole('button', { name: 'Yearly' }).click();
    await expect(page.getByText(/Total Yearly Cost/i)).toBeVisible();

    // Switch back
    await page.getByRole('button', { name: 'Monthly', exact: true }).click();
    await expect(page.getByText(/Total Monthly Cost/i)).toBeVisible();
  });

  test('should open cancellation modal', async ({ page }) => {
    await page.locator('button[title="Subscriptions"]').click();

    // Click Cancel for Rent
    const rentCard = page.locator('.bg-white', { has: page.getByText('Rent') }).last();
    await rentCard.getByRole('button', { name: 'Cancel' }).click();

    // Verify modal opens
    await expect(page.getByText('Cancel Rent')).toBeVisible();
    await expect(page.getByText('Find Cancellation Guide')).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: 'Close' }).filter({ hasText: 'Close' }).click();
    await expect(page.getByText('Cancel Rent')).not.toBeVisible();
  });
});
