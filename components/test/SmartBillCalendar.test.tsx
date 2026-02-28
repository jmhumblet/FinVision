import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SmartBillCalendar from '../SmartBillCalendar';
import { Transaction, Projection, DailyBalance, TransactionType, Frequency } from '../../types';

describe('SmartBillCalendar', () => {
    const mockOnAddTransaction = vi.fn();
    const mockOnUpdateTransaction = vi.fn();
    const mockOnUpdateProjection = vi.fn();

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentMonthStr = String(currentMonth + 1).padStart(2, '0');

    const testDateStr1 = `${currentYear}-${currentMonthStr}-10`;
    const testDateStr2 = `${currentYear}-${currentMonthStr}-15`;

    const mockTransactions: Transaction[] = [
        {
            id: 'tx1',
            date: testDateStr1,
            description: 'Test Expense',
            amount: 50,
            categoryId: '1',
            type: TransactionType.EXPENSE
        }
    ];

    const mockProjections: Projection[] = [
        {
            id: 'proj1',
            name: 'Test Income',
            amount: 1000,
            frequency: Frequency.ONCE,
            startDate: testDateStr2,
            categoryId: '2',
            type: TransactionType.INCOME,
            isActive: true
        }
    ];

    const mockTimeline: DailyBalance[] = [
        {
            date: testDateStr1,
            historicalBalance: -100,
            projectedBalance: null,
            isProjected: false
        },
        {
            date: testDateStr2,
            historicalBalance: null,
            projectedBalance: 900,
            isProjected: true
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock window.confirm
        window.confirm = vi.fn(() => true);
    });

    it('renders the calendar view', () => {
        render(
            <SmartBillCalendar
                transactions={mockTransactions}
                projections={mockProjections}
                timelineData={mockTimeline}
                onAddTransaction={mockOnAddTransaction}
                onUpdateTransaction={mockOnUpdateTransaction}
                onUpdateProjection={mockOnUpdateProjection}
            />
        );

        expect(screen.getByText('Smart Bill Calendar')).toBeInTheDocument();
        expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('displays transactions and projections on the correct days', () => {
        render(
            <SmartBillCalendar
                transactions={mockTransactions}
                projections={mockProjections}
                timelineData={mockTimeline}
                onAddTransaction={mockOnAddTransaction}
                onUpdateTransaction={mockOnUpdateTransaction}
                onUpdateProjection={mockOnUpdateProjection}
            />
        );

        expect(screen.getByText('Test Expense')).toBeInTheDocument();
        expect(screen.getByText('Test Income')).toBeInTheDocument();
    });

    it('shows balance warnings for negative balances', () => {
        render(
            <SmartBillCalendar
                transactions={mockTransactions}
                projections={mockProjections}
                timelineData={mockTimeline}
                onAddTransaction={mockOnAddTransaction}
                onUpdateTransaction={mockOnUpdateTransaction}
                onUpdateProjection={mockOnUpdateProjection}
            />
        );

        // testDateStr1 has -100 balance, which is negative
        expect(screen.getByText(/€100/)).toBeInTheDocument();
    });

    it('calls onAddTransaction with the correct date when quick add is clicked', () => {
        render(
            <SmartBillCalendar
                transactions={mockTransactions}
                projections={mockProjections}
                timelineData={mockTimeline}
                onAddTransaction={mockOnAddTransaction}
                onUpdateTransaction={mockOnUpdateTransaction}
                onUpdateProjection={mockOnUpdateProjection}
            />
        );

        const quickAddBtn = screen.getByTestId('quick-add-10');
        fireEvent.click(quickAddBtn);
        expect(mockOnAddTransaction).toHaveBeenCalledWith(testDateStr1);
    });
});
