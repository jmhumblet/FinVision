import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MonthlyDashboard from '../MonthlyDashboard';
import { vi } from 'vitest';

describe('MonthlyDashboard', () => {
  const mockSummary = {
    remainingSpendable: 1500,
    totalProjectedIncome: 3000,
    totalProjectedExpenses: 1200,
    spentPercentage: 60
  };

  const mockOnSwitchView = vi.fn();
  const mockOnOpenSettings = vi.fn();

  it('renders the hero counter with remaining spendable', () => {
    render(
      <MonthlyDashboard 
        summary={mockSummary} 
        monthName="February 2026" 
        onSwitchView={mockOnSwitchView}
        onOpenSettings={mockOnOpenSettings}
      />
    );
    
    expect(screen.getByText(/Remaining Spendable/i)).toBeInTheDocument();
    expect(screen.getByText(/€1,500/i)).toBeInTheDocument();
  });

  it('renders the income and expenses summary', () => {
    render(
      <MonthlyDashboard 
        summary={mockSummary} 
        monthName="February 2026" 
        onSwitchView={mockOnSwitchView}
        onOpenSettings={mockOnOpenSettings}
      />
    );
    
    expect(screen.getByText(/Total Income/i)).toBeInTheDocument();
    expect(screen.getByText(/€3,000/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Expenses/i)).toBeInTheDocument();
    expect(screen.getByText(/€1,200/i)).toBeInTheDocument();
  });

  it('renders the progress bar with correct percentage', () => {
    render(
      <MonthlyDashboard 
        summary={mockSummary} 
        monthName="February 2026" 
        onSwitchView={mockOnSwitchView}
        onOpenSettings={mockOnOpenSettings}
      />
    );
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    // In Tailwind, we might use style={{ width: '60%' }}
    expect(progressBar).toHaveStyle({ width: '60%' });
  });
});
