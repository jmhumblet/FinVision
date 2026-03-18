import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FinancialHealthDashboard from '../FinancialHealthDashboard';
import { TransactionType, Frequency, AssetType } from '../../types';
import { describe, it, expect } from 'vitest';

describe('FinancialHealthDashboard', () => {
  it('renders correctly with mocked data', () => {
    const transactions = [
        { id: '1', date: '2023-01-01', amount: 1000, type: TransactionType.INCOME, description: 'Salary', categoryId: '1' }
    ];
    const projections = [
        { id: '1', name: 'Salary', amount: 5000, frequency: Frequency.MONTHLY, startDate: '2023-01-01', type: TransactionType.INCOME, isActive: true, categoryId: '1' }
    ];
    const assets = [
        { id: '1', name: 'Savings', value: 15000, type: AssetType.CASH, liquidity: 'HIGH' as 'HIGH' }
    ];
    const debts = [
        { id: '1', name: 'Credit Card', currentBalance: 1000, interestRate: 15, minimumPayment: 50, categoryId: '1' }
    ];

    render(
      <FinancialHealthDashboard
        transactions={transactions}
        projections={projections}
        assets={assets}
        debts={debts}
      />
    );

    expect(screen.getByText('Financial Health Score')).toBeInTheDocument();
    expect(screen.getByText('Savings Rate')).toBeInTheDocument();
    expect(screen.getByText('Debt-to-Income')).toBeInTheDocument();
    expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
    expect(screen.getByText('Cash Flow Stability')).toBeInTheDocument();
    expect(screen.getByText('Actionable Insights')).toBeInTheDocument();
  });
});
