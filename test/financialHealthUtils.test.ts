import { describe, it, expect } from 'vitest';
import {
    calculateSavingsRate,
    calculateDebtToIncomeRatio,
    calculateEmergencyFundCoverage,
    calculateCashFlowStability,
    calculateOverallHealthScore,
    calculateMonthlyProjections,
    getFinancialHealth
} from '../utils/financialHealthUtils';
import { TransactionType, AssetType, Frequency } from '../types';

describe('Financial Health Utilities', () => {
    describe('calculateSavingsRate', () => {
        it('calculates correctly', () => {
            expect(calculateSavingsRate(5000, 1000)).toBe(20);
            expect(calculateSavingsRate(0, 1000)).toBe(0);
        });
    });

    describe('calculateDebtToIncomeRatio', () => {
        it('calculates correctly', () => {
            expect(calculateDebtToIncomeRatio(5000, 1500)).toBe(30);
            expect(calculateDebtToIncomeRatio(5000, 6000)).toBe(100); // capped at 100
            expect(calculateDebtToIncomeRatio(0, 500)).toBe(100);
            expect(calculateDebtToIncomeRatio(0, 0)).toBe(0);
        });
    });

    describe('calculateEmergencyFundCoverage', () => {
        it('calculates correctly', () => {
            expect(calculateEmergencyFundCoverage(15000, 3000)).toBe(5);
            expect(calculateEmergencyFundCoverage(0, 3000)).toBe(0);
            expect(calculateEmergencyFundCoverage(5000, 0)).toBe(999);
        });
    });

    describe('calculateCashFlowStability', () => {
        it('calculates correctly', () => {
            const txs: any[] = [
                { date: '2023-01-15', amount: 3000, type: TransactionType.INCOME },
                { date: '2023-01-20', amount: 2000, type: TransactionType.EXPENSE }, // Jan is positive (+1000)
                { date: '2023-02-15', amount: 3000, type: TransactionType.INCOME },
                { date: '2023-02-20', amount: 4000, type: TransactionType.EXPENSE }, // Feb is negative (-1000)
                { date: '2023-03-15', amount: 3000, type: TransactionType.INCOME },
                { date: '2023-03-20', amount: 1000, type: TransactionType.EXPENSE }, // Mar is positive (+2000)
            ];
            // 2 out of 3 months positive -> 66.66%
            expect(calculateCashFlowStability(txs)).toBeCloseTo(66.66, 1);
        });

        it('handles empty arrays', () => {
            expect(calculateCashFlowStability([])).toBe(0);
        });
    });

    describe('calculateOverallHealthScore', () => {
        it('calculates a max score for perfect metrics', () => {
            // savingsRate >= 20, dti == 0, efCoverage >= 6, cfStability == 100
            const score = calculateOverallHealthScore(25, 0, 7, 100);
            expect(score).toBe(100);
        });

        it('calculates a 0 score for terrible metrics', () => {
            // savingsRate == 0, dti >= 50, efCoverage == 0, cfStability == 0
            const score = calculateOverallHealthScore(0, 60, 0, 0);
            expect(score).toBe(0);
        });

        it('calculates correctly for mid-range metrics', () => {
            // savings: 10% (50 score) -> 50 * 0.3 = 15
            // dti: 25% (50 score) -> 50 * 0.3 = 15
            // ef: 3 months (50 score) -> 50 * 0.25 = 12.5
            // cf: 50% (50 score) -> 50 * 0.15 = 7.5
            // total = 50
            const score = calculateOverallHealthScore(10, 25, 3, 50);
            expect(score).toBe(50);
        });
    });

    describe('calculateMonthlyProjections', () => {
        it('calculates correctly', () => {
            const projections: any[] = [
                { isActive: true, amount: 1000, frequency: Frequency.MONTHLY, type: TransactionType.INCOME },
                { isActive: true, amount: 50, frequency: Frequency.WEEKLY, type: TransactionType.EXPENSE }, // 50 * 4.33 = 216.5
                { isActive: true, amount: 1200, frequency: Frequency.YEARLY, type: TransactionType.EXPENSE }, // 1200 / 12 = 100
                { isActive: false, amount: 5000, frequency: Frequency.MONTHLY, type: TransactionType.INCOME }
            ];
            const { monthlyIncome, monthlyExpenses } = calculateMonthlyProjections(projections);
            expect(monthlyIncome).toBe(1000);
            expect(monthlyExpenses).toBeCloseTo(316.5, 1);
        });
    });

    describe('getFinancialHealth', () => {
        it('calculates full health profile correctly', () => {
            const txs: any[] = [
                { date: '2023-01-15', amount: 3000, type: TransactionType.INCOME },
                { date: '2023-01-20', amount: 2000, type: TransactionType.EXPENSE },
            ];
            const projections: any[] = [
                { isActive: true, amount: 5000, frequency: Frequency.MONTHLY, type: TransactionType.INCOME },
                { isActive: true, amount: 2000, frequency: Frequency.MONTHLY, type: TransactionType.EXPENSE }
            ];
            const assets: any[] = [
                { type: AssetType.CASH, value: 10000 },
                { type: AssetType.PROPERTY, value: 300000 } // Not liquid
            ];
            const debts: any[] = [
                { minimumPayment: 500 }
            ];

            const health = getFinancialHealth(txs, projections, assets, debts);

            // Income: 5000
            // Exp: 2000
            // Debt Pay: 500
            // Savings Cap: 5000 - 2000 - 500 = 2500
            // Savings Rate: 2500 / 5000 = 50%
            // DTI: 500 / 5000 = 10%
            // Base Exp: 2500
            // Liquid Assets: 10000
            // EF Cov: 10000 / 2500 = 4 months
            // CF Stability: 1 month, positive -> 100%

            expect(health.savingsRate).toBe(50);
            expect(health.debtToIncomeRatio).toBe(10);
            expect(health.emergencyFundCoverage).toBe(4);
            expect(health.cashFlowStability).toBe(100);

            // Savings (50%) -> 100 score * 0.3 = 30
            // DTI (10%) -> 100 - (10/50)*100 = 80 score * 0.3 = 24
            // EF (4m) -> (4/6)*100 = 66.66 score * 0.25 = 16.67
            // CF (100%) -> 100 * 0.15 = 15
            // Total: 30 + 24 + 16.67 + 15 = 85.67 => 86
            expect(health.overallScore).toBe(86);
        });
    });
});
