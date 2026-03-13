import React, { useMemo } from 'react';
import { Transaction, Projection, Debt, Asset, AssetType, DailyBalance, SavingsGoal, TransactionType, Frequency } from '../types';
import { formatCurrency, getMonthKey } from '../utils/financialUtils';
import { HeartPulse, Target, ShieldAlert, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface FinancialHealthDashboardProps {
  transactions: Transaction[];
  projections: Projection[];
  debts: Debt[];
  assets: Asset[];
  currentBalance: number;
  savingsGoals: SavingsGoal[];
  timelineData: DailyBalance[];
}

const FinancialHealthDashboard: React.FC<FinancialHealthDashboardProps> = ({
  transactions,
  projections,
  debts,
  assets,
  currentBalance,
  savingsGoals,
  timelineData
}) => {
  const metrics = useMemo(() => {
    // 1. Calculate Monthly Income and Expenses from active projections
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    let monthlyDebtPayments = 0;

    projections.forEach(proj => {
      if (!proj.isActive) return;

      // Normalize to monthly value
      let monthlyValue = 0;
      if (proj.frequency === Frequency.MONTHLY) monthlyValue = proj.amount;
      else if (proj.frequency === Frequency.WEEKLY) monthlyValue = proj.amount * 4.33;
      else if (proj.frequency === Frequency.YEARLY) monthlyValue = proj.amount / 12;
      else if (proj.frequency === Frequency.DAILY) monthlyValue = proj.amount * 30;

      if (proj.type === TransactionType.INCOME) {
        monthlyIncome += monthlyValue;
      } else {
        monthlyExpenses += monthlyValue;
      }
    });

    // Calculate minimum debt payments
    debts.forEach(debt => {
      monthlyDebtPayments += debt.minimumPayment;
    });

    // Add debt payments to total expenses if not already included in projections
    // (We assume they are tracked separately in the strategist, but if they are in projections they might be double counted.
    // For this metric, let's explicitly use the debts list)

    // Savings rate is conceptually (Income - Expenses) / Income, or explicit savings goals.
    // Let's use Income - Base Expenses.
    const discretionary = monthlyIncome - monthlyExpenses - monthlyDebtPayments;
    const savingsRate = monthlyIncome > 0 ? Math.max(0, (discretionary / monthlyIncome) * 100) : 0;

    const debtToIncome = monthlyIncome > 0 ? (monthlyDebtPayments / monthlyIncome) * 100 : 0;

    // 2. Emergency Fund Calculation
    // Liquid assets: Cash (currentBalance) + HIGH liquidity assets
    const liquidAssets = currentBalance + assets
      .filter(a => a.type === AssetType.CASH || a.liquidity === 'HIGH')
      .reduce((sum, a) => sum + a.value, 0);

    const baseMonthlyLivingExpenses = monthlyExpenses + monthlyDebtPayments;
    const emergencyFundMonths = baseMonthlyLivingExpenses > 0
      ? liquidAssets / baseMonthlyLivingExpenses
      : 0;

    // 3. Cash Flow Stability
    // Look at timeline data to see how many days are projected to be positive
    let positiveDays = 0;
    let totalDays = 0;
    const futureTimeline = timelineData.filter(d => d.isProjected);

    futureTimeline.forEach(d => {
      totalDays++;
      if ((d.projectedBalance || 0) > 0) positiveDays++;
    });

    const cashFlowStability = totalDays > 0 ? (positiveDays / totalDays) * 100 : 100;

    // 4. Calculate Final Score (0-100)
    // Savings Rate: Max 25 points (Target 20%)
    const scoreSavings = Math.min(25, (savingsRate / 20) * 25);

    // DTI: Max 25 points (Target < 30%)
    // If DTI is 0, full 25 points. If DTI is 50%, 0 points.
    const scoreDTI = Math.max(0, 25 - (debtToIncome / 50) * 25);

    // Emergency Fund: Max 25 points (Target 6 months)
    const scoreEF = Math.min(25, (emergencyFundMonths / 6) * 25);

    // Cash Flow: Max 25 points (Target 100% positive days)
    const scoreCF = (cashFlowStability / 100) * 25;

    const totalScore = Math.round(scoreSavings + scoreDTI + scoreEF + scoreCF);

    return {
      score: totalScore,
      savingsRate: Math.round(savingsRate),
      debtToIncome: Math.round(debtToIncome),
      emergencyFundMonths: Math.round(emergencyFundMonths * 10) / 10,
      cashFlowStability: Math.round(cashFlowStability)
    };
  }, [projections, debts, assets, currentBalance, timelineData]);

  const { score, savingsRate, debtToIncome, emergencyFundMonths, cashFlowStability } = metrics;

  const getHealthText = () => {
    if (score >= 80) return { label: 'Excellent', color: 'text-emerald-600', advice: 'You are on track! Keep optimizing your investments.' };
    if (score >= 60) return { label: 'Good', color: 'text-blue-600', advice: 'Solid foundation. Focus on increasing your savings rate.' };
    if (score >= 40) return { label: 'Fair', color: 'text-amber-600', advice: 'Action needed. Review your debt-to-income ratio and emergency fund.' };
    return { label: 'Needs Attention', color: 'text-rose-600', advice: 'Your plan requires immediate review to avoid cash flow issues.' };
  };

  const healthData = getHealthText();

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
        <HeartPulse size={48} className="mx-auto text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Financial Health Score</h2>
        <div className="mt-6 relative inline-flex items-center justify-center">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="16"
              fill="transparent"
              className="text-slate-100"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="16"
              fill="transparent"
              strokeDasharray={88 * 2 * Math.PI}
              strokeDashoffset={88 * 2 * Math.PI - (score / 100) * 88 * 2 * Math.PI}
              className={`${score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500'} transition-all duration-1000 ease-out`}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
             <span className="text-5xl font-extrabold text-slate-800" data-testid="health-score">{score}</span>
             <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">out of 100</span>
          </div>
        </div>
        <p className="mt-6 text-slate-600 max-w-lg mx-auto">
          Your financial health is currently <strong className={healthData.color}>{healthData.label}</strong>. {healthData.advice}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
           <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Target size={20} /></div>
              <h3 className="font-bold text-slate-800">Savings Rate</h3>
           </div>
           <div className="text-3xl font-extrabold text-slate-700">{savingsRate}%</div>
           <p className="text-xs text-slate-500 mt-2 flex-grow">Target: &gt; 20%</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
           <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><TrendingUp size={20} className="transform rotate-180" /></div>
              <h3 className="font-bold text-slate-800">Debt-to-Income</h3>
           </div>
           <div className="text-3xl font-extrabold text-slate-700">{debtToIncome}%</div>
           <p className="text-xs text-slate-500 mt-2 flex-grow">Target: &lt; 30%</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
           <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ShieldAlert size={20} /></div>
              <h3 className="font-bold text-slate-800">Emergency Fund</h3>
           </div>
           <div className="text-3xl font-extrabold text-slate-700">{emergencyFundMonths} mo</div>
           <p className="text-xs text-slate-500 mt-2 flex-grow">Target: 3-6 months</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
           <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Info size={20} /></div>
              <h3 className="font-bold text-slate-800">Cash Flow</h3>
           </div>
           <div className="text-3xl font-extrabold text-slate-700">{cashFlowStability}/100</div>
           <p className="text-xs text-slate-500 mt-2 flex-grow">Stability of projected balances</p>
        </div>
      </div>
    </div>
  );
};

export default FinancialHealthDashboard;
