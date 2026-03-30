import React, { useMemo } from 'react';
import { Asset, AssetType, Debt, Projection, DailyBalance, TransactionType, Frequency } from '../types';
import { ShieldCheck, TrendingUp, AlertCircle, HeartPulse, DollarSign, BatteryCharging } from 'lucide-react';

interface FinancialHealthDashboardProps {
  assets: Asset[];
  debts: Debt[];
  projections: Projection[];
  currentBalance: number;
  timelineData: DailyBalance[];
}

const FinancialHealthDashboard: React.FC<FinancialHealthDashboardProps> = ({
  assets,
  debts,
  projections,
  currentBalance,
  timelineData,
}) => {
  // --- Score Calculations ---

  // 1. Savings Rate (Target: 20%)
  // Calculate monthly income and expenses from active projections
  const monthlyProjectedIncome = useMemo(() => {
    return projections
      .filter(p => p.isActive && p.type === TransactionType.INCOME)
      .reduce((sum, p) => {
        if (p.frequency === Frequency.MONTHLY) return sum + p.amount;
        if (p.frequency === Frequency.YEARLY) return sum + p.amount / 12;
        if (p.frequency === Frequency.WEEKLY) return sum + p.amount * 4.33;
        if (p.frequency === Frequency.DAILY) return sum + p.amount * 30;
        return sum; // ONCE omitted for regular monthly rate
      }, 0);
  }, [projections]);

  const monthlyProjectedExpenses = useMemo(() => {
    return projections
      .filter(p => p.isActive && p.type === TransactionType.EXPENSE)
      .reduce((sum, p) => {
        if (p.frequency === Frequency.MONTHLY) return sum + p.amount;
        if (p.frequency === Frequency.YEARLY) return sum + p.amount / 12;
        if (p.frequency === Frequency.WEEKLY) return sum + p.amount * 4.33;
        if (p.frequency === Frequency.DAILY) return sum + p.amount * 30;
        return sum; // ONCE omitted
      }, 0);
  }, [projections]);

  const savingsRate = useMemo(() => {
    if (monthlyProjectedIncome <= 0) return 0;
    const surplus = monthlyProjectedIncome - monthlyProjectedExpenses;
    if (surplus <= 0) return 0;
    return (surplus / monthlyProjectedIncome) * 100;
  }, [monthlyProjectedIncome, monthlyProjectedExpenses]);

  // Score 0-25 for Savings Rate. Max 25 points if rate >= 20%
  const savingsRateScore = Math.min(25, (savingsRate / 20) * 25);


  // 2. Debt-to-Income Ratio (DTI) (Target: < 30%)
  const monthlyDebtPayments = useMemo(() => {
    return debts.reduce((sum, d) => sum + d.minimumPayment, 0);
  }, [debts]);

  const dtiRatio = useMemo(() => {
    if (monthlyProjectedIncome <= 0) return 100; // Worst case if no income
    return (monthlyDebtPayments / monthlyProjectedIncome) * 100;
  }, [monthlyDebtPayments, monthlyProjectedIncome]);

  // Score 0-25 for DTI. Max 25 points if DTI <= 10%, 0 points if DTI >= 43%
  const dtiScore = useMemo(() => {
      if (dtiRatio <= 10) return 25;
      if (dtiRatio >= 43) return 0;
      // Linear mapping between 10% and 43%
      return 25 - ((dtiRatio - 10) / 33) * 25;
  }, [dtiRatio]);


  // 3. Emergency Fund Coverage (Target: 3-6 months)
  const liquidAssets = useMemo(() => {
    return currentBalance + assets
      .filter(a => a.liquidity === 'HIGH' || a.type === AssetType.CASH)
      .reduce((sum, a) => sum + a.value, 0);
  }, [currentBalance, assets]);

  const emergencyFundMonths = useMemo(() => {
    if (monthlyProjectedExpenses <= 0) return 6; // Max coverage if no expenses
    return liquidAssets / monthlyProjectedExpenses;
  }, [liquidAssets, monthlyProjectedExpenses]);

  // Score 0-25 for Emergency Fund. Max 25 points if >= 6 months, 0 if 0.
  const emergencyFundScore = Math.min(25, (emergencyFundMonths / 6) * 25);


  // 4. Cash Flow Stability
  const positiveDaysPercentage = useMemo(() => {
      const projectedTimeline = timelineData.filter(d => d.isProjected);
      if (projectedTimeline.length === 0) return 100;

      const positiveDays = projectedTimeline.filter(d => (d.projectedBalance || 0) >= 0).length;
      return (positiveDays / projectedTimeline.length) * 100;
  }, [timelineData]);

  // Score 0-25 for Stability. Max 25 points if 100% positive.
  const stabilityScore = Math.min(25, (positiveDaysPercentage / 100) * 25);


  // Overall Score
  const overallScore = Math.round(savingsRateScore + dtiScore + emergencyFundScore + stabilityScore);

  // --- Visual Helpers ---
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-fuchsia-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 60) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (score >= 40) return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  // --- Insights Generation ---
  const insights = useMemo(() => {
      const list = [];
      if (savingsRate < 10) {
          list.push({ text: "Your savings rate is below 10%. Consider finding areas to cut discretionary spending to boost your monthly surplus.", type: 'warning' });
      } else if (savingsRate >= 20) {
          list.push({ text: "Excellent savings rate! You are saving 20%+ of your income.", type: 'success' });
      }

      if (dtiRatio > 36) {
          list.push({ text: "Your debt-to-income ratio is high (>36%). Focus on aggressively paying down debt using the Debt Strategist.", type: 'warning' });
      }

      if (emergencyFundMonths < 3) {
          list.push({ text: `Your liquid assets only cover ${emergencyFundMonths.toFixed(1)} months of expenses. Aim for at least 3-6 months coverage.`, type: 'warning' });
      } else if (emergencyFundMonths >= 6) {
          list.push({ text: "Your emergency fund is fully funded (6+ months coverage). Great job!", type: 'success' });
      }

      if (positiveDaysPercentage < 100) {
          list.push({ text: "Your projected balance drops below zero in the future. Check your cash flow and upcoming bills.", type: 'alert' });
      }

      if (list.length === 0) {
          list.push({ text: "Your financial health looks solid across all key metrics. Keep it up!", type: 'success' });
      }
      return list;
  }, [savingsRate, dtiRatio, emergencyFundMonths, positiveDaysPercentage]);


  return (
    <div className="space-y-6 pb-20">

      {/* Top Section: Overall Score */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row items-center md:justify-between">
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
             <div className="flex items-center space-x-3 mb-2">
                 <HeartPulse size={32} className={getScoreColor(overallScore)} />
                 <h2 className="text-2xl font-bold text-slate-800">Financial Health Score</h2>
             </div>
             <p className="text-slate-500 max-w-md text-center md:text-left">
                 A comprehensive 0-100 rating based on your savings rate, debt load, emergency reserves, and cash flow stability.
             </p>
          </div>

          <div className="relative w-48 h-48 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                 <path
                     className="text-slate-100"
                     d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth="3"
                 />
                 <path
                     className={`${getScoreColor(overallScore)} transition-all duration-1000 ease-out`}
                     strokeDasharray={`${overallScore}, 100`}
                     d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth="3"
                 />
             </svg>
             <div className="absolute flex flex-col items-center justify-center">
                 <span className={`text-5xl font-extrabold ${getScoreColor(overallScore)}`}>{overallScore}</span>
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">/ 100</span>
             </div>
          </div>
      </div>

      {/* Grid: Breakdown & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Col: Metric Breakdown */}
          <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-slate-800 px-1">Score Breakdown</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Savings Rate Card */}
                  <div className={`p-5 rounded-xl border ${getScoreBgColor((savingsRateScore/25)*100)}`}>
                     <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center space-x-2">
                             <TrendingUp size={20} className="opacity-70" />
                             <span className="font-bold">Savings Rate</span>
                         </div>
                         <span className="font-bold text-lg">{savingsRate.toFixed(1)}%</span>
                     </div>
                     <p className="text-xs opacity-80 mb-3">Target: 20% or higher. Derived from your monthly projections.</p>
                     <div className="w-full bg-white/50 rounded-full h-1.5">
                         <div className="bg-current h-1.5 rounded-full" style={{ width: `${Math.min(100, (savingsRate/20)*100)}%` }}></div>
                     </div>
                  </div>

                  {/* DTI Card */}
                  <div className={`p-5 rounded-xl border ${getScoreBgColor((dtiScore/25)*100)}`}>
                     <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center space-x-2">
                             <DollarSign size={20} className="opacity-70" />
                             <span className="font-bold">Debt-to-Income</span>
                         </div>
                         <span className="font-bold text-lg">{dtiRatio.toFixed(1)}%</span>
                     </div>
                     <p className="text-xs opacity-80 mb-3">Target: Below 30%. Evaluates debt burden vs income.</p>
                     <div className="w-full bg-white/50 rounded-full h-1.5">
                         <div className="bg-current h-1.5 rounded-full" style={{ width: `${Math.min(100, dtiRatio)}%` }}></div>
                     </div>
                  </div>

                  {/* Emergency Fund Card */}
                  <div className={`p-5 rounded-xl border ${getScoreBgColor((emergencyFundScore/25)*100)}`}>
                     <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center space-x-2">
                             <ShieldCheck size={20} className="opacity-70" />
                             <span className="font-bold">Emergency Fund</span>
                         </div>
                         <span className="font-bold text-lg">{emergencyFundMonths.toFixed(1)} mo</span>
                     </div>
                     <p className="text-xs opacity-80 mb-3">Target: 3-6 months of expenses in liquid assets.</p>
                     <div className="w-full bg-white/50 rounded-full h-1.5">
                         <div className="bg-current h-1.5 rounded-full" style={{ width: `${Math.min(100, (emergencyFundMonths/6)*100)}%` }}></div>
                     </div>
                  </div>

                  {/* Stability Card */}
                  <div className={`p-5 rounded-xl border ${getScoreBgColor((stabilityScore/25)*100)}`}>
                     <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center space-x-2">
                             <BatteryCharging size={20} className="opacity-70" />
                             <span className="font-bold">Cash Flow Stability</span>
                         </div>
                         <span className="font-bold text-lg">{positiveDaysPercentage.toFixed(0)}%</span>
                     </div>
                     <p className="text-xs opacity-80 mb-3">Target: 100%. Days projected with a positive balance.</p>
                     <div className="w-full bg-white/50 rounded-full h-1.5">
                         <div className="bg-current h-1.5 rounded-full" style={{ width: `${positiveDaysPercentage}%` }}></div>
                     </div>
                  </div>
              </div>
          </div>

          {/* Right Col: AI Insights */}
          <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 px-1">Actionable Insights</h3>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="divide-y divide-slate-100">
                    {insights.map((insight, idx) => (
                        <div key={idx} className="p-4 flex items-start space-x-3 hover:bg-slate-50 transition-colors">
                           {insight.type === 'success' && <ShieldCheck size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />}
                           {insight.type === 'warning' && <AlertCircle size={20} className="text-fuchsia-500 flex-shrink-0 mt-0.5" />}
                           {insight.type === 'alert' && <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />}
                           <p className="text-sm text-slate-700 leading-relaxed">{insight.text}</p>
                        </div>
                    ))}
                 </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default FinancialHealthDashboard;
