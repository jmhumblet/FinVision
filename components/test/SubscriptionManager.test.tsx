import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SubscriptionManager from '../SubscriptionManager';
import { Projection, Category, TransactionType, Frequency } from '../../types';

const mockCategories: Category[] = [
  { id: '1', name: 'Utilities', color: '#blue' },
  { id: '2', name: 'Entertainment', color: '#purple' },
];

const mockProjections: Projection[] = [
  {
    id: '1',
    name: 'Netflix',
    amount: 15,
    frequency: Frequency.MONTHLY,
    startDate: '2023-01-01',
    categoryId: '2',
    type: TransactionType.EXPENSE,
    isActive: true
  },
  {
    id: '2',
    name: 'Gym',
    amount: 50,
    frequency: Frequency.MONTHLY,
    startDate: '2023-01-05',
    categoryId: '1',
    type: TransactionType.EXPENSE,
    isActive: true
  },
  {
    id: '3',
    name: 'Salary',
    amount: 3000,
    frequency: Frequency.MONTHLY,
    startDate: '2023-01-01',
    categoryId: '1',
    type: TransactionType.INCOME, // Should be ignored
    isActive: true
  },
  {
    id: '4',
    name: 'One Time Fee',
    amount: 100,
    frequency: Frequency.ONCE, // Should be ignored
    startDate: '2023-01-01',
    categoryId: '1',
    type: TransactionType.EXPENSE,
    isActive: true
  },
  {
    id: '5',
    name: 'Yearly Sub',
    amount: 120,
    frequency: Frequency.YEARLY,
    startDate: '2023-01-01',
    categoryId: '2',
    type: TransactionType.EXPENSE,
    isActive: true
  }
];

describe('SubscriptionManager', () => {
  const mockOnUpdateProjection = vi.fn();

  it('renders recurring expenses only', () => {
    render(
      <SubscriptionManager
        projections={mockProjections}
        categories={mockCategories}
        onUpdateProjection={mockOnUpdateProjection}
      />
    );

    expect(screen.getByText('Netflix')).toBeInTheDocument();
    expect(screen.getByText('Gym')).toBeInTheDocument();
    expect(screen.getByText('Yearly Sub')).toBeInTheDocument();

    expect(screen.queryByText('Salary')).not.toBeInTheDocument();
    expect(screen.queryByText('One Time Fee')).not.toBeInTheDocument();
  });

  it('calculates total monthly cost correctly', () => {
     render(
      <SubscriptionManager
        projections={mockProjections}
        categories={mockCategories}
        onUpdateProjection={mockOnUpdateProjection}
      />
    );

    // Netflix (15) + Gym (50) + Yearly Sub (120/12 = 10) = 75
    // Format might depend on locale, but checking text content for 75
    // The formatCurrency uses en-IE, so €75

    // We check for the summary total
    expect(screen.getByText(/Total Monthly Cost/i)).toBeInTheDocument();
    expect(screen.getByText('€75')).toBeInTheDocument();
  });

  it('toggles to yearly view', () => {
    render(
      <SubscriptionManager
        projections={mockProjections}
        categories={mockCategories}
        onUpdateProjection={mockOnUpdateProjection}
      />
    );

    const yearlyBtn = screen.getByText('Yearly');
    fireEvent.click(yearlyBtn);

    expect(screen.getByText(/Total Yearly Cost/i)).toBeInTheDocument();

    // Netflix (15*12=180) + Gym (50*12=600) + Yearly Sub (120) = 900
    expect(screen.getByText('€900')).toBeInTheDocument();
  });

  it('opens cancel modal on click', () => {
    render(
      <SubscriptionManager
        projections={mockProjections}
        categories={mockCategories}
        onUpdateProjection={mockOnUpdateProjection}
      />
    );

    const cancelBtns = screen.getAllByText('Cancel');
    fireEvent.click(cancelBtns[1]); // Click second cancel button (Netflix comes after Gym alphabetically)

    expect(screen.getByText('Cancel Netflix')).toBeInTheDocument();
    expect(screen.getByText(/Find Cancellation Guide/i)).toBeInTheDocument();
  });

  it('calls onUpdateProjection when Stop Tracking is clicked', () => {
    render(
      <SubscriptionManager
        projections={mockProjections}
        categories={mockCategories}
        onUpdateProjection={mockOnUpdateProjection}
      />
    );

    const cancelBtns = screen.getAllByText('Cancel');
    fireEvent.click(cancelBtns[1]); // Netflix

    const stopTrackingBtn = screen.getByText('Stop Tracking (Deactivate)');
    fireEvent.click(stopTrackingBtn);

    expect(mockOnUpdateProjection).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Netflix',
        isActive: false
    }));
  });
});
