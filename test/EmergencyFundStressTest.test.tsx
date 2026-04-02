import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import EmergencyFundStressTest from '../components/EmergencyFundStressTest';
import { Asset, AssetType, Projection, TransactionType, Frequency } from '../types';

describe('EmergencyFundStressTest', () => {
  const mockAssets: Asset[] = [
    { id: '1', name: 'Savings', value: 5000, type: AssetType.CASH, liquidity: 'HIGH' },
    { id: '2', name: 'Car', value: 10000, type: AssetType.VEHICLE, liquidity: 'LOW' }, // Should not be included in liquid
  ];

  const mockProjections: Projection[] = [
    { id: 'p1', name: 'Rent', amount: 1000, frequency: Frequency.MONTHLY, startDate: '2026-01-01', categoryId: '1', type: TransactionType.EXPENSE, isActive: true },
    { id: 'p2', name: 'Groceries', amount: 500, frequency: Frequency.MONTHLY, startDate: '2026-01-01', categoryId: '2', type: TransactionType.EXPENSE, isActive: true },
    { id: 'p3', name: 'Salary', amount: 4000, frequency: Frequency.MONTHLY, startDate: '2026-01-01', categoryId: '3', type: TransactionType.INCOME, isActive: true },
    { id: 'p4', name: 'Old Gym', amount: 100, frequency: Frequency.MONTHLY, startDate: '2026-01-01', categoryId: '4', type: TransactionType.EXPENSE, isActive: false }, // Inactive, shouldn't count
  ];

  it('calculates and displays correct runways based on liquid assets and base expenses', () => {
    // Liquid Assets = 2000 (currentBalance) + 5000 (HIGH liquidity asset) = 7000
    // Monthly Base Expenses = 1000 + 500 = 1500
    // Expected Base Runway = 7000 / 1500 = 4.666... -> 4.7 mo

    render(
      <EmergencyFundStressTest
        assets={mockAssets}
        projections={mockProjections}
        currentBalance={2000}
      />
    );

    // Current Runway is 4.7. We expect two instances because 'Base' and 'Sudden Income Loss' use the same base runway
    expect(screen.getAllByText('4.7 mo').length).toBeGreaterThan(0);

    // Large Expense Runway = (7000 - 5000) / 1500 = 2000 / 1500 = 1.333... -> 1.3 mo
    expect(screen.getByText('1.3 mo')).toBeInTheDocument();

    // Macro Shock (20% inflation) = 7000 / (1500 * 1.2) = 7000 / 1800 = 3.888... -> 3.9 mo
    expect(screen.getByText('3.9 mo')).toBeInTheDocument();
  });

  it('handles zero expenses without crashing (shows high runway)', () => {
    const noExpenseProjections: Projection[] = [
       { id: 'p1', name: 'Salary', amount: 4000, frequency: Frequency.MONTHLY, startDate: '2026-01-01', categoryId: '3', type: TransactionType.INCOME, isActive: true }
    ];

    render(
      <EmergencyFundStressTest
        assets={mockAssets}
        projections={noExpenseProjections}
        currentBalance={2000}
      />
    );

    // Liquid = 7000. Expenses fallback to 1. Runway = 7000.0 mo
    expect(screen.getAllByText('7000.0 mo')[0]).toBeInTheDocument();
  });

  it('recommends building savings if runway is under 3 months', () => {
     // Liquid = 1000 + 0 = 1000. Expenses = 1500. Runway = 0.6 mo
     render(
        <EmergencyFundStressTest
          assets={[]}
          projections={mockProjections}
          currentBalance={1000}
        />
      );

      expect(screen.getByText('High Risk: Build Liquid Savings')).toBeInTheDocument();
  });

  it('recommends optimizing assets if runway is 6+ months', () => {
    // Liquid = 10000 + 5000 = 15000. Expenses = 1500. Runway = 10 mo
    render(
       <EmergencyFundStressTest
         assets={mockAssets}
         projections={mockProjections}
         currentBalance={10000}
       />
     );

     expect(screen.getByText('Low Risk: Optimize Assets')).toBeInTheDocument();
 });
});
