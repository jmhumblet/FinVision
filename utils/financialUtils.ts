import { Transaction, Projection, DailyBalance, TransactionType, Frequency, Scenario, AdjustmentType, MonthlySummary, UnreconciledOccurrence } from "../types";

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IE', { 
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getMonthKey = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

export const getUnreconciledProjections = (
  startDate: string,
  endDate: string,
  projections: Projection[]
): UnreconciledOccurrence[] => {
  const start = parseLocalYYYYMMDD(startDate);
  const end = parseLocalYYYYMMDD(endDate);
  const list: UnreconciledOccurrence[] = [];

  projections.forEach(proj => {
    if (!proj.isActive) return;
    // Iterate day by day from start to end
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      
      const val = calculateProjectionValueForDate(proj, d, dateStr);
      if (val !== 0) {
        list.push({
          id: `${proj.id}_${dateStr}`,
          projId: proj.id,
          name: proj.name,
          amount: Math.abs(val),
          dateStr,
          type: proj.type
        });
      }
    }
  });
  return list.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
};

export const calculateMonthlySummary = (
  monthKey: string,
  actualBalance: number,
  clearedProjectionIds: string[],
  projections: Projection[]
): MonthlySummary => {
  const [year, month] = monthKey.split('-').map(Number);
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0);
  
  let remainingIncome = 0;
  let remainingExpenses = 0;
  let totalMonthIncome = 0;
  let totalMonthExpenses = 0;

  projections.forEach(proj => {
    if (!proj.isActive) return;

    // Calculate all occurrences in this month
    for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      
      const val = calculateProjectionValueForDate(proj, d, dateStr);
      
      if (val !== 0) {
        const absVal = Math.abs(val);
        if (val > 0) {
          totalMonthIncome += absVal;
        } else {
          totalMonthExpenses += absVal;
        }

        // If not cleared, it's "remaining"
        if (!clearedProjectionIds.includes(`${proj.id}_${dateStr}`)) {
          if (val > 0) {
            remainingIncome += absVal;
          } else {
            remainingExpenses += absVal;
          }
        }
      }
    }
  });

  const remainingSpendable = actualBalance + remainingIncome - remainingExpenses;
  
  // Progress bar logic: how much of our expected total expenses have we "cleared" or still have?
  // Actually, usually progress is spent/budget.
  // Let's say: (TotalExpenses - RemainingExpenses) / TotalExpenses
  const spent = totalMonthExpenses - remainingExpenses;
  const spentPercentage = totalMonthExpenses > 0 ? (spent / totalMonthExpenses) * 100 : 0;

  return {
    remainingSpendable,
    totalProjectedIncome: totalMonthIncome,
    totalProjectedExpenses: totalMonthExpenses,
    spentPercentage
  };
};

export const createReconciliationTransaction = (
  amount: number,
  date: string,
  description: string = 'Balance Correction'
): Partial<Transaction> => {
  return {
    description,
    amount: Math.abs(amount),
    date,
    categoryId: '8', // 'Other'
    type: amount >= 0 ? TransactionType.INCOME : TransactionType.EXPENSE,
    skipAutoCategorization: true
  };
};

