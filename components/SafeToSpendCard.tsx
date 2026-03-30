import React from 'react';
import { calculateSafeToSpend, formatCurrency } from '../utils/financialUtils';
import { Projection } from '../types';
import { ShieldCheck, ShieldAlert, Zap } from 'lucide-react';

interface SafeToSpendCardProps {
  currentBalance: number;
  projections: Projection[];
}

const SafeToSpendCard: React.FC<SafeToSpendCardProps> = ({ currentBalance, projections }) => {
  const { safeToSpend, nextPayday, daysUntil } = calculateSafeToSpend(currentBalance, projections);

  const isHealthy = safeToSpend > 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full opacity-50 pointer-events-none group-hover:scale-110 transition-transform"></div>

        <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-semibold flex items-center">
                <Zap size={16} className="mr-1.5 text-amber-500" />
                "Safe-to-Spend"
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider flex items-center ${isHealthy ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {isHealthy ? <ShieldCheck size={12} className="mr-1" /> : <ShieldAlert size={12} className="mr-1" />}
                Daily Limit
            </span>
        </div>

        <div className="flex flex-col">
            <div className={`text-4xl font-extrabold tracking-tight ${isHealthy ? 'text-slate-800' : 'text-red-600'}`}>
                {formatCurrency(safeToSpend)}
            </div>

            <div className="text-xs mt-2 font-medium text-slate-500 flex flex-col space-y-1">
                {isHealthy ? (
                    <p>
                        You can safely spend this amount <span className="font-bold text-slate-700">every day</span>.
                    </p>
                ) : (
                    <p className="text-red-500 font-semibold">
                        Limit reached. Avoid discretionary spending.
                    </p>
                )}

                <p className="text-[10px] text-slate-400">
                    Next payday: {nextPayday ? nextPayday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'N/A'}
                    <span className="ml-1 opacity-75">({daysUntil} {daysUntil === 1 ? 'day' : 'days'})</span>
                </p>
            </div>
        </div>
    </div>
  );
};

export default SafeToSpendCard;
