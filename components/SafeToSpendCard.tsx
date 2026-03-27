import React, { useMemo } from 'react';
import { Projection, SavingsGoal } from '../types';
import { calculateSafeToSpend, formatCurrency, formatDate } from '../utils/financialUtils';
import { ShieldCheck, Calendar, ShieldAlert, PiggyBank, Receipt } from 'lucide-react';

interface SafeToSpendCardProps {
  currentBalance: number;
  projections: Projection[];
  savingsGoals: SavingsGoal[];
}

const SafeToSpendCard: React.FC<SafeToSpendCardProps> = ({
  currentBalance,
  projections,
  savingsGoals
}) => {
  const {
    dailySafeAmount,
    safeAmountTotal,
    daysToNextPayday,
    nextPaydayStr,
    upcomingExpenses,
    savingsAllocation
  } = useMemo(() => {
    return calculateSafeToSpend(currentBalance, projections, savingsGoals);
  }, [currentBalance, projections, savingsGoals]);

  const isWarning = dailySafeAmount <= 0;

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border ${isWarning ? 'border-amber-300 shadow-amber-100' : 'border-slate-200'} hover:shadow-md transition-shadow relative overflow-hidden group`}>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center space-x-2">
          {isWarning ? (
            <div className="bg-amber-100 p-1.5 rounded-lg text-amber-600">
              <ShieldAlert size={18} />
            </div>
          ) : (
            <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
              <ShieldCheck size={18} />
            </div>
          )}
          <span className="text-slate-500 text-sm font-semibold">Safe-to-Spend (Daily)</span>
        </div>
        <span className={`${isWarning ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'} text-[10px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider`}>
          Dynamic
        </span>
      </div>

      <div className="relative z-10">
        <div className={`text-4xl font-extrabold tracking-tight ${isWarning ? 'text-amber-600' : 'text-slate-800'}`}>
          {dailySafeAmount > 0 ? formatCurrency(dailySafeAmount) : '€0'}
        </div>
        <div className="text-xs text-slate-400 mt-2 font-semibold flex items-center">
          <Calendar size={14} className="mr-1.5 opacity-70" />
          Next payday: {nextPaydayStr ? formatDate(nextPaydayStr) : 'No upcoming income'} ({daysToNextPayday} days)
        </div>
      </div>

      {/* Expanded Details (Hover or always visible at bottom) */}
      <div className="mt-6 pt-4 border-t border-slate-100 text-xs grid grid-cols-2 gap-4 relative z-10">
         <div>
           <div className="flex items-center text-slate-500 mb-1">
             <Receipt size={12} className="mr-1" /> Upcoming Bills
           </div>
           <div className="font-bold text-slate-700">{formatCurrency(upcomingExpenses)}</div>
         </div>
         <div>
           <div className="flex items-center text-slate-500 mb-1">
             <PiggyBank size={12} className="mr-1" /> Savings Allocation
           </div>
           <div className="font-bold text-slate-700">{formatCurrency(savingsAllocation)}</div>
         </div>
      </div>

      {/* Total Safe amount overlay / extra info */}
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm h-full w-1/2 flex flex-col justify-center items-end border-l border-slate-100 z-20">
         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-right mb-1">Total Safe Amount</p>
         <p className={`text-xl font-black ${isWarning ? 'text-amber-600' : 'text-slate-800'}`}>
            {formatCurrency(safeAmountTotal)}
         </p>
         <p className="text-[10px] text-slate-400 mt-1 text-right max-w-[120px]">
            Remaining after bills & savings until next payday.
         </p>
      </div>
    </div>
  );
};

export default SafeToSpendCard;
