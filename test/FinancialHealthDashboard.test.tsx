import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import FinancialHealthDashboard from '../components/FinancialHealthDashboard';
import { AssetType, Frequency, TransactionType, Projection, Debt, Asset, DailyBalance, SavingsGoal } from '../types';

describe('FinancialHealthDashboard', () => {
  it('calculates metrics correctly for perfect health', () => {
    const mockProjections: Projection[] = [
      { id: '1', name: 'Salary', amount: 5000, frequency: Frequency.MONTHLY, type: TransactionType.INCOME, categoryId: '1', startDate: '2026-01-01', isActive: true },
      { id: '2', name: 'Rent', amount: 1000, frequency: Frequency.MONTHLY, type: TransactionType.EXPENSE, categoryId: '2', startDate: '2026-01-01', isActive: true }
    ];

    // Total income = 5000. Total expenses = 1000. Debt payments = 0.
    // Savings Rate = (4000/5000) * 100 = 80%. Target is 20%. Score is 25.
    // DTI = 0. Target is <30%. Score is 25.
    // Monthly living expenses = 1000. Liquid assets = 10000.
    // Emergency Fund = 10 months. Target is 6 months. Score is 25.
    // Cash flow = 100%. Target is 100%. Score is 25.
    // Total Health Score = 100.

    const mockAssets: Asset[] = [
      { id: '1', name: 'Cash Reserve', value: 10000, type: AssetType.CASH, liquidity: 'HIGH' }
    ];

    const mockTimelineData: DailyBalance[] = [
      { date: '2026-01-01', historicalBalance: null, projectedBalance: 15000, isProjected: true },
      { date: '2026-01-02', historicalBalance: null, projectedBalance: 15500, isProjected: true }
    ];

    render(
      <FinancialHealthDashboard
        transactions={[]}
        projections={mockProjections}
        debts={[]}
        assets={mockAssets}
        currentBalance={0}
        savingsGoals={[]}
        timelineData={mockTimelineData}
      />
    );

    const healthScoreElement = screen.getByTestId('health-score');
    expect(healthScoreElement.textContent).toBe('100');
    expect(screen.getByText('80%')).toBeDefined(); // Savings rate
    expect(screen.getByText('0%')).toBeDefined(); // DTI
    expect(screen.getByText('10 mo')).toBeDefined(); // EF
    expect(screen.getByText('100/100')).toBeDefined(); // Cash Flow
  });

  it('calculates metrics correctly for poor health', () => {
    const mockProjections: Projection[] = [
      { id: '1', name: 'Salary', amount: 3000, frequency: Frequency.MONTHLY, type: TransactionType.INCOME, categoryId: '1', startDate: '2026-01-01', isActive: true },
      { id: '2', name: 'Rent', amount: 2000, frequency: Frequency.MONTHLY, type: TransactionType.EXPENSE, categoryId: '2', startDate: '2026-01-01', isActive: true }
    ];

    const mockDebts: Debt[] = [
      { id: '1', name: 'Credit Card', currentBalance: 5000, interestRate: 20, minimumPayment: 1000 }
    ];

    // Income = 3000. Expenses = 2000. Debt = 1000.
    // Discretionary = 0. Savings Rate = 0%. Score = 0.
    // DTI = (1000/3000) * 100 = 33.3%. Score = 25 - (33.3/50)*25 = 8.33.
    // Base expenses = 3000. Liquid assets = 500.
    // EF = 500/3000 = 0.16 months. Score = (0.16/6)*25 = 0.69.
    // Cash Flow Stability: 0 positive days out of 1. Score = 0.
    // Total Score = 8.33 + 0.69 = 9.

    const mockAssets: Asset[] = [];

    const mockTimelineData: DailyBalance[] = [
      { date: '2026-01-01', historicalBalance: null, projectedBalance: -500, isProjected: true }
    ];

    render(
      <FinancialHealthDashboard
        transactions={[]}
        projections={mockProjections}
        debts={mockDebts}
        assets={mockAssets}
        currentBalance={500}
        savingsGoals={[]}
        timelineData={mockTimelineData}
      />
    );

    const healthScoreElement = screen.getByTestId('health-score');
    expect(healthScoreElement.textContent).toBe('9');
    expect(screen.getByText('0%')).toBeDefined(); // Savings rate
    expect(screen.getByText('33%')).toBeDefined(); // DTI
    expect(screen.getByText('0.2 mo')).toBeDefined(); // EF
    expect(screen.getByText('0/100')).toBeDefined(); // Cash Flow
  });
});
