import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SmartBillCalendar from '../SmartBillCalendar';
import { TransactionType, Frequency } from '../../types';

// Mock formatCurrency
vi.mock('../../utils/financialUtils', async () => {
  const actual = await vi.importActual('../../utils/financialUtils');
  return {
    ...actual,
    formatCurrency: (val: number) => `€${val}`,
  };
});

describe('SmartBillCalendar', () => {
  const mockTransactions = [
    {
      id: 't1',
      date: '2025-05-15',
      description: 'Test Salary',
      amount: 5000,
      categoryId: '1',
      type: TransactionType.INCOME,
    }
  ];

  const mockProjections = [
    {
      id: 'p1',
      name: 'Rent',
      amount: 1000,
      frequency: Frequency.MONTHLY,
      startDate: '2025-01-01',
      categoryId: '2',
      type: TransactionType.EXPENSE,
      isActive: true,
    }
  ];

  const mockTimelineData = [
    { date: '2025-05-15', historicalBalance: null, projectedBalance: 100, isProjected: true },
    { date: '2025-05-20', historicalBalance: null, projectedBalance: -50, isProjected: true },
  ];

  const mockCategories = [];

  const mockOnAddTransaction = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 4, 1)); // May 1st 2025
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the correct month and year', () => {
    render(
      <SmartBillCalendar
        transactions={mockTransactions}
        projections={mockProjections}
        timelineData={mockTimelineData}
        categories={mockCategories}
        onAddTransaction={mockOnAddTransaction}
      />
    );

    expect(screen.getByText('May 2025')).toBeInTheDocument();
  });

  it('renders transactions on the correct date', () => {
    render(
      <SmartBillCalendar
        transactions={mockTransactions}
        projections={mockProjections}
        timelineData={mockTimelineData}
        categories={mockCategories}
        onAddTransaction={mockOnAddTransaction}
      />
    );

    expect(screen.getByText('Test Salary')).toBeInTheDocument();
    expect(screen.getByText('€5000')).toBeInTheDocument();
  });

  it('renders projections on the correct date', () => {
    render(
      <SmartBillCalendar
        transactions={mockTransactions}
        projections={mockProjections}
        timelineData={mockTimelineData}
        categories={mockCategories}
        onAddTransaction={mockOnAddTransaction}
      />
    );

    // Rent is monthly on the 1st.
    // In May 2025 view, it should appear on May 1st and possibly June 1st depending on padding.
    const rentItems = screen.getAllByText('Rent');
    expect(rentItems.length).toBeGreaterThan(0);

    const amountItems = screen.getAllByText('€1000');
    expect(amountItems.length).toBeGreaterThan(0);
  });

  it('shows balance warning when projected balance is negative', () => {
    render(
      <SmartBillCalendar
        transactions={mockTransactions}
        projections={mockProjections}
        timelineData={mockTimelineData}
        categories={mockCategories}
        onAddTransaction={mockOnAddTransaction}
      />
    );

    // On May 20th, balance is -50
    const alert = screen.getByTitle('Projected balance drops below zero');
    expect(alert).toBeInTheDocument();
  });

  it('calls onAddTransaction with correct date when clicking a day', () => {
    render(
      <SmartBillCalendar
        transactions={mockTransactions}
        projections={mockProjections}
        timelineData={mockTimelineData}
        categories={mockCategories}
        onAddTransaction={mockOnAddTransaction}
      />
    );

    // Click on the transaction element which is inside the day cell
    const salaryElement = screen.getByText('Test Salary');
    fireEvent.click(salaryElement);

    expect(mockOnAddTransaction).toHaveBeenCalledWith('2025-05-15');
  });
});
