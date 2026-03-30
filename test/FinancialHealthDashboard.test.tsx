import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FinancialHealthDashboard from '../components/FinancialHealthDashboard';
import { Asset, AssetType, Debt, Projection, TransactionType, Frequency, DailyBalance } from '../types';

describe('FinancialHealthDashboard', () => {
    const defaultProps = {
        assets: [],
        debts: [],
        projections: [],
        currentBalance: 0,
        timelineData: [],
    };

    it('renders the dashboard title and base elements', () => {
        render(<FinancialHealthDashboard {...defaultProps} />);
        expect(screen.getByText('Financial Health Score')).toBeInTheDocument();
        expect(screen.getByText('Score Breakdown')).toBeInTheDocument();
        expect(screen.getByText('Actionable Insights')).toBeInTheDocument();
        expect(screen.getByText('Savings Rate')).toBeInTheDocument();
        expect(screen.getByText('Debt-to-Income')).toBeInTheDocument();
        expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
        expect(screen.getByText('Cash Flow Stability')).toBeInTheDocument();
    });

    it('calculates 100% score for optimal finances', () => {
        const optimalProjections: Projection[] = [
            {
                id: 'p1',
                name: 'Income',
                amount: 5000,
                frequency: Frequency.MONTHLY,
                startDate: '2026-01-01',
                categoryId: '1',
                type: TransactionType.INCOME,
                isActive: true
            },
            {
                id: 'p2',
                name: 'Expenses',
                amount: 2000, // Savings Rate = (5000-2000)/5000 = 60% (Optimal)
                frequency: Frequency.MONTHLY,
                startDate: '2026-01-01',
                categoryId: '2',
                type: TransactionType.EXPENSE,
                isActive: true
            }
        ];

        // Debt-to-Income: 0/5000 = 0% (Optimal)
        const optimalDebts: Debt[] = [];

        // Emergency Fund: 15000 / 2000 = 7.5 months (Optimal > 6)
        const optimalAssets: Asset[] = [
            { id: 'a1', name: 'Cash Reserve', value: 15000, type: AssetType.CASH, liquidity: 'HIGH' }
        ];

        // Stability: 100% positive
        const optimalTimeline: DailyBalance[] = [
            { date: '2026-01-01', historicalBalance: null, projectedBalance: 1000, isProjected: true },
            { date: '2026-01-02', historicalBalance: null, projectedBalance: 1000, isProjected: true }
        ];

        render(
            <FinancialHealthDashboard
                assets={optimalAssets}
                debts={optimalDebts}
                projections={optimalProjections}
                currentBalance={0}
                timelineData={optimalTimeline}
            />
        );

        // Score should be 100 (25 + 25 + 25 + 25)
        const scoreElement = screen.getByText('100');
        expect(scoreElement).toBeInTheDocument();

        // Check if insights list has the success messages
        expect(screen.getByText(/Excellent savings rate/i)).toBeInTheDocument();
        expect(screen.getByText(/emergency fund is fully funded/i)).toBeInTheDocument();
    });

    it('calculates correct insights for poor finances', () => {
        const poorProjections: Projection[] = [
            {
                id: 'p1',
                name: 'Income',
                amount: 3000,
                frequency: Frequency.MONTHLY,
                startDate: '2026-01-01',
                categoryId: '1',
                type: TransactionType.INCOME,
                isActive: true
            },
            {
                id: 'p2',
                name: 'Expenses',
                amount: 2900, // Savings Rate = 3.3% (< 10%)
                frequency: Frequency.MONTHLY,
                startDate: '2026-01-01',
                categoryId: '2',
                type: TransactionType.EXPENSE,
                isActive: true
            }
        ];

        // DTI: 1500 / 3000 = 50% (> 36%)
        const poorDebts: Debt[] = [
            { id: 'd1', name: 'Loan', currentBalance: 50000, minimumPayment: 1500, interestRate: 5 }
        ];

        // Emergency Fund: 0 / 2900 = 0 months (< 3)
        const poorAssets: Asset[] = [];

        // Stability: 50% positive
        const poorTimeline: DailyBalance[] = [
            { date: '2026-01-01', historicalBalance: null, projectedBalance: 1000, isProjected: true },
            { date: '2026-01-02', historicalBalance: null, projectedBalance: -500, isProjected: true }
        ];

        render(
            <FinancialHealthDashboard
                assets={poorAssets}
                debts={poorDebts}
                projections={poorProjections}
                currentBalance={0}
                timelineData={poorTimeline}
            />
        );

        // Check if insights list has the warning messages
        expect(screen.getByText(/savings rate is below 10%/i)).toBeInTheDocument();
        expect(screen.getByText(/debt-to-income ratio is high/i)).toBeInTheDocument();
        expect(screen.getByText(/liquid assets only cover 0.0 months/i)).toBeInTheDocument();
        expect(screen.getByText(/projected balance drops below zero/i)).toBeInTheDocument();

        // DTI Score: 50% DTI -> 0 pts
        // Savings Score: 3.3% -> (3.3/20)*25 = 4.1 pts
        // Emergency Fund: 0 -> 0 pts
        // Stability: 50% -> (50/100)*25 = 12.5 pts
        // Overall: Math.round(16.6) = 17
        const scoreElement = screen.getByText('17');
        expect(scoreElement).toBeInTheDocument();
    });
});
