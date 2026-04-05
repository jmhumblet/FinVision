import React, { useMemo, useState } from 'react';
import { Transaction, Category } from '../types';
import { calculateMonthlyIncomeAndDiscretionary, detectLifestyleCreep } from '../utils/financialUtils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, AlertCircle, ShieldCheck, Activity } from 'lucide-react';

interface LifestyleCreepMonitorProps {
  transactions: Transaction[];
  categories: Category[];
}

const LifestyleCreepMonitor: React.FC<LifestyleCreepMonitorProps> = ({ transactions, categories }) => {
  const [monthsToAnalyze, setMonthsToAnalyze] = useState<number>(6);

  const monthlyData = useMemo(() => {
    return calculateMonthlyIncomeAndDiscretionary(transactions, categories);
  }, [transactions, categories]);

  const { hasCreep, incomeGrowth, discretionaryGrowth, insights } = useMemo(() => {
    return detectLifestyleCreep(monthlyData, monthsToAnalyze);
  }, [monthlyData, monthsToAnalyze]);

  const chartData = useMemo(() => {
    return monthlyData.slice(-monthsToAnalyze).map(d => ({
      month: d.month,
      Income: d.income,
      'Discretionary Spending': d.discretionary,
      'Savings Rate': d.savingsRate
    }));
  }, [monthlyData, monthsToAnalyze]);

  // Identify top categories driving discretionary spending in the last month vs first month of period
  const creepDrivers = useMemo(() => {
    if (monthlyData.length < 2) return [];
    const dataToAnalyze = monthlyData.slice(-monthsToAnalyze);
    if (dataToAnalyze.length < 2) return [];

    const first = dataToAnalyze[0].categoryBreakdown;
    const last = dataToAnalyze[dataToAnalyze.length - 1].categoryBreakdown;

    const drivers = [];
    for (const cat in last) {
      const firstVal = first[cat] || 0;
      const lastVal = last[cat];
      const increase = lastVal - firstVal;
      if (increase > 0) {
        drivers.push({ name: cat, increase });
      }
    }

    return drivers.sort((a, b) => b.increase - a.increase).slice(0, 3);
  }, [monthlyData, monthsToAnalyze]);

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row items-center md:justify-between">
        <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
          <div className="flex items-center space-x-3 mb-2">
            <Activity size={32} className="text-fuchsia-500" />
            <h2 className="text-2xl font-bold text-slate-800">Lifestyle Creep Monitor</h2>
          </div>
          <p className="text-slate-500 max-w-md text-center md:text-left">
            Tracks the correlation between your income growth and discretionary spending over time.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-semibold text-slate-600">Analyze last:</label>
          <select
            value={monthsToAnalyze}
            onChange={(e) => setMonthsToAnalyze(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
          >
            <option value={3}>3 Months</option>
            <option value={6}>6 Months</option>
            <option value={12}>12 Months</option>
          </select>
        </div>
      </div>

      {monthlyData.length < 2 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">Not enough data</h3>
          <p>We need at least two months of transaction history to analyze lifestyle creep.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Income vs Discretionary Spending</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} tickFormatter={(val) => `€${val}`} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={10} tickFormatter={(val) => `${val}%`} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number, name: string) => [name === 'Savings Rate' ? `${value.toFixed(1)}%` : `€${value.toFixed(2)}`, name]}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      <Line yAxisId="left" type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      <Line yAxisId="left" type="monotone" dataKey="Discretionary Spending" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      <Line yAxisId="right" type="monotone" dataKey="Savings Rate" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
             </div>

             {/* Drivers */}
             {creepDrivers.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Top Drivers of Spending Increase</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {creepDrivers.map((driver, idx) => (
                      <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{driver.name}</span>
                        <span className="text-lg font-extrabold text-red-500">+€{driver.increase.toFixed(0)}</span>
                        <span className="text-xs text-slate-400 mt-1">in selected period</span>
                      </div>
                    ))}
                  </div>
                </div>
             )}
          </div>

          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border ${hasCreep ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
               <div className="flex items-center space-x-3 mb-4">
                 {hasCreep ? <AlertCircle size={28} className="text-red-500" /> : <ShieldCheck size={28} className="text-emerald-500" />}
                 <h3 className={`text-xl font-bold ${hasCreep ? 'text-red-800' : 'text-emerald-800'}`}>
                   {hasCreep ? 'Creep Detected' : 'Healthy Growth'}
                 </h3>
               </div>
               <div className="space-y-4">
                 {insights.map((insight, idx) => (
                   <p key={idx} className={`text-sm ${hasCreep ? 'text-red-700' : 'text-emerald-700'}`}>
                     {insight}
                   </p>
                 ))}
               </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Growth Summary</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Income Growth</span>
                    <span className={`font-bold ${incomeGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {incomeGrowth > 0 ? '+' : ''}{incomeGrowth.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Discretionary Growth</span>
                    <span className={`font-bold ${discretionaryGrowth > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {discretionaryGrowth > 0 ? '+' : ''}{discretionaryGrowth.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LifestyleCreepMonitor;