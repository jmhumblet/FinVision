import React, { useMemo } from 'react';
import { Transaction, Projection, Asset, Debt } from '../types';
import { getFinancialHealth, HealthScores } from '../utils/financialHealthUtils';
import { HeartPulse, Target, ShieldAlert, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FinancialHealthDashboardProps {
  transactions: Transaction[];
  projections: Projection[];
  assets: Asset[];
  debts: Debt[];
}

const FinancialHealthDashboard: React.FC<FinancialHealthDashboardProps> = ({
  transactions,
  projections,
  assets,
  debts
}) => {
  const health = useMemo(() => {
    return getFinancialHealth(transactions, projections, assets, debts);
  }, [transactions, projections, assets, debts]);

  const { overallScore, savingsRate, debtToIncomeRatio, emergencyFundCoverage, cashFlowStability } = health;

  // Determine colors based on score
  let scoreColor = 'text-red-500';
  let bgColor = 'bg-red-50';
  let message = 'Needs Immediate Attention';
  if (overallScore >= 80) {
    scoreColor = 'text-emerald-500';
    bgColor = 'bg-emerald-50';
    message = 'Excellent Financial Health';
  } else if (overallScore >= 50) {
    scoreColor = 'text-amber-500';
    bgColor = 'bg-amber-50';
    message = 'On Track, Room for Improvement';
  }

  const recommendations = [];
  if (savingsRate < 20) {
    recommendations.push({
      id: 'rec-1',
      type: 'warning',
      title: 'Increase Savings Rate',
      description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Try to aim for at least 20% to build wealth faster. Consider reducing discretionary spending or finding ways to increase income.`
    });
  } else {
    recommendations.push({
      id: 'rec-1-good',
      type: 'success',
      title: 'Great Savings Rate!',
      description: `You're saving ${savingsRate.toFixed(1)}% of your income. Keep it up!`
    });
  }

  if (debtToIncomeRatio >= 30) {
    recommendations.push({
      id: 'rec-2',
      type: 'warning',
      title: 'Lower Debt-to-Income Ratio',
      description: `Your DTI is high at ${debtToIncomeRatio.toFixed(1)}%. Focus on paying down debt (e.g., using Avalanche or Snowball methods) before taking on new obligations.`
    });
  }

  if (emergencyFundCoverage < 3) {
    recommendations.push({
      id: 'rec-3',
      type: 'warning',
      title: 'Build Emergency Fund',
      description: `You only have ${emergencyFundCoverage.toFixed(1)} months of coverage. Aim for 3-6 months of essential expenses in highly liquid assets.`
    });
  }

  if (cashFlowStability < 80) {
    recommendations.push({
      id: 'rec-4',
      type: 'warning',
      title: 'Stabilize Cash Flow',
      description: `You have had negative cash flow in some recent months. Try to ensure your monthly income consistently exceeds your expenses.`
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-red-100 text-red-600 rounded-xl">
          <HeartPulse size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Financial Health Score</h1>
          <p className="text-slate-500 text-sm">A holistic view of your financial well-being.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Score Gauge/Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center lg:col-span-1">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Simple CSS ring instead of full SVG gauge for brevity, but let's make it look like a gauge */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                    cx="50" cy="50" r="45"
                    className="text-slate-100 stroke-current"
                    strokeWidth="10"
                    fill="transparent"
                />
                <circle
                    cx="50" cy="50" r="45"
                    className={`${scoreColor} stroke-current`}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray="282.7"
                    strokeDashoffset={282.7 - (282.7 * overallScore) / 100}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className={`text-5xl font-extrabold ${scoreColor}`}>{overallScore}</span>
                <span className="text-slate-400 text-xs font-semibold uppercase mt-1">out of 100</span>
            </div>
          </div>
          <div className={`mt-6 px-4 py-2 rounded-full ${bgColor} ${scoreColor} text-sm font-bold flex items-center`}>
              {overallScore >= 80 ? <CheckCircle2 size={16} className="mr-2" /> : <AlertCircle size={16} className="mr-2" />}
              {message}
          </div>
        </div>

        {/* Breakdowns */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard
                title="Savings Rate"
                value={`${savingsRate.toFixed(1)}%`}
                target="Target: > 20%"
                isGood={savingsRate >= 20}
                icon={<Target size={20} />}
            />
            <MetricCard
                title="Debt-to-Income"
                value={`${debtToIncomeRatio.toFixed(1)}%`}
                target="Target: < 30%"
                isGood={debtToIncomeRatio < 30}
                icon={<TrendingUp size={20} />}
            />
            <MetricCard
                title="Emergency Fund"
                value={`${emergencyFundCoverage.toFixed(1)} mo`}
                target="Target: 3-6 months"
                isGood={emergencyFundCoverage >= 3}
                icon={<ShieldAlert size={20} />}
            />
            <MetricCard
                title="Cash Flow Stability"
                value={`${cashFlowStability.toFixed(0)}%`}
                target="Target: > 80% positive"
                isGood={cashFlowStability >= 80}
                icon={<HeartPulse size={20} />}
            />
        </div>
      </div>

      {/* Actionable Insights */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <TrendingUp size={20} className="mr-2 text-blue-500" />
            Actionable Insights
          </h2>
          <div className="space-y-4">
              {recommendations.map(rec => (
                  <div key={rec.id} className={`p-4 rounded-xl border ${rec.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'} flex items-start space-x-3`}>
                      <div className="mt-0.5">
                          {rec.type === 'warning' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                      </div>
                      <div>
                          <h3 className="font-semibold text-sm mb-1">{rec.title}</h3>
                          <p className="text-xs opacity-90 leading-relaxed">{rec.description}</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, target, isGood, icon }: { title: string, value: string, target: string, isGood: boolean, icon: React.ReactNode }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
            <span className="text-slate-500 text-sm font-semibold">{title}</span>
            <div className={`p-1.5 rounded-lg ${isGood ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                {icon}
            </div>
        </div>
        <div>
            <div className={`text-2xl font-extrabold ${isGood ? 'text-slate-800' : 'text-amber-600'}`}>{value}</div>
            <div className="text-xs text-slate-400 mt-1">{target}</div>
        </div>
    </div>
);

export default FinancialHealthDashboard;
