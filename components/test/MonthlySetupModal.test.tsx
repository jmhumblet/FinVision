import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MonthlySetupModal from '../MonthlySetupModal';
import { mockProjections } from '../../e2e/fixtures/mockData';

describe('MonthlySetupModal', () => {
  const mockOnSubmit = vi.fn();

  it('renders the balance input and transaction checklist', () => {
    render(
      <MonthlySetupModal 
        projections={mockProjections} 
        monthKey="2026-02" 
        onSubmit={mockOnSubmit} 
      />
    );

    expect(screen.getByText(/Monthly Setup for February 2026/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Actual Bank Balance/i)).toBeInTheDocument();
    expect(screen.getByText(/Monthly Salary/i)).toBeInTheDocument();
    expect(screen.getByText(/Rent/i)).toBeInTheDocument();
  });

  it('submits the correct data when form is filled', () => {
    render(
      <MonthlySetupModal 
        projections={mockProjections} 
        monthKey="2026-02" 
        onSubmit={mockOnSubmit} 
      />
    );

    // Fill balance
    const balanceInput = screen.getByLabelText(/Actual Bank Balance/i);
    fireEvent.change(balanceInput, { target: { value: '2500' } });

    // Clear one transaction (e.g., Rent occurred on Feb 1st)
    // Assuming each occurrence has a checkbox with an id or label
    const rentCheckbox = screen.getByLabelText(/Rent/i);
    fireEvent.click(rentCheckbox);

    // Set as default view
    const defaultViewCheckbox = screen.getByLabelText(/Set Monthly View as my default landing page/i);
    fireEvent.click(defaultViewCheckbox);

    // Submit
    const saveButton = screen.getByRole('button', { name: /Save & Continue/i });
    fireEvent.click(saveButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      actualBalance: 2500,
      clearedProjectionIds: ['proj-2_2026-02-01'], // Assuming the format id_date
      setDefaultView: true
    });
  });
});