// Helper to parse YYYY-MM-DD string to a Local Date object at 00:00:00
const parseLocalYYYYMMDD = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const generateTimeline = (
  startingBalance: number,
  transactions: Transaction[],
  projections: Projection[],
  daysToProject: number = 90,
  scenarios: Scenario[] = []
): DailyBalance[] => {
  const timeline: DailyBalance[] = [];
  
  // 1. Sort Transactions
  const sortedTransactions = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  
  // 2. Identify "Split Point"
  const lastTx = sortedTransactions[sortedTransactions.length - 1];
  const lastTransactionDate = lastTx ? parseLocalYYYYMMDD(lastTx.date) : new Date();
  lastTransactionDate.setHours(0,0,0,0);

  // 3. Determine Timeline Range
  const today = new Date();
  today.setHours(0,0,0,0);
  
  let startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 30); 

  if (sortedTransactions.length > 0) {
    const firstTxDate = parseLocalYYYYMMDD(sortedTransactions[0].date);
    if (firstTxDate < startDate) {
      startDate = firstTxDate;
    }
  }

  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + daysToProject);

  // 4. Pre-group transactions
  const txMap = new Map<string, number>();
  sortedTransactions.forEach(tx => {
    const val = tx.type === TransactionType.INCOME ? tx.amount : -tx.amount;
    const key = tx.date;
    txMap.set(key, (txMap.get(key) || 0) + val);
  });

  // 5. Initialize Balances
  let currentBalance = startingBalance;
  
  // Initialize scenario balances. They start identical to currentBalance.
  // We only track scenarios that are Active.
  const activeScenarios = scenarios.filter(s => s.isActive);
  const scenarioBalances = new Map<string, number>();
  activeScenarios.forEach(s => scenarioBalances.set(s.id, startingBalance));

  // 6. Iterate Days
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const isLocalMidnight = d.getHours() === 0;
    if (!isLocalMidnight) d.setHours(0,0,0,0);

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;

    const isAfterLastTx = d.getTime() > lastTransactionDate.getTime();

    // A. Apply Historical Transactions (Applies to Base AND Scenarios equally up to split point)
    const txChange = txMap.get(dateStr) || 0;
    
    if (!isAfterLastTx) {
      currentBalance += txChange;
      activeScenarios.forEach(s => {
        scenarioBalances.set(s.id, (scenarioBalances.get(s.id) || 0) + txChange);
      });
    }

    // B. Apply Projections (Base)
    let baseProjChange = 0;
    
    if (isAfterLastTx) {
        projections.forEach(proj => {
            if (!proj.isActive) return;
            const val = calculateProjectionValueForDate(proj, d, dateStr);
            baseProjChange += val;
        });
        currentBalance += baseProjChange;
    }

    // C. Apply Scenarios (Parallel Calculation)
    if (isAfterLastTx) {
        activeScenarios.forEach(s => {
            let scenarioChange = 0;
            
            projections.forEach(proj => {
                if (!proj.isActive) return;

                // 1. Check if this scenario overrides this projection
                const adjustment = s.adjustments.find(a => a.projectionId === proj.id);
                
                // 2. Determine the "Effective Projection" to apply
                let effectiveAmount = proj.amount;
                let isRemoved = false;
                
                if (adjustment) {
                    // Check if adjustment is valid for this date
                    const adjStart = adjustment.startDate ? parseLocalYYYYMMDD(adjustment.startDate) : null;
                    const adjEnd = adjustment.endDate ? parseLocalYYYYMMDD(adjustment.endDate) : null;
                    
                    const isStarted = !adjStart || d >= adjStart;
                    const isEnded = adjEnd && d > adjEnd;

                    if (isStarted && !isEnded) {
                        switch (adjustment.type) {
                            case AdjustmentType.REMOVE_RECORD:
                                isRemoved = true;
                                break;
                            case AdjustmentType.SET_AMOUNT:
                                effectiveAmount = adjustment.value;
                                break;
                            case AdjustmentType.ADD_AMOUNT:
                                effectiveAmount = proj.amount + adjustment.value;
                                break;
                            case AdjustmentType.PERCENTAGE_INCREASE:
                                effectiveAmount = proj.amount * (1 + adjustment.value / 100);
                                break;
                            case AdjustmentType.PERCENTAGE_DECREASE:
                                effectiveAmount = proj.amount * (1 - adjustment.value / 100);
                                break;
                        }
                    }
                }

                if (!isRemoved) {
                    // 3. Calculate value using effective amount
                    const effProj = { ...proj, amount: effectiveAmount };
                    const val = calculateProjectionValueForDate(effProj, d, dateStr);
                    scenarioChange += val;
                }
            });

            // 4. Apply New Projections specific to this scenario
            if (s.newProjections) {
                s.newProjections.forEach(newProj => {
                    if (!newProj.isActive) return;
                    const val = calculateProjectionValueForDate(newProj, d, dateStr);
                    scenarioChange += val;
                });
            }

            scenarioBalances.set(s.id, (scenarioBalances.get(s.id) || 0) + scenarioChange);
        });
    }

    // D. Construct Data Point
    const dataPoint: DailyBalance = {
        date: dateStr,
        historicalBalance: !isAfterLastTx ? currentBalance : null,
        projectedBalance: isAfterLastTx ? currentBalance : (d.getTime() === lastTransactionDate.getTime() ? currentBalance : null),
        isProjected: isAfterLastTx
    };

    // Add scenario lines
    activeScenarios.forEach(s => {
        // Scenarios exist in history too (as base), but we usually only plot them in the future
        // to avoid clutter, or we plot them identical to history.
        // Let's plot them starting from Today/Split Point for clarity.
        if (isAfterLastTx || d.getTime() === lastTransactionDate.getTime()) {
             dataPoint[`scenario_${s.id}`] = scenarioBalances.get(s.id);
        }
    });

    timeline.push(dataPoint);
  }

  return timeline;
};

