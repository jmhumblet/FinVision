import { test, expect } from '@playwright/test';

test.describe('Smart Bill Calendar E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Log in as guest
    const guestButton = page.getByRole('button', { name: /continue as guest/i });
    await guestButton.click();

    // Bypass reconciliation modal if it appears
    const completeButton = page.getByRole('button', { name: /complete reconciliation/i });
    if (await completeButton.isVisible({ timeout: 5000 })) {
      await completeButton.click();
    }
  });

  test('navigates to Calendar view and displays grid', async ({ page }) => {
    // Click on the Calendar navigation button
    const calendarNavButton = page.getByRole('button', { name: /calendar/i });
    await expect(calendarNavButton).toBeVisible();
    await calendarNavButton.click();

    // Verify we are on the Calendar view
    await expect(page.getByRole('heading', { name: 'Smart Bill Calendar' })).toBeVisible();

    // Verify days of the week are present
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (const day of days) {
      // Use exact: true to match exactly the text, because "Mon" might be a substring of "Monthly"
      await expect(page.getByText(day, { exact: true })).toBeVisible();
    }

    // Check that we can see a month/year string (like "January 2026")
    // Since we don't know the exact date, we can just assert that something matching the pattern exists,
    // or rely on the previous assertions to ensure the component rendered.
  });
});
