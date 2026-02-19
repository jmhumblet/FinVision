import { describe, it, expect } from 'vitest';
import { calculatePayoff } from '../utils/debtUtils';
import { Debt, DebtStrategy } from '../types';

describe('calculatePayoff', () => {
  const debtA: Debt = {
    id: '1',
    name: 'Credit Card A',
    currentBalance: 1000,
    interestRate: 20,
    minimumPayment: 50
  };

  const debtB: Debt = {
    id: '2',
    name: 'Credit Card B',
    currentBalance: 5000,
    interestRate: 15,
    minimumPayment: 100
  };

  it('calculates payoff correctly for Snowball strategy', () => {
    // Total min payment = 150. Extra = 100. Total = 250.
    // Snowball: Pay A first (smaller balance).
    const result = calculatePayoff([debtA, debtB], DebtStrategy.SNOWBALL, 100);

    expect(result.timeline.length).toBeGreaterThan(0);
    expect(result.totalInterestPaid).toBeGreaterThan(0);
    // Determine last balance of Debt A
    const timeline = result.timeline;
    // Find when Debt A became 0
    const monthAcleared = timeline.findIndex(m => m.debts['1'] === 0);
    const monthBcleared = timeline.findIndex(m => m.debts['2'] === 0);

    expect(monthAcleared).toBeLessThan(monthBcleared);
  });

  it('calculates payoff correctly for Avalanche strategy', () => {
    // Avalanche: Pay A first (higher interest rate: 20 vs 15).
    // In this case, A is both smaller AND higher interest, so result is same order,
    // but we can check if logic holds for different scenario.

    const debtC: Debt = {
        id: '3',
        name: 'Big Loan',
        currentBalance: 10000,
        interestRate: 5,
        minimumPayment: 200
    };
    const debtD: Debt = {
        id: '4',
        name: 'Small Loan',
        currentBalance: 2000,
        interestRate: 2,
        minimumPayment: 50
    };

    // Snowball: Pay D first (2000 < 10000).
    const snowballResult = calculatePayoff([debtC, debtD], DebtStrategy.SNOWBALL, 100);
    const timelineS = snowballResult.timeline;
    const monthDClearedS = timelineS.findIndex(m => m.debts['4'] === 0);
    const monthCClearedS = timelineS.findIndex(m => m.debts['3'] === 0);
    expect(monthDClearedS).toBeLessThan(monthCClearedS);

    // Avalanche: Pay C first (5 > 2).
    // Wait, usually Avalanche prioritizes highest rate.
    // Here C is 5%, D is 2%. So C is first.
    // Even though C is much larger.
    const avalancheResult = calculatePayoff([debtC, debtD], DebtStrategy.AVALANCHE, 100);
    const timelineA = avalancheResult.timeline;
    const monthDClearedA = timelineA.findIndex(m => m.debts['4'] === 0);
    const monthCClearedA = timelineA.findIndex(m => m.debts['3'] === 0);

    // With 100 extra, C takes a long time. D might be paid off slowly via minimums while C gets extra.
    // But Avalanche puts EXTRA towards C. D only gets minimum.
    // So D will be paid off *later* than in Snowball (where it gets extra).
    // Or C will be paid off *sooner* than in Snowball.

    // Check total interest. Avalanche should save money.
    expect(avalancheResult.totalInterestPaid).toBeLessThan(snowballResult.totalInterestPaid);
  });
});
