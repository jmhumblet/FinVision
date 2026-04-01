import { describe, it, expect } from 'vitest';
import { calculateSmoothedIncome, calculateBaseMonthlyExpenses, calculateBufferFundTarget } from '../utils/variableIncomeUtils';
import { Transaction, TransactionType, Projection, Frequency } from '../types';

describe('variableIncomeUtils', () => {
    describe('calculateSmoothedIncome', () => {
        it('calculates average and smoothed income correctly', () => {
            const transactions: Transaction[] = [
                { id: '1', date: '2023-01-15', description: 'Gig 1', amount: 1000, categoryId: '1', type: TransactionType.INCOME },
                { id: '2', date: '2023-01-20', description: 'Gig 2', amount: 500, categoryId: '1', type: TransactionType.INCOME },
                { id: '3', date: '2023-02-10', description: 'Gig 3', amount: 2000, categoryId: '1', type: TransactionType.INCOME },
                { id: '4', date: '2023-03-05', description: 'Gig 4', amount: 1500, categoryId: '1', type: TransactionType.INCOME },
                { id: '5', date: '2023-03-10', description: 'Expense', amount: 500, categoryId: '2', type: TransactionType.EXPENSE } // Should be ignored
            ];

            // Jan: 1500, Feb: 2000, Mar: 1500 -> Average: (1500 + 2000 + 1500) / 3 = 1666.666...
            const result = calculateSmoothedIncome(transactions, 0.9);

            expect(result.averageIncome).toBeCloseTo(1666.67, 2);
            expect(result.smoothedIncome).toBeCloseTo(1666.67 * 0.9, 2);
            expect(result.monthlyData).toHaveLength(3);
            expect(result.monthlyData[0]).toEqual({ month: '2023-01', income: 1500 });
            expect(result.monthlyData[1]).toEqual({ month: '2023-02', income: 2000 });
            expect(result.monthlyData[2]).toEqual({ month: '2023-03', income: 1500 });
        });

        it('returns zero for no income transactions', () => {
            const transactions: Transaction[] = [
                { id: '1', date: '2023-01-15', description: 'Expense', amount: 1000, categoryId: '2', type: TransactionType.EXPENSE }
            ];

            const result = calculateSmoothedIncome(transactions);

            expect(result.averageIncome).toBe(0);
            expect(result.smoothedIncome).toBe(0);
            expect(result.monthlyData).toHaveLength(0);
        });
    });

    describe('calculateBaseMonthlyExpenses', () => {
        it('calculates total monthly expenses from active projections', () => {
            const projections: Projection[] = [
                { id: '1', name: 'Rent', amount: 1000, frequency: Frequency.MONTHLY, startDate: '2023-01-01', categoryId: '2', type: TransactionType.EXPENSE, isActive: true },
                { id: '2', name: 'Groceries', amount: 100, frequency: Frequency.WEEKLY, startDate: '2023-01-01', categoryId: '3', type: TransactionType.EXPENSE, isActive: true },
                { id: '3', name: 'Gym', amount: 50, frequency: Frequency.MONTHLY, startDate: '2023-01-01', categoryId: '4', type: TransactionType.EXPENSE, isActive: false }, // Ignored
                { id: '4', name: 'Salary', amount: 3000, frequency: Frequency.MONTHLY, startDate: '2023-01-01', categoryId: '1', type: TransactionType.INCOME, isActive: true } // Ignored
            ];

            // Rent: 1000, Groceries: 100 * 4.33 = 433 -> Total: 1433
            const result = calculateBaseMonthlyExpenses(projections);

            expect(result).toBeCloseTo(1433, 2);
        });
    });

    describe('calculateBufferFundTarget', () => {
        it('calculates the buffer fund target correctly', () => {
            const result = calculateBufferFundTarget(1500, 3);
            expect(result).toBe(4500);
        });

        it('uses default multiplier of 3', () => {
            const result = calculateBufferFundTarget(1500);
            expect(result).toBe(4500);
        });
    });
});
