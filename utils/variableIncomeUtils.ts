import { Transaction, TransactionType, Projection } from '../types';

/**
 * Calculates a conservative "smoothed" monthly income baseline.
 * We look at the past 6 months (or available months if less than 6) of income,
 * calculate the average, and optionally apply a conservative modifier.
 */
export function calculateSmoothedIncome(
    transactions: Transaction[],
    conservativeModifier: number = 0.9
): {
    smoothedIncome: number;
    averageIncome: number;
    monthlyData: { month: string; income: number }[];
} {
    // Filter for income transactions
    const incomeTransactions = transactions.filter(t => t.type === TransactionType.INCOME);

    // Group by month
    const monthlyIncomeMap: Record<string, number> = {};
    incomeTransactions.forEach(t => {
        const monthKey = t.date.substring(0, 7); // YYYY-MM
        monthlyIncomeMap[monthKey] = (monthlyIncomeMap[monthKey] || 0) + t.amount;
    });

    // Convert to sorted array
    const monthlyData = Object.keys(monthlyIncomeMap)
        .sort((a, b) => a.localeCompare(b))
        .map(month => ({
            month,
            income: monthlyIncomeMap[month]
        }));

    // If no data, return 0
    if (monthlyData.length === 0) {
        return { smoothedIncome: 0, averageIncome: 0, monthlyData: [] };
    }

    // Take up to the last 6 months for a more recent average
    const recentMonths = monthlyData.slice(-6);

    const totalIncome = recentMonths.reduce((sum, data) => sum + data.income, 0);
    const averageIncome = totalIncome / recentMonths.length;

    // Apply conservative modifier (e.g., 90% of average)
    const smoothedIncome = averageIncome * conservativeModifier;

    return { smoothedIncome, averageIncome, monthlyData };
}

/**
 * Calculates the monthly base expenses from active expense projections.
 */
export function calculateBaseMonthlyExpenses(projections: Projection[]): number {
    const expenseProjections = projections.filter(p => p.isActive && p.type === TransactionType.EXPENSE);

    let totalMonthlyExpenses = 0;

    expenseProjections.forEach(p => {
        switch (p.frequency) {
            case 'DAILY':
                totalMonthlyExpenses += p.amount * 30;
                break;
            case 'WEEKLY':
                totalMonthlyExpenses += p.amount * 4.33;
                break;
            case 'MONTHLY':
                totalMonthlyExpenses += p.amount;
                break;
            case 'YEARLY':
                totalMonthlyExpenses += p.amount / 12;
                break;
            case 'ONCE':
                // Generally, one-off expenses aren't considered part of the "base monthly baseline",
                // but if we want to include them we could average them out.
                // For a strict "baseline", we usually exclude them.
                break;
            default:
                break;
        }
    });

    return totalMonthlyExpenses;
}

/**
 * Calculates a suggested buffer fund target based on base expenses and an optional multiplier.
 * e.g., A target of 3 months of expenses.
 */
export function calculateBufferFundTarget(
    baseExpenses: number,
    monthsToCover: number = 3
): number {
    return baseExpenses * monthsToCover;
}
