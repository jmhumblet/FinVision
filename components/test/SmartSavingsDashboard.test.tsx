import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import SmartSavingsDashboard from '../SmartSavingsDashboard';
import { SavingsGoal } from '../../types';

describe('SmartSavingsDashboard', () => {
  const mockGoals: SavingsGoal[] = [
    {
      id: '1',
      name: 'New Car',
      targetAmount: 20000,
      currentAmount: 5000,
      targetDate: '2025-12-31'
    }
  ];

  it('renders empty state when no goals', () => {
    render(
      <SmartSavingsDashboard
        goals={[]}
        onAddGoal={vi.fn()}
        onUpdateGoal={vi.fn()}
        onDeleteGoal={vi.fn()}
      />
    );
    expect(screen.getByText('No Savings Goals Yet')).toBeInTheDocument();
  });

  it('renders goals correctly', () => {
    render(
      <SmartSavingsDashboard
        goals={mockGoals}
        onAddGoal={vi.fn()}
        onUpdateGoal={vi.fn()}
        onDeleteGoal={vi.fn()}
      />
    );
    expect(screen.getByText('New Car')).toBeInTheDocument();
    // Flexible currency check because format might differ by locale
    const text = screen.getByText((content) => content.includes('20,000') || content.includes('20000'));
    expect(text).toBeInTheDocument();
  });

  it('opens add form on button click', () => {
    render(
      <SmartSavingsDashboard
        goals={[]}
        onAddGoal={vi.fn()}
        onUpdateGoal={vi.fn()}
        onDeleteGoal={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText('New Goal'));
    expect(screen.getByText('Create New Savings Goal')).toBeInTheDocument();
  });

  it('calls onAddGoal when form is submitted', () => {
    const handleAdd = vi.fn();
    const { container } = render(
      <SmartSavingsDashboard
        goals={[]}
        onAddGoal={handleAdd}
        onUpdateGoal={vi.fn()}
        onDeleteGoal={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('New Goal'));

    // Fill form
    const nameInput = screen.getByPlaceholderText('e.g. New Car, House Deposit');
    fireEvent.change(nameInput, { target: { value: 'Holiday' } });

    const dateInput = container.querySelector('input[type="date"]');
    if (dateInput) fireEvent.change(dateInput, { target: { value: '2025-12-31' } });

    const amountInputs = screen.getAllByPlaceholderText('0.00');
    fireEvent.change(amountInputs[0], { target: { value: '1000' } }); // Target
    fireEvent.change(amountInputs[1], { target: { value: '100' } }); // Current

    fireEvent.click(screen.getByText('Create Goal'));

    expect(handleAdd).toHaveBeenCalled();
    expect(handleAdd).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Holiday',
      targetAmount: 1000,
      currentAmount: 100,
      targetDate: '2025-12-31'
    }));
  });
});
