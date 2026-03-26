import React, { useMemo } from 'react';
import { Projection } from '../types';
import { calculateSafeToSpend, formatCurrency } from '../utils/financialUtils';
import { ShieldCheck, ShieldAlert, Calendar } from 'lucide-react';

interface SafeToSpendCardProps {
  currentBalance: number;
  projections: Projection[];
}

const SafeToSpendCard: React.FC<SafeToSpendCardProps> = ({ currentBalance, projections }) => {
  const { dailySafeToSpend, remainingBalance, nextPayday, daysRemaining } = useMemo(() => {
    return calculateSafeToSpend(currentBalance, projections);
  }, [currentBalance, projections]);

  const isPositive = dailySafeToSpend > 0;
  const isDanger = remainingBalance < 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-500 text-sm font-semibold">"Safe-to-Spend" Daily Metric</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {isPositive ? 'Safe' : 'Warning'}
        </span>
      </div>

      <div>
        <div className={`text-4xl font-extrabold tracking-tight ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
          {formatCurrency(dailySafeToSpend)}
          <span className="text-sm text-slate-400 font-medium tracking-normal ml-1">/ day</span>
        </div>

        <div className="mt-3 text-xs font-semibold flex flex-col space-y-1">
          {isDanger ? (
            <span className="flex items-center text-red-500 bg-red-50 px-2 py-1 rounded-lg w-fit">
                <ShieldAlert size={14} className="mr-1.5" />
                Deficit of {formatCurrency(Math.abs(remainingBalance))} before next payday
            </span>
          ) : (
             <span className="flex items-center text-slate-500 bg-slate-50 px-2 py-1 rounded-lg w-fit">
                <ShieldCheck size={14} className="mr-1.5 text-emerald-500" />
                {formatCurrency(remainingBalance)} remaining for {daysRemaining} days
             </span>
          )}

          <span className="flex items-center text-slate-500 bg-slate-50 px-2 py-1 rounded-lg w-fit">
            <Calendar size={14} className="mr-1.5 text-blue-500" />
            Next payday: {nextPayday ? nextPayday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Unknown (using 30-day default)'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SafeToSpendCard;
