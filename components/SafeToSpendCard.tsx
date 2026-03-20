import React, { useMemo } from 'react';
import { DailyBalance, Projection, SavingsGoal } from '../types';
import { calculateSafeToSpend, formatCurrency, formatDate } from '../utils/financialUtils';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface SafeToSpendCardProps {
  timelineData: DailyBalance[];
  projections: Projection[];
  savingsGoals: SavingsGoal[];
}

const SafeToSpendCard: React.FC<SafeToSpendCardProps> = ({ timelineData, projections, savingsGoals }) => {
  const { dailyAmount, safeAmount, daysRemaining, nextPayday } = useMemo(() => {
    return calculateSafeToSpend(timelineData, projections, savingsGoals);
  }, [timelineData, projections, savingsGoals]);

  const isWarning = dailyAmount <= 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-full -z-10 opacity-50 group-hover:scale-110 transition-transform"></div>

        <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-semibold flex items-center">
                <ShieldCheck size={16} className="mr-1.5 text-indigo-500" />
                Safe-to-Spend
            </span>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider">Daily Limit</span>
        </div>

        <div className={`text-4xl font-extrabold tracking-tight ${isWarning ? 'text-red-600' : 'text-indigo-600'}`}>
            {formatCurrency(dailyAmount)} <span className="text-lg font-medium text-slate-400">/ day</span>
        </div>

        <div className="mt-3 text-xs font-medium text-slate-500 flex flex-col space-y-1">
            {isWarning ? (
                 <span className="flex items-center text-red-500 bg-red-50 px-2 py-1 rounded-lg w-fit">
                    <AlertTriangle size={14} className="mr-1.5" />
                    No discretionary funds until payday
                 </span>
            ) : (
                <>
                    <div className="flex justify-between items-center">
                        <span>Total Available:</span>
                        <span className="font-bold text-slate-700">{formatCurrency(safeAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Next Payday:</span>
                        <span className="font-bold text-slate-700">
                            {nextPayday ? formatDate(nextPayday) : 'No Income Scheduled'}
                            {' '}({daysRemaining} {daysRemaining === 1 ? 'day' : 'days'})
                        </span>
                    </div>
                </>
            )}
        </div>
    </div>
  );
};

export default SafeToSpendCard;
