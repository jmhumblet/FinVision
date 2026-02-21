import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MonthlyDashboard from '../MonthlyDashboard';
import { mockTransactions, mockProjections, mockCategories } from '../../e2e/fixtures/mockData';

describe('MonthlyDashboard', () => {
  const mockSummary = {
    remainingSpendable: 1500,
    totalProjectedIncome: 3000,
    totalProjectedExpenses: 1200,
    spentPercentage: 60
  };

  const mockOnSwitchView = vi.fn();
  const mockOnOpenSettings = vi.fn();
  const mockOnNavigate = vi.fn();
  const mockOnUpdateTransaction = vi.fn();
  const mockOnDeleteTransaction = vi.fn();
  const mockOnAddTransaction = vi.fn();
  const mockOnUpdateProjection = vi.fn();
  const mockOnDeleteProjection = vi.fn();
  const mockOnAddProjection = vi.fn();
  const mockOnUpdateCategories = vi.fn();

  const defaultProps = {
    summary: mockSummary,
    selectedDate: new Date('2026-02-01'),
    onSwitchView: mockOnSwitchView,
    onOpenSettings: mockOnOpenSettings,
    onNavigate: mockOnNavigate,
    transactions: mockTransactions,
    projections: mockProjections,
    categories: mockCategories,
    onUpdateTransaction: mockOnUpdateTransaction,
    onDeleteTransaction: mockOnDeleteTransaction,
    onAddTransaction: mockOnAddTransaction,
    onUpdateProjection: mockOnUpdateProjection,
    onDeleteProjection: mockOnDeleteProjection,
    onAddProjection: mockOnAddProjection,
    onUpdateCategories: mockOnUpdateCategories,
  };

  it('renders the hero counter with remaining spendable', () => {
    render(
      <MonthlyDashboard 
        {...defaultProps}
      />
    );
    
    expect(screen.getByText(/Forecasted End of Month/i)).toBeInTheDocument();
    expect(screen.getByText(/€1,500/i)).toBeInTheDocument();
  });

  it('renders the income and expenses summary', () => {
    render(
      <MonthlyDashboard 
        {...defaultProps}
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
        {...defaultProps}
      />
    );
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveStyle({ width: '60%' });
  });
});