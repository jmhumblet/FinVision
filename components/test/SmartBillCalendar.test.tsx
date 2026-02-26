import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import SmartBillCalendar from '../SmartBillCalendar';
import { Transaction, Projection, Category, DailyBalance, TransactionType, Frequency } from '../../types';
import { vi } from 'vitest';

const mockTransactions: Transaction[] = [
  {
    id: 't1',
    date: '2023-10-15',
    description: 'Grocery',
    amount: 50,
    categoryId: '1',
    type: TransactionType.EXPENSE
  }
];

const mockProjections: Projection[] = [
  {
    id: 'p1',
    name: 'Rent',
    amount: 1000,
    frequency: Frequency.MONTHLY,
    startDate: '2023-01-01',
    categoryId: '2',
    type: TransactionType.EXPENSE,
    isActive: true
  }
];

const mockCategories: Category[] = [
  { id: '1', name: 'Food', color: 'red' },
  { id: '2', name: 'Housing', color: 'blue' }
];

const mockTimelineData: DailyBalance[] = [
    { date: '2023-10-15', historicalBalance: 1000, projectedBalance: 1000, isProjected: false }
];

describe('SmartBillCalendar', () => {
  beforeEach(() => {
    // Mock Date to ensure consistent month rendering (October 2023)
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-10-01'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders correctly', () => {
    render(
      <SmartBillCalendar
        transactions={mockTransactions}
        projections={mockProjections}
        categories={mockCategories}
        timelineData={mockTimelineData}
        onAddTransaction={() => {}}
        onUpdateTransaction={() => {}}
        onDeleteTransaction={() => {}}
        onAddProjection={() => {}}
        onUpdateProjection={() => {}}
        onDeleteProjection={() => {}}
      />
    );

    expect(screen.getByText('Bill Calendar')).toBeInTheDocument();
    expect(screen.getByText('October 2023')).toBeInTheDocument();
  });

  it('displays transactions on the correct date', () => {
    render(
      <SmartBillCalendar
        transactions={mockTransactions}
        projections={mockProjections}
        categories={mockCategories}
        timelineData={mockTimelineData}
        onAddTransaction={() => {}}
        onUpdateTransaction={() => {}}
        onDeleteTransaction={() => {}}
        onAddProjection={() => {}}
        onUpdateProjection={() => {}}
        onDeleteProjection={() => {}}
      />
    );

    expect(screen.getByText('Grocery')).toBeInTheDocument();
  });

  it('opens day details on click', () => {
      render(
      <SmartBillCalendar
        transactions={mockTransactions}
        projections={mockProjections}
        categories={mockCategories}
        timelineData={mockTimelineData}
        onAddTransaction={() => {}}
        onUpdateTransaction={() => {}}
        onDeleteTransaction={() => {}}
        onAddProjection={() => {}}
        onUpdateProjection={() => {}}
        onDeleteProjection={() => {}}
      />
    );

    // Click on the day 15
    fireEvent.click(screen.getByText('15'));

    // Expect modal to open
    // We check for "Add Transaction" button which is only in the modal
    expect(screen.getByText('Add Transaction')).toBeInTheDocument();
  });
});
