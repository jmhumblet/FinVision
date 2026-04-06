import React, { useMemo, useState } from 'react';
import { Asset, Projection } from '../types';
import { calculateLiquidAssets, calculateBaseMonthlyExpenses, formatCurrency } from '../utils/financialUtils';
import { ShieldAlert, AlertTriangle, Info, TrendingDown, Target, Activity } from 'lucide-react';

interface Props {
  currentBalance: number;
  assets: Asset[];
  projections: Projection[];
}

type ScenarioType = 'BASE' | 'MACRO_SHOCK' | 'LARGE_EXPENSE';

const EmergencyFundStressTest: React.FC<Props> = ({ currentBalance, assets, projections }) => {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('BASE');

  const TARGET_RUNWAY_MONTHS = 6;

  // Base metrics
  const baseLiquidAssets = useMemo(() => calculateLiquidAssets(currentBalance, assets), [currentBalance, assets]);
  const baseMonthlyExpenses = useMemo(() => calculateBaseMonthlyExpenses(projections), [projections]);

  // Adjust metrics based on selected scenario
  const scenarioMetrics = useMemo(() => {
    let liquidAssets = baseLiquidAssets;
    let monthlyExpenses = baseMonthlyExpenses;
    let description = '';
    let name = '';

    switch (activeScenario) {
      case 'BASE':
        name = 'Income Loss (Base)';
        description = 'Simulates a complete loss of income with current base expenses remaining steady.';
        break;
      case 'MACRO_SHOCK':
        name = 'Macro Shock';
        description = 'Simulates high inflation (+20% expenses) and market downturn (-10% liquid assets).';
        liquidAssets = baseLiquidAssets * 0.9;
        monthlyExpenses = baseMonthlyExpenses * 1.2;
        break;
      case 'LARGE_EXPENSE':
        name = 'Large Unexpected Expense';
        description = 'Simulates a sudden €5,000 expense (e.g., medical emergency, major car repair).';
        liquidAssets = Math.max(0, baseLiquidAssets - 5000);
        break;
    }

    const runwayMonths = monthlyExpenses > 0 ? liquidAssets / monthlyExpenses : 0;
    const progressPercent = Math.min(100, Math.max(0, (runwayMonths / TARGET_RUNWAY_MONTHS) * 100));

    return { liquidAssets, monthlyExpenses, runwayMonths, progressPercent, name, description };
  }, [activeScenario, baseLiquidAssets, baseMonthlyExpenses]);

  const getStatusColor = (months: number) => {
    if (months >= 6) return 'text-emerald-600';
    if (months >= 3) return 'text-amber-500';
    return 'text-red-500';
  };

  const getStatusBgColor = (months: number) => {
    if (months >= 6) return 'bg-emerald-500';
    if (months >= 3) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Emergency Fund Stress Test</h2>
            <p className="text-sm text-slate-500">Evaluate financial resilience against unexpected events</p>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Col: Scenarios */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-700 mb-3">Stress Scenarios</h3>

          <button
            onClick={() => setActiveScenario('BASE')}
            className={`w-full text-left p-4 rounded-xl border transition-all ${activeScenario === 'BASE' ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 hover:border-blue-300'}`}
          >
            <div className="flex items-center space-x-2 font-bold text-slate-800 mb-1">
              <Activity size={18} className={activeScenario === 'BASE' ? 'text-blue-600' : 'text-slate-400'} />
              <span>Income Loss (Base)</span>
            </div>
            <p className="text-xs text-slate-500">Zero income, normal base expenses.</p>
          </button>

          <button
            onClick={() => setActiveScenario('MACRO_SHOCK')}
            className={`w-full text-left p-4 rounded-xl border transition-all ${activeScenario === 'MACRO_SHOCK' ? 'border-amber-500 bg-amber-50 shadow-sm' : 'border-slate-200 hover:border-amber-300'}`}
          >
            <div className="flex items-center space-x-2 font-bold text-slate-800 mb-1">
              <TrendingDown size={18} className={activeScenario === 'MACRO_SHOCK' ? 'text-amber-600' : 'text-slate-400'} />
              <span>Macro Shock</span>
            </div>
            <p className="text-xs text-slate-500">+20% expenses, -10% liquid assets.</p>
          </button>

          <button
            onClick={() => setActiveScenario('LARGE_EXPENSE')}
            className={`w-full text-left p-4 rounded-xl border transition-all ${activeScenario === 'LARGE_EXPENSE' ? 'border-red-500 bg-red-50 shadow-sm' : 'border-slate-200 hover:border-red-300'}`}
          >
            <div className="flex items-center space-x-2 font-bold text-slate-800 mb-1">
              <AlertTriangle size={18} className={activeScenario === 'LARGE_EXPENSE' ? 'text-red-600' : 'text-slate-400'} />
              <span>Large Unexpected Expense</span>
            </div>
            <p className="text-xs text-slate-500">-€5,000 hit to liquid assets.</p>
          </button>
        </div>

        {/* Middle/Right Col: Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="font-semibold text-slate-700 mb-4">{scenarioMetrics.name} Analysis</h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Available Liquid Assets</p>
                <p className="text-xl font-bold text-slate-800">{formatCurrency(scenarioMetrics.liquidAssets)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Required Base Monthly Exp.</p>
                <p className="text-xl font-bold text-slate-800">{formatCurrency(scenarioMetrics.monthlyExpenses)}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-end justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-slate-600">Calculated Runway</p>
                  <p className={`text-3xl font-extrabold ${getStatusColor(scenarioMetrics.runwayMonths)}`}>
                    {scenarioMetrics.runwayMonths.toFixed(1)} <span className="text-lg font-semibold opacity-75">Months</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-1">Target: {TARGET_RUNWAY_MONTHS} Months</p>
                  <div className="flex items-center text-xs font-semibold text-slate-600 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                    <Target size={12} className="mr-1 text-blue-500"/>
                    {scenarioMetrics.progressPercent.toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getStatusBgColor(scenarioMetrics.runwayMonths)}`}
                  style={{ width: `${scenarioMetrics.progressPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-medium">
                <span>0</span>
                <span>3 mo</span>
                <span>6+ mo</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex space-x-3">
              <Info className="text-blue-500 flex-shrink-0" size={20} />
              <div className="text-sm text-slate-600">
                {scenarioMetrics.runwayMonths >= 6 ? (
                  <p><strong>Excellent:</strong> Your emergency fund is fully funded. You have strong resilience against this scenario.</p>
                ) : scenarioMetrics.runwayMonths >= 3 ? (
                  <p><strong>Moderate:</strong> You have a decent buffer, but should aim to increase liquid savings to reach the 6-month target for optimal security.</p>
                ) : (
                  <p><strong>Vulnerable:</strong> Your runway is critically low under this scenario. Prioritize building liquid savings (cash/high-liquidity assets) immediately.</p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmergencyFundStressTest;
