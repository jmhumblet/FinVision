import React from 'react';
import { ShieldCheck, Calendar, Info } from 'lucide-react';
import { Projection, SavingsGoal } from '../types';
import { calculateSafeToSpend, formatCurrency } from '../utils/financialUtils';

interface SafeToSpendCardProps {
  currentBalance: number;
  projections: Projection[];
  savingsGoals: SavingsGoal[];
}

const SafeToSpendCard: React.FC<SafeToSpendCardProps> = ({ currentBalance, projections, savingsGoals }) => {
  const { dailyAmount, nextPayday, daysRemaining } = calculateSafeToSpend(currentBalance, projections, savingsGoals);

  const formattedPayday = nextPayday
    ? new Date(nextPayday).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : 'Unknown';

  const isWarning = dailyAmount < 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-500 text-sm font-semibold flex items-center">
            "Safe-to-Spend" Daily
            <div className="relative ml-2 flex items-center group/info">
                <Info size={14} className="text-slate-300 hover:text-slate-500 cursor-help" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-10 pointer-events-none text-center">
                    Discretionary capacity per day after accounting for upcoming bills and savings goals until your next payday.
                </div>
            </div>
        </span>
        <span className={`${isWarning ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'} text-[10px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider`}>
            Metric
        </span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className={`text-4xl font-extrabold tracking-tight ${isWarning ? 'text-red-600' : 'text-slate-800'}`}>
            {formatCurrency(dailyAmount)}
          </div>
          <div className="text-xs text-slate-400 mt-2 font-semibold flex items-center">
            <Calendar size={14} className="mr-1.5" />
            Next payday: {formattedPayday} ({daysRemaining} days)
          </div>
        </div>
        {!isWarning && (
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase tracking-wider">
             <ShieldCheck size={16} />
             <span>Safe</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafeToSpendCard;
