import React, { useMemo } from 'react';
import { Asset, AssetType, Projection, TransactionType, Frequency } from '../types';
import { ShieldAlert, TrendingDown, AlertTriangle, ShieldCheck } from 'lucide-react';

interface EmergencyFundStressTestProps {
  assets: Asset[];
  projections: Projection[];
  currentBalance: number;
}

const EmergencyFundStressTest: React.FC<EmergencyFundStressTestProps> = ({
  assets,
  projections,
  currentBalance,
}) => {
  // 1. Calculate Liquid Assets
  const liquidAssets = useMemo(() => {
    return currentBalance + assets
      .filter(a => a.liquidity === 'HIGH' || a.type === AssetType.CASH)
      .reduce((sum, a) => sum + a.value, 0);
  }, [currentBalance, assets]);

  // 2. Calculate Base Monthly Expenses
  const monthlyBaseExpenses = useMemo(() => {
    return projections
      .filter(p => p.isActive && p.type === TransactionType.EXPENSE)
      .reduce((sum, p) => {
        if (p.frequency === Frequency.MONTHLY) return sum + p.amount;
        if (p.frequency === Frequency.YEARLY) return sum + p.amount / 12;
        if (p.frequency === Frequency.WEEKLY) return sum + p.amount * 4.33;
        if (p.frequency === Frequency.DAILY) return sum + p.amount * 30;
        return sum;
      }, 0);
  }, [projections]);

  // 3. Scenario Calculations
  const scenarios = useMemo(() => {
    const expenses = monthlyBaseExpenses > 0 ? monthlyBaseExpenses : 1; // Prevent division by zero

    // Scenario 1: Base (Current Runway)
    const baseRunway = liquidAssets / expenses;

    // Scenario 2: Sudden Income Loss (Same as Base, but emphasizes 0 income)
    const incomeLossRunway = liquidAssets / expenses;

    // Scenario 3: Large Unexpected Expense ($5,000)
    const unexpectedExpenseAmount = 5000;
    const remainingAfterExpense = Math.max(0, liquidAssets - unexpectedExpenseAmount);
    const largeExpenseRunway = remainingAfterExpense / expenses;

    // Scenario 4: Macro Shock (20% increase in expenses)
    const inflatedExpenses = expenses * 1.2;
    const macroShockRunway = liquidAssets / inflatedExpenses;

    return {
      base: baseRunway,
      incomeLoss: incomeLossRunway,
      largeExpense: largeExpenseRunway,
      macroShock: macroShockRunway,
      expenses,
      inflatedExpenses
    };
  }, [liquidAssets, monthlyBaseExpenses]);

  // Format helper
  const formatRunway = (months: number) => {
    return months.toFixed(1) + ' mo';
  };

  const getRunwayColor = (months: number) => {
    if (months >= 6) return 'text-emerald-500';
    if (months >= 3) return 'text-amber-500';
    return 'text-red-500';
  };

  const getRunwayBgColor = (months: number) => {
    if (months >= 6) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (months >= 3) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  const getRunwayBarColor = (months: number) => {
    if (months >= 6) return 'bg-emerald-500';
    if (months >= 3) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row items-center md:justify-between">
        <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
          <div className="flex items-center space-x-3 mb-2">
            <ShieldAlert size={32} className="text-indigo-600" />
            <h2 className="text-2xl font-bold text-slate-800">Emergency Fund Stress Test</h2>
          </div>
          <p className="text-slate-500 max-w-xl text-center md:text-left">
            Evaluate the resilience of your financial plan against unexpected events. This module simulates sudden income loss, large unexpected expenses, and macroeconomic shocks to calculate your savings runway.
          </p>
        </div>

        <div className="flex flex-col items-center bg-slate-50 p-6 rounded-xl border border-slate-100">
          <span className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Current Runway</span>
          <span className={`text-4xl font-extrabold ${getRunwayColor(scenarios.base)}`}>
            {formatRunway(scenarios.base)}
          </span>
          <span className="text-xs text-slate-400 mt-2">Target: 3-6 months</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Scenarios Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 px-1">Stress Scenarios</h3>

          <div className="space-y-4">
            {/* Scenario 1: Income Loss */}
            <div className={`p-5 rounded-xl border ${getRunwayBgColor(scenarios.incomeLoss)}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <TrendingDown size={20} className="opacity-70" />
                  <span className="font-bold text-lg">Sudden Income Loss</span>
                </div>
                <span className="font-bold text-xl">{formatRunway(scenarios.incomeLoss)}</span>
              </div>
              <p className="text-sm opacity-80 mb-4">
                If your income dropped to zero today, your liquid assets (${liquidAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) could cover your base monthly expenses (${scenarios.expenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) for this long.
              </p>
              <div className="w-full bg-white/50 rounded-full h-2">
                <div className={`${getRunwayBarColor(scenarios.incomeLoss)} h-2 rounded-full transition-all`} style={{ width: `${Math.min(100, (scenarios.incomeLoss / 6) * 100)}%` }}></div>
              </div>
            </div>

            {/* Scenario 2: Large Unexpected Expense */}
            <div className={`p-5 rounded-xl border ${getRunwayBgColor(scenarios.largeExpense)}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle size={20} className="opacity-70" />
                  <span className="font-bold text-lg">Large Unexpected Expense</span>
                </div>
                <span className="font-bold text-xl">{formatRunway(scenarios.largeExpense)}</span>
              </div>
              <p className="text-sm opacity-80 mb-4">
                If you had a sudden $5,000 emergency expense (e.g., medical bill, home repair), your remaining runway to cover monthly expenses would drop to this level.
              </p>
              <div className="w-full bg-white/50 rounded-full h-2">
                <div className={`${getRunwayBarColor(scenarios.largeExpense)} h-2 rounded-full transition-all`} style={{ width: `${Math.min(100, (scenarios.largeExpense / 6) * 100)}%` }}></div>
              </div>
            </div>

            {/* Scenario 3: Macro Shock */}
            <div className={`p-5 rounded-xl border ${getRunwayBgColor(scenarios.macroShock)}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <TrendingDown size={20} className="opacity-70" />
                  <span className="font-bold text-lg">Macro Shock (High Inflation)</span>
                </div>
                <span className="font-bold text-xl">{formatRunway(scenarios.macroShock)}</span>
              </div>
              <p className="text-sm opacity-80 mb-4">
                If macroeconomic conditions caused your base expenses to increase by 20% (to ${scenarios.inflatedExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo), your current liquid assets would last this long.
              </p>
              <div className="w-full bg-white/50 rounded-full h-2">
                <div className={`${getRunwayBarColor(scenarios.macroShock)} h-2 rounded-full transition-all`} style={{ width: `${Math.min(100, (scenarios.macroShock / 6) * 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Recommendations */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 px-1">Actionable Recommendations</h3>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            {scenarios.base < 3 && (
              <div className="flex items-start space-x-3">
                <AlertTriangle size={24} className="text-red-500 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">High Risk: Build Liquid Savings</h4>
                  <p className="text-sm text-slate-600">Your base runway is under 3 months. Prioritize building your emergency fund. Consider cutting discretionary spending or finding additional income sources to boost your liquid assets.</p>
                </div>
              </div>
            )}
            {scenarios.base >= 3 && scenarios.base < 6 && (
              <div className="flex items-start space-x-3">
                <ShieldCheck size={24} className="text-amber-500 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Moderate Risk: Expand Runway</h4>
                  <p className="text-sm text-slate-600">You have a solid foundation, but reaching a 6-month runway provides significant security against larger shocks. Continue consistent contributions to your emergency fund.</p>
                </div>
              </div>
            )}
            {scenarios.base >= 6 && (
              <div className="flex items-start space-x-3">
                <ShieldCheck size={24} className="text-emerald-500 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Low Risk: Optimize Assets</h4>
                  <p className="text-sm text-slate-600">Your emergency fund is fully funded (6+ months). Consider redirecting excess cash flow towards higher-yield investments or debt payoff rather than holding too much cash.</p>
                </div>
              </div>
            )}

            {/* Specific Shock Recommendation */}
            {scenarios.largeExpense < 1 && (
              <div className="flex items-start space-x-3 mt-4 pt-4 border-t border-slate-100">
                <AlertTriangle size={24} className="text-amber-500 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Vulnerable to Surprises</h4>
                  <p className="text-sm text-slate-600">A single $5,000 emergency would severely deplete your runway. Look into specialized sinking funds for expected large repairs (car, home) to protect your core emergency fund.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyFundStressTest;
