import React, { useMemo } from 'react';
import { Projection, SavingsGoal } from '../types';
import { calculateSafeToSpend, formatCurrency, formatDate } from '../utils/financialUtils';
import { ShieldCheck, ShieldAlert, CalendarClock } from 'lucide-react';

interface SafeToSpendCardProps {
  projections: Projection[];
  currentBalance: number;
  savingsGoals: SavingsGoal[];
}

const SafeToSpendCard: React.FC<SafeToSpendCardProps> = ({ projections, currentBalance, savingsGoals }) => {
  const { safeToSpendDaily, daysUntilPayday, totalUpcomingObligations, nextPayday } = useMemo(() => {
    return calculateSafeToSpend(projections, currentBalance, savingsGoals);
  }, [projections, currentBalance, savingsGoals]);

  const isWarning = safeToSpendDaily < 0;

  return (
    <div className={`p-6 rounded-2xl shadow-sm border hover:shadow-md transition-shadow relative overflow-hidden ${
      isWarning ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {isWarning ? (
            <ShieldAlert size={20} className="text-red-600" />
          ) : (
            <ShieldCheck size={20} className="text-emerald-600" />
          )}
          <span className={`text-sm font-semibold ${isWarning ? 'text-red-700' : 'text-slate-500'}`}>
            Safe-to-Spend Daily
          </span>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider ${
          isWarning ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
        }`}>
          Metric
        </span>
      </div>

      <div className="flex flex-col">
        <div className={`text-4xl font-extrabold tracking-tight ${isWarning ? 'text-red-700' : 'text-slate-800'}`}>
          {formatCurrency(safeToSpendDaily)}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs">
           <div className="flex items-center text-slate-500 font-medium">
             <CalendarClock size={14} className="mr-1.5" />
             <span>
               {nextPayday ? `Next payday: ${formatDate(nextPayday)}` : 'No upcoming income found'}
               {' '}({daysUntilPayday} {daysUntilPayday === 1 ? 'day' : 'days'})
             </span>
           </div>
        </div>

        <div className="mt-3 bg-white/60 p-3 rounded-lg border border-slate-100/50">
           <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Current Balance:</span>
              <span className="font-semibold text-slate-700">{formatCurrency(currentBalance)}</span>
           </div>
           <div className="flex justify-between text-xs text-slate-500">
              <span>Upcoming Obligations & Savings:</span>
              <span className="font-semibold text-slate-700">{formatCurrency(totalUpcomingObligations)}</span>
           </div>
           {isWarning && (
             <div className="mt-2 text-xs text-red-600 font-semibold bg-red-100/50 p-2 rounded">
               Warning: You are projected to be short for upcoming obligations. Try reducing expenses.
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default SafeToSpendCard;
