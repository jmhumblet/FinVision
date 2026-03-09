import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ReconciliationModal from '../ReconciliationModal';
import { mockProjections } from '../../e2e/fixtures/mockData';

describe('ReconciliationModal', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the unreconciled transactions step', () => {
    render(
      <ReconciliationModal 
        projections={mockProjections} 
        lastReconciledDate="2026-01-31"
        initialBalance={1000}
        monthKey="2026-02" 
        onSubmit={mockOnSubmit} 
      />
    );

    expect(screen.getByText(/Monthly Reconciliation/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Rent/i)[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next: Verify Balance/i })).toBeInTheDocument();
  });

  it('progresses to balance verification and submits', () => {
    render(
      <ReconciliationModal 
        projections={mockProjections} 
        lastReconciledDate="2026-01-31"
        initialBalance={1000}
        monthKey="2026-02" 
        onSubmit={mockOnSubmit} 
      />
    );

    // Step 1: Click Next
    fireEvent.click(screen.getByRole('button', { name: /Next: Verify Balance/i }));

    // Step 2: Enter balance
    const balanceInput = screen.getByLabelText(/What is your actual bank balance today?/i);
    fireEvent.change(balanceInput, { target: { value: '3000' } });

    // Click Save
    fireEvent.click(screen.getByRole('button', { name: /Save & Finish/i }));

    expect(mockOnSubmit).toHaveBeenCalled();
    const call = mockOnSubmit.mock.calls[0][0];
    expect(call.actualBalance).toBe(3000);
    // Theoretical calculations with mocked date (2026-02-15):
    // Unreconciled between 2026-02-01 and 2026-02-15 are:
    // Monthly Salary (2026-02-01) = +3000
    // Rent (2026-02-01) = -1200
    // Total unreconciled = +1800
    // Theoretical Balance = Initial (1000) + Unreconciled (1800) = 2800.
    // Actual Balance entered = 3000.
    // Gap = 3000 - 2800 = 200.
    expect(call.adjustmentTransaction.amount).toBe(200);
  });
});
