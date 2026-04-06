import { test, expect } from '@playwright/test';
import { dismissInitialModals } from './fixtures/utils';

test.describe('Emergency Fund Stress Test', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Reset mock data before each test
    await page.goto('/');
    await page.evaluate(() => {
      if ((window as any).__resetMockData) {
        (window as any).__resetMockData();
      }
    });

    // 2. Clear out IndexedDB and LocalStorage to ensure a truly clean slate
    await page.evaluate(async () => {
      const dbs = await window.indexedDB.databases();
      for (const db of dbs) {
        if (db.name) window.indexedDB.deleteDatabase(db.name);
      }
      window.localStorage.clear();
    });

    // 3. Reload the page to apply the reset
    await page.goto('/');

    // 4. Handle guest login and initial modals
    await page.getByRole('button', { name: 'Continue as Guest' }).click();
    await dismissInitialModals(page);

    // 5. Navigate to Emergency Fund Stress Test view
    await page.getByTitle('Emergency Fund Stress Test').click();
  });

  test('should load the Emergency Fund Stress Test view and show base scenario by default', async ({ page }) => {
    // Verify view title
    await expect(page.getByRole('heading', { name: 'Emergency Fund Stress Test' })).toBeVisible();

    // Verify default active scenario
    const baseScenarioBtn = page.getByRole('button', { name: 'Income Loss (Base) Zero income, normal base expenses.' });
    await expect(baseScenarioBtn).toBeVisible();

    // Check that 'Income Loss (Base) Analysis' section is visible
    await expect(page.getByRole('heading', { name: 'Income Loss (Base) Analysis' })).toBeVisible();

    // Verify metrics exist
    await expect(page.getByText('Available Liquid Assets')).toBeVisible();
    await expect(page.getByText('Required Base Monthly Exp.')).toBeVisible();
    await expect(page.getByText('Calculated Runway')).toBeVisible();

    // Check recommendation box
    await expect(page.getByText('Excellent:').or(page.getByText('Moderate:')).or(page.getByText('Vulnerable:'))).toBeVisible();
  });

  test('should update metrics when Macro Shock scenario is selected', async ({ page }) => {
    const macroShockBtn = page.getByRole('button', { name: 'Macro Shock +20% expenses, -10% liquid assets.' });
    await macroShockBtn.click();

    await expect(page.getByRole('heading', { name: 'Macro Shock Analysis' })).toBeVisible();
  });

  test('should update metrics when Large Unexpected Expense scenario is selected', async ({ page }) => {
    const largeExpenseBtn = page.getByRole('button', { name: 'Large Unexpected Expense -€5,000 hit to liquid assets.' });
    await largeExpenseBtn.click();

    await expect(page.getByRole('heading', { name: 'Large Unexpected Expense Analysis' })).toBeVisible();
  });
});