export const calculateProjectionValueForDate = (proj: Projection, d: Date, dateStr: string): number => {
    const projStart = parseLocalYYYYMMDD(proj.startDate);
    const projEnd = proj.endDate ? parseLocalYYYYMMDD(proj.endDate) : null;

    if (projStart > d) return 0;
    if (projEnd && projEnd < d) return 0;

    const val = proj.type === TransactionType.INCOME ? proj.amount : -proj.amount;

    if (proj.frequency === Frequency.ONCE) {
        if (dateStr === proj.startDate) return val;
    } else if (proj.frequency === Frequency.DAILY) {
        return val;
    } else if (proj.frequency === Frequency.MONTHLY) {
        if (d.getDate() === projStart.getDate()) return val;
    } else if (proj.frequency === Frequency.WEEKLY) {
        if (d.getDay() === projStart.getDay()) return val;
    } else if (proj.frequency === Frequency.YEARLY) {
        if (d.getDate() === projStart.getDate() && d.getMonth() === projStart.getMonth()) return val;
    }
    
    return 0;
};
export const calculateMonthlyIncomeAndDiscretionary = (
  transactions: Transaction[],
  categories: { id: string; name: string }[]
): { month: string; income: number; discretionary: number; totalExpenses: number; savingsRate: number; categoryBreakdown: Record<string, number> }[] => {
  const monthData: Record<string, { income: number; discretionary: number; totalExpenses: number; categoryBreakdown: Record<string, number> }> = {};

  // Identify non-discretionary (fixed) categories. We assume typical fixed ones based on naming, or we assume specific IDs.
  // In our default categories: 'Salary', 'Rent/Mortgage', 'Groceries', 'Utilities', 'Transport', 'Health', 'Entertainment', 'Other'
  // Let's assume Rent/Mortgage, Utilities, Health, Transport are fixed. Everything else (except Salary) is discretionary.
  // Actually, Groceries could be considered variable/discretionary, but let's stick to the prompt's hint:
  // "using categories other than typical fixed expenses like Rent/Mortgage, Utilities"
  const fixedCategoryNames = ['Rent/Mortgage', 'Utilities', 'Transport', 'Health', 'Debt', 'Credit Card'];
  const fixedCategoryIds = categories.filter(c => fixedCategoryNames.some(name => c.name.toLowerCase().includes(name.toLowerCase()))).map(c => c.id);

  transactions.forEach(tx => {
    const monthKey = tx.date.substring(0, 7); // YYYY-MM
    if (!monthData[monthKey]) {
      monthData[monthKey] = { income: 0, discretionary: 0, totalExpenses: 0, categoryBreakdown: {} };
    }

    if (tx.type === TransactionType.INCOME) {
      monthData[monthKey].income += tx.amount;
    } else {
      monthData[monthKey].totalExpenses += tx.amount;

      const isFixed = fixedCategoryIds.includes(tx.categoryId);
      if (!isFixed) {
        monthData[monthKey].discretionary += tx.amount;

        const catName = categories.find(c => c.id === tx.categoryId)?.name || 'Other';
        if (!monthData[monthKey].categoryBreakdown[catName]) {
          monthData[monthKey].categoryBreakdown[catName] = 0;
        }
        monthData[monthKey].categoryBreakdown[catName] += tx.amount;
      }
    }
  });

  const sortedMonths = Object.keys(monthData).sort();

  return sortedMonths.map(month => {
    const data = monthData[month];
    const savingsRate = data.income > 0 ? ((data.income - data.totalExpenses) / data.income) * 100 : 0;
    return {
      month,
      income: data.income,
      discretionary: data.discretionary,
      totalExpenses: data.totalExpenses,
      savingsRate,
      categoryBreakdown: data.categoryBreakdown
    };
  });
};

