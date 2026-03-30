import React from 'react';
import { ShieldCheck, Info, ArrowRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/financialUtils';

interface SafeToSpendCardProps {
  safeToSpend: number;
  dailySafeToSpend: number;
  nextPayday: string | null;
  obligations: number;
}

const SafeToSpendCard: React.FC<SafeToSpendCardProps> = ({
  safeToSpend,
  dailySafeToSpend,
  nextPayday,
  obligations
}) => {
  const isDanger = dailySafeToSpend <= 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center">
          <ShieldCheck className="w-4 h-4 mr-2 text-emerald-500" />
          Safe-to-Spend
        </h3>
        <div className="group relative">
          <Info className="w-4 h-4 text-slate-400 cursor-help" />
          <div className="absolute right-0 top-6 w-64 bg-slate-800 text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            Calculated by subtracting {formatCurrency(obligations)} in upcoming bills and savings goals from your current balance, divided by days until your next projected income.
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-end space-x-2">
          <span className={`text-4xl font-bold ${isDanger ? 'text-red-600' : 'text-slate-800'}`}>
            {formatCurrency(dailySafeToSpend)}
          </span>
          <span className="text-slate-500 pb-1 font-medium">/ day</span>
        </div>

        <div className="mt-2 text-sm text-slate-600 font-medium">
          Total Available: {formatCurrency(safeToSpend)}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center text-xs text-slate-500">
          <span className="flex items-center">
            Next payday:
            <strong className="ml-1 text-slate-700">
              {nextPayday ? formatDate(nextPayday) : 'N/A'}
            </strong>
          </span>
          {nextPayday && (
            <ArrowRight className="w-3 h-3 mx-2 text-slate-300" />
          )}
        </div>
      </div>
    </div>
  );
};

export default SafeToSpendCard;
