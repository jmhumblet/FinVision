import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SmartBillCalendar from '../SmartBillCalendar';
import { TransactionType, Frequency } from '../../types';

describe('SmartBillCalendar', () => {
  const mockTransactions = [
    { id: 't1', date: '2026-03-15', description: 'Groceries', amount: 50, categoryId: 'cat1', type: TransactionType.EXPENSE },
    { id: 't2', date: '2026-03-20', description: 'Salary', amount: 2000, categoryId: 'cat2', type: TransactionType.INCOME }
  ];

  const mockProjections = [
    { id: 'p1', name: 'Rent', amount: 1000, frequency: Frequency.MONTHLY, startDate: '2026-03-01', categoryId: 'cat3', type: TransactionType.EXPENSE, isActive: true },
    { id: 'p2', name: 'Bonus', amount: 500, frequency: Frequency.ONCE, startDate: '2026-03-28', categoryId: 'cat4', type: TransactionType.INCOME, isActive: true }
  ];

  const mockTimelineData = [
    { date: '2026-03-25', historicalBalance: null, projectedBalance: -100, isProjected: true },
    { date: '2026-03-26', historicalBalance: null, projectedBalance: 150, isProjected: true }
  ];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-10T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders the calendar and specific events correctly', () => {
    render(
      <SmartBillCalendar
        transactions={mockTransactions}
        projections={mockProjections}
        timelineData={mockTimelineData}
        onUpdateTransaction={vi.fn()}
        onUpdateProjection={vi.fn()}
        onAddTransaction={vi.fn()}
        onAddProjection={vi.fn()}
      />
    );

    // Verify header and month navigation
    expect(screen.getByText('Smart Bill Calendar')).toBeInTheDocument();
    expect(screen.getByText('March 2026')).toBeInTheDocument();

    // Verify events are displayed
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Salary')).toBeInTheDocument();
    expect(screen.getByText('Rent')).toBeInTheDocument();
    expect(screen.getByText('Bonus')).toBeInTheDocument();

    // Verify negative balance warning is shown (for 2026-03-25)
    // There might be multiple SVGs, but at least one should be present and titled correctly
    expect(screen.getByTitle('Projected balance drops below $0')).toBeInTheDocument();
  });

  it('navigates to the next and previous month', () => {
    const { container } = render(
      <SmartBillCalendar
        transactions={[]}
        projections={[]}
        timelineData={[]}
        onUpdateTransaction={vi.fn()}
        onUpdateProjection={vi.fn()}
        onAddTransaction={vi.fn()}
        onAddProjection={vi.fn()}
      />
    );

    expect(screen.getByText('March 2026')).toBeInTheDocument();

    const buttons = container.querySelectorAll('.p-1\\.5.hover\\:bg-white');
    const prevButton = buttons[0];
    const nextButton = buttons[1];

    // Click next
    fireEvent.click(nextButton);
    expect(screen.getByText('April 2026')).toBeInTheDocument();

    // Click prev twice to get to February
    fireEvent.click(prevButton);
    fireEvent.click(prevButton);
    expect(screen.getByText('February 2026')).toBeInTheDocument();
  });
});
