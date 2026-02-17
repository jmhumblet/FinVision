import { Page, expect } from '@playwright/test';

/**
 * Handles initial modals and login flow to ensure the app is in a stable state.
 */
export async function dismissInitialModals(page: Page, options: { 
  actualBalance?: string, 
  setDefaultView?: boolean 
} = {}) {
  // 1. Handle Guest Login if visible
  const guestBtn = page.getByRole('button', { name: /Continue as Guest/i });
  if (await guestBtn.isVisible()) {
    await guestBtn.click();
  }

  // 2. Handle Reconciliation Modal (Step-based)
  const reconHeader = page.getByText(/Monthly Reconciliation/i);
  if (await reconHeader.isVisible()) {
    // Step 1 -> Step 2
    await page.getByRole('button', { name: /Next: Verify Balance/i }).click();
    
    // Step 2
    if (options.actualBalance) {
      await page.getByLabel(/What is your actual bank balance today?/i).fill(options.actualBalance);
    }
    if (options.setDefaultView) {
      await page.getByLabel(/Set Monthly View as my default landing page/i).check();
    }

    // Step 2 -> Finish
    await page.getByRole('button', { name: /Save & Finish/i }).click();
    await waitForOverlayToDismiss(page);
  }

  // 3. Handle Monthly Setup Modal
  const setupHeader = page.getByText(/Monthly Setup for/i);
  if (await setupHeader.isVisible()) {
    if (options.actualBalance) {
      await page.getByLabel(/Actual Bank Balance/i).fill(options.actualBalance);
    }
    if (options.setDefaultView) {
      await page.getByLabel(/Set Monthly View as my default landing page/i).check();
    }
    await page.getByRole('button', { name: /Save & Continue/i }).click();
    await waitForOverlayToDismiss(page);
  }

  // Ensure no more overlays are blocking
  await expect(page.locator('.fixed.inset-0.z-50')).not.toBeVisible();
}

/**
 * Specifically waits for the common overlay backdrop to be removed from DOM or hidden
 */
export async function waitForOverlayToDismiss(page: Page) {
  const overlay = page.locator('.fixed.inset-0.z-50');
  await overlay.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {
    console.log('Overlay did not dismiss within 5s');
  });
}
