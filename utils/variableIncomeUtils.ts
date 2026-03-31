import { Transaction, Projection, TransactionType, Frequency } from "../types";
import { getMonthKey, calculateProjectionValueForDate } from "./financialUtils";

export interface IncomeAnalysis {
    averageIncome: number;
    minIncome: number;
    maxIncome: number;
    smoothedBaseline: number;
    monthlyData: { month: string; amount: number }[];
}

export const analyzeHistoricalIncome = (transactions: Transaction[], monthsToAnalyze: number = 6): IncomeAnalysis => {
    // Group INCOME transactions by month
    const incomeByMonth: Record<string, number> = {};

    transactions.forEach(tx => {
        if (tx.type === TransactionType.INCOME) {
            const date = new Date(tx.date);
            const key = getMonthKey(date);
            incomeByMonth[key] = (incomeByMonth[key] || 0) + tx.amount;
        }
    });

    // Get the last N months as keys
    const today = new Date();
    const months: string[] = [];
    for (let i = monthsToAnalyze - 1; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        months.push(getMonthKey(d));
    }

    const monthlyData = months.map(month => ({
        month,
        amount: incomeByMonth[month] || 0
    }));

    if (monthlyData.length === 0) {
        return { averageIncome: 0, minIncome: 0, maxIncome: 0, smoothedBaseline: 0, monthlyData: [] };
    }

    const amounts = monthlyData.map(d => d.amount);
    const total = amounts.reduce((sum, val) => sum + val, 0);
    const averageIncome = total / amounts.length;
    const minIncome = Math.min(...amounts);
    const maxIncome = Math.max(...amounts);

    // Conservative smoothed baseline: 90% of average, but not lower than minimum if minimum is greater than 0
    // Actually, let's just take a weighted average or simply 90% of the average.
    // Let's use 90% of average as a conservative baseline.
    let smoothedBaseline = averageIncome * 0.9;

    // If minimum is > 0 and 90% of average is lower than minimum, maybe we still stick to 90% of avg or min?
    // Let's just return average * 0.9 for simplicity, or users can adjust.
    // Let's make it Math.max(minIncome, averageIncome * 0.9) to not be absurdly low if min is decent.
    // But what if min is 0? Then average * 0.9 is better.
    // Wait, if min > avg * 0.9, we might want to use avg * 0.9 to be safe?
    // Actually, min is the safest.
    // Let's just use average * 0.9.

    // Better heuristic: Blended approach. Average of the lowest 3 months if we have 6 months?
    // Let's stick to average * 0.85 for a good buffer.
    smoothedBaseline = averageIncome * 0.85;

    return {
        averageIncome,
        minIncome,
        maxIncome,
        smoothedBaseline,
        monthlyData
    };
};

export const calculateBaseExpenses = (projections: Projection[]): number => {
    // Estimate average monthly base expenses from EXPENSE projections
    // For simplicity, we calculate a typical month's expenses.
    // We can evaluate for the next 30 days and use that as the monthly base expense.

    const today = new Date();
    today.setHours(0,0,0,0);
    const nextMonth = new Date(today);
    nextMonth.setDate(nextMonth.getDate() + 30);

    let totalExpenses = 0;

    for (let d = new Date(today); d < nextMonth; d.setDate(d.getDate() + 1)) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${day}`;

        projections.forEach(proj => {
            if (proj.isActive && proj.type === TransactionType.EXPENSE) {
                const val = calculateProjectionValueForDate(proj, d, dateStr);
                if (val < 0) {
                    totalExpenses += Math.abs(val);
                }
            }
        });
    }

    return totalExpenses;
};

export const suggestBufferFund = (baseExpenses: number, smoothedBaseline: number, minIncome: number): number => {
    // Buffer fund to cover lean months.
    // E.g., if smoothed baseline is 2000, but min income is 1000, and expenses are 1800.
    // The deficit in a minimum month is Expenses - minIncome = 1800 - 1000 = 800.
    // Suggest keeping at least 3 months of this deficit.
    // If expenses < minIncome, buffer is 0.

    const maxDeficit = Math.max(0, baseExpenses - minIncome);
    return maxDeficit * 3; // 3 months of max deficit
};