export const detectLifestyleCreep = (
  historicalData: { month: string; income: number; discretionary: number }[],
  monthsToAnalyze: number = 6
): { hasCreep: boolean; incomeGrowth: number; discretionaryGrowth: number; insights: string[] } => {
  if (historicalData.length < 2) {
    return { hasCreep: false, incomeGrowth: 0, discretionaryGrowth: 0, insights: ['Not enough data to analyze lifestyle creep.'] };
  }

  const dataToAnalyze = historicalData.slice(-monthsToAnalyze);
  if (dataToAnalyze.length < 2) {
     return { hasCreep: false, incomeGrowth: 0, discretionaryGrowth: 0, insights: ['Not enough data points in the selected period.'] };
  }

  const firstMonth = dataToAnalyze[0];
  const lastMonth = dataToAnalyze[dataToAnalyze.length - 1];

  const incomeGrowth = firstMonth.income > 0 ? ((lastMonth.income - firstMonth.income) / firstMonth.income) * 100 : 0;
  const discretionaryGrowth = firstMonth.discretionary > 0 ? ((lastMonth.discretionary - firstMonth.discretionary) / firstMonth.discretionary) * 100 : 0;

  const insights: string[] = [];
  let hasCreep = false;

  if (incomeGrowth > 0 && discretionaryGrowth > incomeGrowth) {
    hasCreep = true;
    insights.push(`Your income grew by ${incomeGrowth.toFixed(1)}%, but discretionary spending grew by ${discretionaryGrowth.toFixed(1)}%.`);
    insights.push("You are experiencing lifestyle creep. Your spending is increasing faster than your income.");
  } else if (incomeGrowth <= 0 && discretionaryGrowth > 0) {
    hasCreep = true;
    insights.push(`Your discretionary spending increased by ${discretionaryGrowth.toFixed(1)}% while your income did not grow.`);
  } else if (discretionaryGrowth > 0 && incomeGrowth > 0) {
      insights.push(`Both income and discretionary spending grew, but your spending growth (${discretionaryGrowth.toFixed(1)}%) is within your income growth (${incomeGrowth.toFixed(1)}%).`);
  } else {
      insights.push("No significant lifestyle creep detected in this period. Great job managing your expenses!");
  }

  return { hasCreep, incomeGrowth, discretionaryGrowth, insights };
};

export const calculateSafeToSpend = (
  currentBalance: number,
  projections: Projection[],
  fromDate: Date = new Date()
): { safeToSpend: number; nextPayday: Date | null; daysUntil: number } => {
  const start = new Date(fromDate);
  start.setHours(0, 0, 0, 0);

  // Find next payday within the next 60 days
  let nextPayday: Date | null = null;
  const maxSearchDays = 60;

  for (let i = 1; i <= maxSearchDays; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    // Check if any active INCOME projection occurs on this date
    let hasIncome = false;
    for (const proj of projections) {
      if (proj.isActive && proj.type === TransactionType.INCOME) {
        if (calculateProjectionValueForDate(proj, d, dateStr) > 0) {
          hasIncome = true;
          break;
        }
      }
    }

    if (hasIncome) {
      nextPayday = d;
      break;
    }
  }

  // If no payday found within 60 days, default to 30 days
  const daysUntil = nextPayday
    ? Math.round((nextPayday.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    : 30;

  const endDate = nextPayday || new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Calculate upcoming expenses up to (but not including) the next payday
  let upcomingExpenses = 0;

  for (let d = new Date(start); d < endDate; d.setDate(d.getDate() + 1)) {
    const isToday = d.getTime() === start.getTime();
    if (isToday) continue; // Start calculating expenses from tomorrow

    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    for (const proj of projections) {
      if (proj.isActive && proj.type === TransactionType.EXPENSE) {
        // calculateProjectionValueForDate returns negative for expenses
        const val = calculateProjectionValueForDate(proj, d, dateStr);
        if (val < 0) {
          upcomingExpenses += Math.abs(val);
        }
      }
    }
  }

  // Calculate safe to spend per day
  const availableFunds = currentBalance - upcomingExpenses;
  let safeToSpend = 0;

  if (availableFunds > 0) {
    safeToSpend = availableFunds / daysUntil;
  }

  return {
    safeToSpend,
    nextPayday,
    daysUntil
  };
};
