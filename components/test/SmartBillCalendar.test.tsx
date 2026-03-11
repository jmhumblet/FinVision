import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SmartBillCalendar from '../SmartBillCalendar';
import { Projection, TransactionType, Frequency, DailyBalance, Category } from '../../types';

const mockCategories: Category[] = [
  { id: '1', name: 'Salary', color: '#10b981' },
  { id: '2', name: 'Rent', color: '#ef4444' }
];

const mockProjections: Projection[] = [
  {
    id: 'proj1',
    name: 'Internet Bill',
    amount: 50,
    frequency: Frequency.MONTHLY,
    startDate: '2024-05-15',
    categoryId: '2',
    type: TransactionType.EXPENSE,
    isActive: true
  },
  {
    id: 'proj2',
    name: 'Bonus',
    amount: 500,
    frequency: Frequency.ONCE,
    startDate: '2024-05-20',
    categoryId: '1',
    type: TransactionType.INCOME,
    isActive: true
  }
];

const mockTimelineData: DailyBalance[] = [
  { date: '2024-05-15', historicalBalance: null, projectedBalance: 1000, isProjected: true },
  { date: '2024-05-20', historicalBalance: null, projectedBalance: -50, isProjected: true }
];

describe('SmartBillCalendar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-05-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the calendar grid for the current month', () => {
    render(
      <SmartBillCalendar
        projections={[]}
        timelineData={[]}
        categories={mockCategories}
        onUpdateProjection={vi.fn()}
        onAddProjection={vi.fn()}
        onAddTransaction={vi.fn()}
      />
    );

    // Header displays correct month
    expect(screen.getByText('May 2024')).toBeInTheDocument();

    // Days of the week are present
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });

    // Contains cell for the 1st
    const day1Cells = screen.getAllByText('1');
    expect(day1Cells.length).toBeGreaterThan(0);
  });

  it('displays projection pills correctly on their dates', () => {
    render(
      <SmartBillCalendar
        projections={mockProjections}
        timelineData={mockTimelineData}
        categories={mockCategories}
        onUpdateProjection={vi.fn()}
        onAddProjection={vi.fn()}
        onAddTransaction={vi.fn()}
      />
    );

    expect(screen.getByText('Internet Bill')).toBeInTheDocument();
    expect(screen.getByText('€50')).toBeInTheDocument();
    expect(screen.getByText('Bonus')).toBeInTheDocument();
    expect(screen.getByText('€500')).toBeInTheDocument();
  });

  it('highlights negative balances correctly', () => {
    render(
      <SmartBillCalendar
        projections={mockProjections}
        timelineData={mockTimelineData}
        categories={mockCategories}
        onUpdateProjection={vi.fn()}
        onAddProjection={vi.fn()}
        onAddTransaction={vi.fn()}
      />
    );

    // Since timelineData has a projectedBalance of -50 for 2024-05-20
    const negativeBalanceText = screen.getByText('-€50');
    expect(negativeBalanceText).toBeInTheDocument();
    // It should be within a warning container
    const cell = negativeBalanceText.closest('div.min-h-\\[120px\\]');
    expect(cell).toHaveClass('bg-red-50');
  });

  it('triggers onAddTransaction and onAddProjection on header button clicks', () => {
    const onAddTransaction = vi.fn();
    const onAddProjection = vi.fn();

    render(
      <SmartBillCalendar
        projections={[]}
        timelineData={[]}
        categories={mockCategories}
        onUpdateProjection={vi.fn()}
        onAddProjection={onAddProjection}
        onAddTransaction={onAddTransaction}
      />
    );

    const txButton = screen.getByRole('button', { name: /transaction/i });
    const pjButton = screen.getByRole('button', { name: /bill \/ income/i });

    fireEvent.click(txButton);
    expect(onAddTransaction).toHaveBeenCalledWith();

    fireEvent.click(pjButton);
    expect(onAddProjection).toHaveBeenCalledWith();
  });

  it('triggers onAddTransaction with correct date when clicking a day cell', () => {
    const onAddTransaction = vi.fn();

    // Create a specific container and pick a cell reliably
    const { container } = render(
      <SmartBillCalendar
        projections={[]}
        timelineData={[]}
        categories={mockCategories}
        onUpdateProjection={vi.fn()}
        onAddProjection={vi.fn()}
        onAddTransaction={onAddTransaction}
      />
    );

    // The cell for May 15th
    const cellContents = screen.getByText('15');
    const cell = cellContents.closest('.min-h-\\[120px\\]');

    if (cell) {
        fireEvent.click(cell);
        expect(onAddTransaction).toHaveBeenCalledWith('2024-05-15');
    } else {
        throw new Error('Cell not found');
    }
  });

  it('handles drag and drop to update projection start date', () => {
      const onUpdateProjection = vi.fn();

      render(
        <SmartBillCalendar
          projections={mockProjections}
          timelineData={[]}
          categories={mockCategories}
          onUpdateProjection={onUpdateProjection}
          onAddProjection={vi.fn()}
          onAddTransaction={vi.fn()}
        />
      );

      // Find the pill
      const pill = screen.getByText('Bonus').closest('div[draggable="true"]');
      expect(pill).toBeInTheDocument();

      // Find a target cell (e.g., 25th)
      const cellContents = screen.getByText('25');
      const targetCell = cellContents.closest('.min-h-\\[120px\\]');
      expect(targetCell).toBeInTheDocument();

      // Mock dataTransfer
      const mockDataTransfer = {
          data: {} as Record<string, string>,
          setData: function(key: string, val: string) { this.data[key] = val; },
          getData: function(key: string) { return this.data[key]; },
      };

      // Drag Start
      fireEvent.dragStart(pill!, { dataTransfer: mockDataTransfer });

      // Drag Over target
      fireEvent.dragOver(targetCell!);

      // Drop on target
      fireEvent.drop(targetCell!, { dataTransfer: mockDataTransfer });

      expect(onUpdateProjection).toHaveBeenCalledWith({
          ...mockProjections[1],
          startDate: '2024-05-25'
      });
  });
});
