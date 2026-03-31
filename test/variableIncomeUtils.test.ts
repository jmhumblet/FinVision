import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyzeHistoricalIncome, calculateBaseExpenses, suggestBufferFund } from '../utils/variableIncomeUtils';
import { Transaction, Projection, TransactionType, Frequency } from '../types';

describe('variableIncomeUtils', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        // Set mock system time to 2026-06-15
        vi.setSystemTime(new Date('2026-06-15T00:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('analyzeHistoricalIncome', () => {
        it('should handle empty transactions', () => {
            const result = analyzeHistoricalIncome([], 6);
            expect(result.averageIncome).toBe(0);
            expect(result.minIncome).toBe(0);
            expect(result.maxIncome).toBe(0);
            expect(result.smoothedBaseline).toBe(0);
            expect(result.monthlyData.length).toBe(6);
            expect(result.monthlyData[0].amount).toBe(0);
        });

        it('should correctly analyze 6 months of income data', () => {
            const transactions: Transaction[] = [
                { id: '1', date: '2026-06-05', description: 'Gig A', amount: 2000, categoryId: '1', type: TransactionType.INCOME },
                { id: '2', date: '2026-05-10', description: 'Gig B', amount: 1000, categoryId: '1', type: TransactionType.INCOME },
                { id: '3', date: '2026-04-15', description: 'Gig C', amount: 3000, categoryId: '1', type: TransactionType.INCOME },
                { id: '4', date: '2026-03-20', description: 'Gig D', amount: 1500, categoryId: '1', type: TransactionType.INCOME },
                { id: '5', date: '2026-02-25', description: 'Gig E', amount: 2500, categoryId: '1', type: TransactionType.INCOME },
                { id: '6', date: '2026-01-30', description: 'Gig F', amount: 800, categoryId: '1', type: TransactionType.INCOME },
                // Ignored (expense)
                { id: '7', date: '2026-06-01', description: 'Rent', amount: 500, categoryId: '2', type: TransactionType.EXPENSE }
            ];

            const result = analyzeHistoricalIncome(transactions, 6);

            expect(result.monthlyData).toHaveLength(6);

            // Amounts: 800, 2500, 1500, 3000, 1000, 2000
            const total = 800 + 2500 + 1500 + 3000 + 1000 + 2000; // 10800
            const average = total / 6; // 1800

            expect(result.averageIncome).toBe(average);
            expect(result.minIncome).toBe(800);
            expect(result.maxIncome).toBe(3000);
            expect(result.smoothedBaseline).toBeCloseTo(average * 0.85);
        });
    });

    describe('calculateBaseExpenses', () => {
        it('should calculate base expenses from active EXPENSE projections for 30 days', () => {
            const projections: Projection[] = [
                {
                    id: 'p1', name: 'Rent', amount: 1200, frequency: Frequency.MONTHLY,
                    startDate: '2026-06-01', categoryId: 'rent', type: TransactionType.EXPENSE, isActive: true
                },
                {
                    id: 'p2', name: 'Groceries', amount: 100, frequency: Frequency.WEEKLY,
                    startDate: '2026-06-05', categoryId: 'food', type: TransactionType.EXPENSE, isActive: true
                },
                {
                    id: 'p3', name: 'Salary', amount: 3000, frequency: Frequency.MONTHLY,
                    startDate: '2026-06-01', categoryId: 'salary', type: TransactionType.INCOME, isActive: true
                }, // Ignored because INCOME
                {
                    id: 'p4', name: 'Gym', amount: 50, frequency: Frequency.MONTHLY,
                    startDate: '2026-06-01', categoryId: 'health', type: TransactionType.EXPENSE, isActive: false
                } // Ignored because inactive
            ];

            const total = calculateBaseExpenses(projections);

            // From 2026-06-15 for 30 days (up to 2026-07-14)
            // Rent: occurs on 2026-07-01 -> 1200
            // Groceries: weekly starting 2026-06-05 (Friday).
            // Fridays in range:
            // June 19, June 26, July 3, July 10 (4 occurrences) -> 4 * 100 = 400
            // Total: 1200 + 400 = 1600

            expect(total).toBe(1600);
        });
    });

    describe('suggestBufferFund', () => {
        it('should calculate correctly when base expenses exceed min income', () => {
            const buffer = suggestBufferFund(2000, 2500, 1000);
            // maxDeficit = 2000 - 1000 = 1000. Buffer = 1000 * 3 = 3000.
            expect(buffer).toBe(3000);
        });

        it('should return 0 when min income covers base expenses', () => {
            const buffer = suggestBufferFund(1500, 3000, 2000);
            // maxDeficit = 0
            expect(buffer).toBe(0);
        });
    });
});
