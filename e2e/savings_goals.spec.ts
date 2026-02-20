import { test, expect } from '@playwright/test';
import { dismissInitialModals } from './fixtures/utils';

test.describe('Savings Goals Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('/');

    // Reset mock data
    await page.evaluate(() => {
      if ((window as any).__resetMockData) {
        (window as any).__resetMockData();
      }
    });

    // Handle login and modals
    await dismissInitialModals(page);

    // Wait for Dashboard
    await expect(page.getByRole('heading', { name: 'FinVision' })).toBeVisible();

    // Ensure we are on Dashboard view (not Monthly)
    const monthlyViewButton = page.getByTitle('Switch to Monthly Focus');
    if (await monthlyViewButton.isVisible() === false) {
       // We might be in Monthly View, switch back
       const dashboardButton = page.getByTitle('Switch to Dashboard');
       if (await dashboardButton.isVisible()) {
           await dashboardButton.click();
       }
    }
  });

  test('should create a new savings goal', async ({ page }) => {
    // Open Modal
    await page.getByRole('button', { name: 'New Goal' }).click();

    // Fill form
    await page.getByLabel('Goal Name').fill('New Car Fund');
    await page.getByLabel('Target Amount').fill('25000');
    await page.getByLabel('Current Saved').fill('5000');

    // Target Date
    const nextYear = new Date().getFullYear() + 1;
    await page.getByLabel('Target Date').fill(`${nextYear}-12-31`);

    // Submit
    await page.getByRole('button', { name: 'Create Goal' }).click();

    // Verify Card appears
    await expect(page.getByText('New Car Fund')).toBeVisible();
    // Check for Euro symbol as per formatCurrency (en-IE) and no decimals
    await expect(page.getByText('Target: €25,000')).toBeVisible();

    // Verify Progress bar percentage (5000/25000 = 20%)
    await expect(page.getByText('20%')).toBeVisible();
  });

  test('should edit an existing savings goal', async ({ page }) => {
    // Create goal first
    await page.getByRole('button', { name: 'New Goal' }).click();
    await page.getByLabel('Goal Name').fill('Edit Me');
    await page.getByLabel('Target Amount').fill('1000');
    await page.getByLabel('Current Saved').fill('0');

    // Fill date to avoid form validation error
    const nextYear = new Date().getFullYear() + 1;
    await page.getByLabel('Target Date').fill(`${nextYear}-12-31`);

    await page.getByRole('button', { name: 'Create Goal' }).click();

    // Verify it exists
    const card = page.locator('.bg-white', { hasText: 'Edit Me' }).last();
    await expect(card).toBeVisible();

    // Hover over the card to reveal buttons
    await card.hover();

    // Click Edit button (first button in the absolute positioned div)
    // The buttons are hidden until hover.
    await card.locator('button').first().click();

    // Update Name
    await page.getByLabel('Goal Name').fill('Edited Goal');
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Verify update
    await expect(page.getByText('Edited Goal')).toBeVisible();
    await expect(page.getByText('Edit Me')).not.toBeVisible();
  });

  test('should delete a savings goal', async ({ page }) => {
    // Create goal first
    await page.getByRole('button', { name: 'New Goal' }).click();
    await page.getByLabel('Goal Name').fill('Delete Me');
    await page.getByLabel('Target Amount').fill('1000');
    await page.getByLabel('Current Saved').fill('0');

    // Fill date
    const nextYear = new Date().getFullYear() + 1;
    await page.getByLabel('Target Date').fill(`${nextYear}-12-31`);

    await page.getByRole('button', { name: 'Create Goal' }).click();

    // Hover over the card
    const card = page.locator('.bg-white', { hasText: 'Delete Me' }).last();
    await expect(card).toBeVisible();
    await card.hover();

    // Click Delete button (second button)
    await card.locator('button').nth(1).click();

    // Verify deletion
    await expect(page.getByText('Delete Me')).not.toBeVisible();
  });
});
