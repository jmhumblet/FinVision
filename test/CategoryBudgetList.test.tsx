import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import CategoryBudgetList from '../components/CategoryBudgetList';
import { Category, Transaction, TransactionType } from '../types';

// Mock formatCurrency to avoid locale issues in tests if any
vi.mock('../utils/financialUtils', async () => {
    const actual = await vi.importActual('../utils/financialUtils');
    return {
        ...actual,
        formatCurrency: (amount: number) => `€${amount}`,
    };
});

describe('CategoryBudgetList', () => {
    const mockCategories: Category[] = [
        { id: '1', name: 'Food', color: 'red', budgetLimit: 100 },
        { id: '2', name: 'Transport', color: 'blue', budgetLimit: 50 },
        { id: '3', name: 'Other', color: 'gray' }, // No budget
    ];

    const mockTransactions: Transaction[] = [
        { id: 't1', date: '2023-01-01', description: 'Lunch', amount: 20, categoryId: '1', type: TransactionType.EXPENSE },
        { id: 't2', date: '2023-01-02', description: 'Dinner', amount: 90, categoryId: '1', type: TransactionType.EXPENSE }, // Total 110 (Over)
        { id: 't3', date: '2023-01-03', description: 'Bus', amount: 10, categoryId: '2', type: TransactionType.EXPENSE }, // Total 10 (Under)
        { id: 't4', date: '2023-01-04', description: 'Income', amount: 500, categoryId: '1', type: TransactionType.INCOME }, // Ignored
    ];

    it('renders categories with budgets', () => {
        render(<CategoryBudgetList categories={mockCategories} transactions={mockTransactions} onOpenSettings={() => {}} />);

        expect(screen.getByText('Food')).toBeInTheDocument();
        expect(screen.getByText('Transport')).toBeInTheDocument();
        expect(screen.queryByText('Other')).not.toBeInTheDocument();
    });

    it('calculates spending correctly and shows over budget warning', () => {
        render(<CategoryBudgetList categories={mockCategories} transactions={mockTransactions} onOpenSettings={() => {}} />);

        // Food: 110 spent, 100 limit. Over by 10.
        // We expect to see "Over Budget" text.
        expect(screen.getByText(/Over Budget/i)).toBeInTheDocument();
        // The component displays "Exceeded by €10"
        expect(screen.getByText(/Exceeded by €10/i)).toBeInTheDocument();
    });

    it('shows empty state when no budgets set', () => {
        const noBudgetCats = mockCategories.map(c => ({ ...c, budgetLimit: undefined }));
        render(<CategoryBudgetList categories={noBudgetCats} transactions={mockTransactions} onOpenSettings={() => {}} />);

        expect(screen.getByText('Set Your Budgets')).toBeInTheDocument();
    });
});
