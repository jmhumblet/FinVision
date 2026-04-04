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

  it('opens cancel modal on click', async () => {
    render(
      <SubscriptionManager
        projections={mockProjections}
        categories={mockCategories}
        onUpdateProjection={mockOnUpdateProjection}
      />
    );

    // Get all cancel buttons
    const cancelBtns = screen.getAllByText('Cancel');
    // Note: The list order depends on sorting logic. Assuming sorting by amount, Netflix(15) is last, Gym(50) is first if sorted desc.
    // Let's just click the button and look for 'Cancel' + name dynamically.
    // Wait, the test expects 'Netflix', let's find the specific cancel button.
    const netflixCard = screen.getByText('Netflix').closest('div');
    // For simplicity, let's use exact match or find by test id if available, but let's just click the first and assert.
    // Actually, sorting in SubscriptionManager is likely by cost desc. Gym (50), Netflix (15), Yearly Sub (10/mo).
    // Let's find the Cancel button specifically for Netflix.

    const netflixCancelBtn = screen.getAllByText('Cancel').find(btn => {
      // Find the card container and check if it has 'Netflix'
      return btn.closest('.bg-white')?.textContent?.includes('Netflix');
    });

    if (netflixCancelBtn) {
        fireEvent.click(netflixCancelBtn);
    } else {
        fireEvent.click(cancelBtns[0]); // fallback
    }

    expect(screen.getByText('Cancel Netflix')).toBeInTheDocument();
    expect(screen.getByText(/Find Cancellation Guide/i)).toBeInTheDocument();
  });

  it('calls onUpdateProjection when Stop Tracking is clicked', async () => {
    render(
      <SubscriptionManager
        projections={mockProjections}
        categories={mockCategories}
        onUpdateProjection={mockOnUpdateProjection}
      />
    );

    const netflixCancelBtn = screen.getAllByText('Cancel').find(btn => {
      return btn.closest('.bg-white')?.textContent?.includes('Netflix');
    });

    if (netflixCancelBtn) {
        fireEvent.click(netflixCancelBtn);
    } else {
        fireEvent.click(screen.getAllByText('Cancel')[0]);
    }

    const stopTrackingBtn = screen.getByText('Stop Tracking (Deactivate)');
    fireEvent.click(stopTrackingBtn);

    // If it clicked Netflix, it should be called with Netflix
    expect(mockOnUpdateProjection).toHaveBeenCalledWith(expect.objectContaining({
        isActive: false
    }));
  });
});
