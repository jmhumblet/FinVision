import { Debt, DebtStrategy } from '../types';

export interface PayoffMonth {
  date: string; // YYYY-MM-DD
  totalBalance: number;
  totalInterestPaid: number;
  debts: { [debtId: string]: number }; // Balance per debt
}

export interface PayoffSummary {
  payoffDate: string;
  totalInterestPaid: number;
  timeline: PayoffMonth[];
}

export const calculatePayoff = (
  debts: Debt[],
  strategy: DebtStrategy,
  monthlyExtraPayment: number
): PayoffSummary => {
  // Deep copy to avoid mutating original
  let currentDebts = debts.map(d => ({ ...d }));

  const timeline: PayoffMonth[] = [];
  let cumulativeInterestPaid = 0;

  // Start from next month
  let currentDate = new Date();
  currentDate.setDate(1);

  // Safety break: 50 years
  const MAX_MONTHS = 50 * 12;
  let monthsCount = 0;

  // Initial State (Month 0)
  timeline.push({
    date: new Date().toISOString().split('T')[0],
    totalBalance: currentDebts.reduce((sum, d) => sum + d.currentBalance, 0),
    totalInterestPaid: 0,
    debts: currentDebts.reduce((acc, d) => ({ ...acc, [d.id]: d.currentBalance }), {})
  });

  // Calculate the total fixed payment commitment (Sum of all initial minimums + extra)
  // This amount stays constant throughout the payoff plan (Snowball/Avalanche method)
  const totalMonthlyCommitment = debts.reduce((sum, d) => sum + d.minimumPayment, 0) + monthlyExtraPayment;

  while (currentDebts.some(d => d.currentBalance > 0.01) && monthsCount < MAX_MONTHS) {
    monthsCount++;

    // Advance month
    currentDate.setMonth(currentDate.getMonth() + 1);
    // Set to end of month for reporting
    const reportingDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    let monthlyInterest = 0;

    // 1. Accrue Interest
    currentDebts.forEach(d => {
      if (d.currentBalance > 0) {
        const monthlyRate = (d.interestRate / 100) / 12;
        const interest = d.currentBalance * monthlyRate;
        d.currentBalance += interest;
        monthlyInterest += interest;
      }
    });

    cumulativeInterestPaid += monthlyInterest;

    // 2. Distribute Payments
    let availableForPayment = totalMonthlyCommitment;

    // A. Pay Minimums first for all active debts
    currentDebts.forEach(d => {
      if (d.currentBalance > 0.01) {
        // Minimum payment is the lesser of the defined min payment or the full balance
        const payment = Math.min(d.currentBalance, d.minimumPayment);
        d.currentBalance -= payment;
        availableForPayment -= payment;
      }
    });

    // B. Apply Remaining Funds (Snowball/Avalanche)
    if (availableForPayment > 0.01) {
      // Filter active debts
      const activeDebts = currentDebts.filter(d => d.currentBalance > 0.01);

      if (activeDebts.length > 0) {
        if (strategy === DebtStrategy.SNOWBALL) {
          // Sort by Balance Ascending
          activeDebts.sort((a, b) => a.currentBalance - b.currentBalance);
        } else {
          // Sort by Interest Rate Descending (Avalanche)
          activeDebts.sort((a, b) => b.interestRate - a.interestRate);
        }

        // Apply available funds to the top priority debt
        // If that debt is paid off, apply remainder to next, etc.
        for (const debt of activeDebts) {
          if (availableForPayment <= 0.01) break;
          const payment = Math.min(debt.currentBalance, availableForPayment);
          debt.currentBalance -= payment;
          availableForPayment -= payment;
        }
      }
    }

    // Snapshot
    const currentTotalBalance = currentDebts.reduce((sum, d) => sum + d.currentBalance, 0);

    // Normalize logic
    currentDebts.forEach(d => {
        if (d.currentBalance < 0.01) d.currentBalance = 0;
    });

    timeline.push({
      date: reportingDate.toISOString().split('T')[0],
      totalBalance: Math.max(0, currentTotalBalance),
      totalInterestPaid: cumulativeInterestPaid,
      debts: currentDebts.reduce((acc, d) => ({ ...acc, [d.id]: d.currentBalance }), {})
    });
  }

  return {
    payoffDate: timeline[timeline.length - 1].date,
    totalInterestPaid: cumulativeInterestPaid,
    timeline
  };
};
