import React, { useMemo } from 'react';
import { Projection, SavingsGoal } from '../types';
import { calculateSafeToSpend, formatCurrency } from '../utils/financialUtils';
import { ShieldCheck, Info } from 'lucide-react';

interface SafeToSpendCardProps {
  currentBalance: number;
  projections: Projection[];
  savingsGoals: SavingsGoal[];
  daysUntilNextPayday: number;
}

const SafeToSpendCard: React.FC<SafeToSpendCardProps> = ({
  currentBalance,
  projections,
  savingsGoals,
  daysUntilNextPayday
}) => {
  const safeToSpend = useMemo(() => {
    return calculateSafeToSpend(currentBalance, projections, savingsGoals, daysUntilNextPayday);
  }, [currentBalance, projections, savingsGoals, daysUntilNextPayday]);

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-md border border-indigo-400/30 text-white relative overflow-hidden h-full flex flex-col justify-between">
      {/* Background Decorative Element */}
      <div className="absolute -right-6 -top-6 text-white/10">
        <ShieldCheck size={120} />
      </div>

      <div className="relative z-10 flex items-center justify-between mb-2">
        <span className="text-indigo-100 text-sm font-semibold flex items-center">
          <ShieldCheck size={16} className="mr-1.5" />
          "Safe-to-Spend" Daily
        </span>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center my-2">
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-extrabold tracking-tight">
            {formatCurrency(safeToSpend)}
          </span>
          <span className="text-indigo-200 text-sm font-medium">/ day</span>
        </div>
      </div>

      <div className="relative z-10 mt-2 flex items-start text-xs text-indigo-100 bg-black/10 p-2.5 rounded-lg backdrop-blur-sm">
        <Info size={14} className="mr-2 mt-0.5 flex-shrink-0" />
        <p>
          Calculated by reserving funds for upcoming bills and monthly savings goals over the next {daysUntilNextPayday} days.
        </p>
      </div>
    </div>
  );
};

export default SafeToSpendCard;
