import React from 'react';
import { DebtStrategy } from '../types';
import { Snowflake, Mountain } from 'lucide-react';

interface DebtStrategyToggleProps {
  strategy: DebtStrategy;
  onChange: (s: DebtStrategy) => void;
  monthlyExtra: number;
  onMonthlyExtraChange: (val: number) => void;
}

const DebtStrategyToggle: React.FC<DebtStrategyToggleProps> = ({
  strategy,
  onChange,
  monthlyExtra,
  onMonthlyExtraChange
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Payoff Strategy</h2>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
        <button
          onClick={() => onChange(DebtStrategy.SNOWBALL)}
          className={`flex-1 flex items-center p-4 rounded-xl border-2 transition-all €{
            strategy === DebtStrategy.SNOWBALL
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-slate-200 hover:border-blue-200 text-slate-600'
          }`}
        >
          <div className={`p-3 rounded-full mr-4 €{strategy === DebtStrategy.SNOWBALL ? 'bg-blue-100' : 'bg-slate-100'}`}>
            <Snowflake size={24} className={strategy === DebtStrategy.SNOWBALL ? 'text-blue-600' : 'text-slate-500'} />
          </div>
          <div className="text-left">
            <h3 className="font-bold">Snowball Method</h3>
            <p className="text-xs mt-1 opacity-80">Pay smallest balance first. Builds momentum quickly.</p>
          </div>
        </button>

        <button
          onClick={() => onChange(DebtStrategy.AVALANCHE)}
          className={`flex-1 flex items-center p-4 rounded-xl border-2 transition-all €{
            strategy === DebtStrategy.AVALANCHE
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
              : 'border-slate-200 hover:border-emerald-200 text-slate-600'
          }`}
        >
          <div className={`p-3 rounded-full mr-4 €{strategy === DebtStrategy.AVALANCHE ? 'bg-emerald-100' : 'bg-slate-100'}`}>
            <Mountain size={24} className={strategy === DebtStrategy.AVALANCHE ? 'text-emerald-600' : 'text-slate-500'} />
          </div>
          <div className="text-left">
            <h3 className="font-bold">Avalanche Method</h3>
            <p className="text-xs mt-1 opacity-80">Pay highest interest first. Saves the most money.</p>
          </div>
        </button>
      </div>

      <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
         <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Extra Monthly Payment</label>
            <p className="text-xs text-slate-500">Amount you can pay *above* minimums</p>
         </div>
         <div className="relative w-32">
            <span className="absolute left-3 top-2.5 text-slate-500 font-bold">€</span>
            <input
              type="number"
              value={monthlyExtra}
              onChange={(e) => onMonthlyExtraChange(parseFloat(e.target.value) || 0)}
              className="w-full pl-6 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-slate-800"
            />
         </div>
      </div>
    </div>
  );
};

export default DebtStrategyToggle;
