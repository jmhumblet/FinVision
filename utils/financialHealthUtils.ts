import { Asset, Debt, Transaction, Projection, TransactionType, AssetType } from '../types';

export interface HealthScores {
  savingsRate: number; // Percentage
  debtToIncomeRatio: number; // Percentage
  emergencyFundCoverage: number; // Months
  cashFlowStability: number; // 0 to 1 score (or percentage of positive months)
  overallScore: number; // 0 to 100
}

export const calculateSavingsRate = (monthlyIncome: number, monthlySavings: number): number => {
  if (monthlyIncome <= 0) return 0;
  return (monthlySavings / monthlyIncome) * 100;
};

export const calculateDebtToIncomeRatio = (monthlyIncome: number, monthlyDebtPayments: number): number => {
  if (monthlyIncome <= 0 && monthlyDebtPayments > 0) return 100;
  if (monthlyIncome <= 0) return 0;
  const ratio = (monthlyDebtPayments / monthlyIncome) * 100;
  return Math.min(ratio, 100);
};

export const calculateEmergencyFundCoverage = (liquidAssets: number, baseMonthlyExpenses: number): number => {
  if (baseMonthlyExpenses <= 0) return liquidAssets > 0 ? 999 : 0; // Arbitrary high number if no expenses
  return liquidAssets / baseMonthlyExpenses;
};

// Returns a simple ratio of positive cashflow months over total looked at (e.g., 3 months)
export const calculateCashFlowStability = (historicalTransactions: Transaction[]): number => {
    // For simplicity, let's group by month and see if income > expenses
    if (!historicalTransactions || historicalTransactions.length === 0) return 0;

    const monthlyCashFlow: Record<string, { income: number, expense: number }> = {};

    historicalTransactions.forEach(tx => {
        const monthKey = tx.date.substring(0, 7); // YYYY-MM
        if (!monthlyCashFlow[monthKey]) {
            monthlyCashFlow[monthKey] = { income: 0, expense: 0 };
        }
        if (tx.type === TransactionType.INCOME) {
            monthlyCashFlow[monthKey].income += tx.amount;
        } else {
            monthlyCashFlow[monthKey].expense += tx.amount;
        }
    });

    const months = Object.keys(monthlyCashFlow);
    if (months.length === 0) return 0;

    let positiveMonths = 0;
    months.forEach(m => {
        if (monthlyCashFlow[m].income > monthlyCashFlow[m].expense) {
            positiveMonths++;
        }
    });

    return (positiveMonths / months.length) * 100;
};

export const calculateOverallHealthScore = (
  savingsRate: number,
  dtiRatio: number,
  efCoverage: number,
  cashFlowStability: number
): number => {
  // Define scoring weights
  const WEIGHT_SAVINGS = 0.30;
  const WEIGHT_DTI = 0.30;
  const WEIGHT_EF = 0.25;
  const WEIGHT_CF = 0.15;

  // Normalize metrics to 0-100 scales where 100 is best

  // Savings Rate: Target 20%. Let's cap at 30% for max score.
  let savingsScore = (savingsRate / 20) * 100;
  savingsScore = Math.min(Math.max(savingsScore, 0), 100);

  // DTI: Target < 30%. 0% is 100 score, 50%+ is 0 score.
  let dtiScore = 100 - ((dtiRatio / 50) * 100);
  dtiScore = Math.min(Math.max(dtiScore, 0), 100);

  // EF Coverage: Target 6 months for max score.
  let efScore = (efCoverage / 6) * 100;
  efScore = Math.min(Math.max(efScore, 0), 100);

  // Cash Flow Stability: already a percentage 0-100.
  let cfScore = Math.min(Math.max(cashFlowStability, 0), 100);

  const overall = (savingsScore * WEIGHT_SAVINGS) +
                  (dtiScore * WEIGHT_DTI) +
                  (efScore * WEIGHT_EF) +
                  (cfScore * WEIGHT_CF);

  return Math.round(overall);
};

// Helper to calculate total monthly projection values
export const calculateMonthlyProjections = (projections: Projection[]): { monthlyIncome: number, monthlyExpenses: number } => {
    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    projections.forEach(proj => {
        if (!proj.isActive) return;

        let monthlyAmount = proj.amount;
        // Normalize to monthly equivalent
        switch (proj.frequency) {
            case 'ONCE':
                monthlyAmount = 0; // Ignoring one-offs for baseline monthly
                break;
            case 'DAILY':
                monthlyAmount = proj.amount * 30;
                break;
            case 'WEEKLY':
                monthlyAmount = proj.amount * 4.33;
                break;
            case 'MONTHLY':
                monthlyAmount = proj.amount;
                break;
            case 'YEARLY':
                monthlyAmount = proj.amount / 12;
                break;
        }

        if (proj.type === TransactionType.INCOME) {
            monthlyIncome += monthlyAmount;
        } else {
            monthlyExpenses += monthlyAmount;
        }
    });

    return { monthlyIncome, monthlyExpenses };
};

export const getFinancialHealth = (
    transactions: Transaction[],
    projections: Projection[],
    assets: Asset[],
    debts: Debt[]
): HealthScores => {
    const { monthlyIncome, monthlyExpenses } = calculateMonthlyProjections(projections);

    // Monthly Debt Payments
    const monthlyDebtPayments = debts.reduce((acc, debt) => acc + debt.minimumPayment, 0);

    // Liquid Assets (Cash, easily accessible)
    const liquidAssets = assets
        .filter(a => a.liquidity === 'HIGH' || a.type === AssetType.CASH)
        .reduce((acc, asset) => acc + asset.value, 0);

    // If there's surplus income over expenses+debt, let's assume it's savings rate capacity
    const monthlySavingsCapacity = Math.max(0, monthlyIncome - monthlyExpenses - monthlyDebtPayments);

    const savingsRate = calculateSavingsRate(monthlyIncome, monthlySavingsCapacity);
    const dtiRatio = calculateDebtToIncomeRatio(monthlyIncome, monthlyDebtPayments);

    // Base monthly expenses should ideally just be required living expenses, but we'll use total projected expenses + debt payments as a proxy
    const baseMonthlyExpenses = monthlyExpenses + monthlyDebtPayments;
    const emergencyFundCoverage = calculateEmergencyFundCoverage(liquidAssets, baseMonthlyExpenses);

    const cashFlowStability = calculateCashFlowStability(transactions);

    const overallScore = calculateOverallHealthScore(
        savingsRate,
        dtiRatio,
        emergencyFundCoverage,
        cashFlowStability
    );

    return {
        savingsRate,
        debtToIncomeRatio: dtiRatio,
        emergencyFundCoverage,
        cashFlowStability,
        overallScore
    };
};
