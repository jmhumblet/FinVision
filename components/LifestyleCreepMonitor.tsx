import React, { useMemo } from 'react';
import { Transaction, TransactionType, Category } from '../types';
import { formatCurrency, getMonthKey } from '../utils/financialUtils';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface LifestyleCreepMonitorProps {
  transactions: Transaction[];
  categories: Category[];
}

const LifestyleCreepMonitor: React.FC<LifestyleCreepMonitorProps> = ({ transactions, categories }) => {
  // Define default discretionary category IDs if they exist.
  // In a real app, this might be user-configurable, but we assume
  // categories that aren't strictly essential (like Rent, Utilities, Groceries, Health, Transport).
  const discretionaryNames = ['Entertainment', 'Other', 'Shopping', 'Dining Out', 'Hobbies'];

  const discretionaryCategoryIds = useMemo(() => {
      return categories
        .filter(c => discretionaryNames.some(name => c.name.toLowerCase().includes(name.toLowerCase())))
        .map(c => c.id);
  }, [categories]);

  // If no matching names found, fallback to just 'Entertainment' and 'Other' typical IDs ('5', '8')
  const activeDiscretionaryIds = discretionaryCategoryIds.length > 0
      ? discretionaryCategoryIds
      : ['5', '8'];

  const chartData = useMemo(() => {
    const monthlyData = new Map<string, { income: number, discretionary: number }>();

    transactions.forEach(tx => {
      const monthStr = getMonthKey(new Date(tx.date));
      if (!monthlyData.has(monthStr)) {
        monthlyData.set(monthStr, { income: 0, discretionary: 0 });
      }

      const current = monthlyData.get(monthStr)!;

      if (tx.type === TransactionType.INCOME) {
        current.income += tx.amount;
      } else if (tx.type === TransactionType.EXPENSE && activeDiscretionaryIds.includes(tx.categoryId)) {
        current.discretionary += tx.amount;
      }
    });

    // Convert map to sorted array
    const sortedKeys = Array.from(monthlyData.keys()).sort();
    return sortedKeys.map(key => ({
      month: key,
      income: monthlyData.get(key)!.income,
      discretionary: monthlyData.get(key)!.discretionary
    }));
  }, [transactions, activeDiscretionaryIds]);

  // Calculate trends between the first month and the last month
  const analysis = useMemo(() => {
    if (chartData.length < 2) return null;

    const firstMonth = chartData[0];
    const lastMonth = chartData[chartData.length - 1];

    const incomeGrowth = firstMonth.income > 0
        ? ((lastMonth.income - firstMonth.income) / firstMonth.income) * 100
        : 0;

    const discretionaryGrowth = firstMonth.discretionary > 0
        ? ((lastMonth.discretionary - firstMonth.discretionary) / firstMonth.discretionary) * 100
        : 0;

    const creepDetected = discretionaryGrowth > incomeGrowth;
    const creepSeverity = creepDetected ? discretionaryGrowth - incomeGrowth : 0;

    return {
      incomeGrowth,
      discretionaryGrowth,
      creepDetected,
      creepSeverity,
      firstMonthLabel: firstMonth.month,
      lastMonthLabel: lastMonth.month
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm z-50">
          <p className="font-bold text-slate-700 mb-2">{label}</p>
          {payload.map((entry: any, idx: number) => (
             <div key={idx} className="flex items-center justify-between space-x-4 mb-1">
                <span className="text-slate-500 capitalize">{entry.name}:</span>
                <span className="font-semibold text-slate-700">
                  {formatCurrency(entry.value)}
                </span>
             </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row items-center md:justify-between mb-2">
         <div className="flex items-center space-x-3">
             <div className="bg-fuchsia-100 p-2 rounded-xl text-fuchsia-600">
               <Activity size={24} />
             </div>
             <div>
               <h2 className="text-2xl font-bold text-slate-800">Lifestyle Creep Monitor</h2>
               <p className="text-slate-500 text-sm">Track income growth vs. discretionary spending over time.</p>
             </div>
         </div>
      </div>

      {!analysis ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center text-slate-500">
            <Activity size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-600">Not Enough Data</h3>
            <p className="text-sm mt-2">We need at least two months of historical transaction data to analyze lifestyle creep.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-2xl shadow-sm border ${analysis.creepDetected ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
               <div className="flex items-start justify-between">
                  <div>
                      <h3 className={`font-bold ${analysis.creepDetected ? 'text-red-800' : 'text-emerald-800'}`}>
                          {analysis.creepDetected ? 'Lifestyle Creep Detected' : 'Healthy Spending Patterns'}
                      </h3>
                      <p className={`text-sm mt-1 ${analysis.creepDetected ? 'text-red-600' : 'text-emerald-600'}`}>
                          {analysis.creepDetected
                              ? `Your discretionary spending is growing faster than your income (${analysis.creepSeverity.toFixed(1)}% variance).`
                              : "Your discretionary spending growth is well within your income growth rate."}
                      </p>
                  </div>
                  {analysis.creepDetected ? <AlertCircle className="text-red-500" size={32} /> : <ShieldCheck className="text-emerald-500" size={32} />}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                   <p className="text-xs font-bold text-slate-500 uppercase">Income Growth</p>
                   <div className="flex items-center mt-2">
                       {analysis.incomeGrowth >= 0 ? <TrendingUp size={20} className="text-emerald-500 mr-2" /> : <TrendingDown size={20} className="text-red-500 mr-2" />}
                       <span className={`text-2xl font-extrabold ${analysis.incomeGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                           {analysis.incomeGrowth > 0 ? '+' : ''}{analysis.incomeGrowth.toFixed(1)}%
                       </span>
                   </div>
                   <p className="text-[10px] text-slate-400 mt-1">{analysis.firstMonthLabel} vs {analysis.lastMonthLabel}</p>
               </div>

               <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                   <p className="text-xs font-bold text-slate-500 uppercase">Discretionary Growth</p>
                   <div className="flex items-center mt-2">
                       {analysis.discretionaryGrowth >= 0 ? <TrendingUp size={20} className="text-fuchsia-500 mr-2" /> : <TrendingDown size={20} className="text-emerald-500 mr-2" />}
                       <span className={`text-2xl font-extrabold ${analysis.discretionaryGrowth >= 0 ? 'text-fuchsia-600' : 'text-emerald-600'}`}>
                           {analysis.discretionaryGrowth > 0 ? '+' : ''}{analysis.discretionaryGrowth.toFixed(1)}%
                       </span>
                   </div>
                   <p className="text-[10px] text-slate-400 mt-1">{analysis.firstMonthLabel} vs {analysis.lastMonthLabel}</p>
               </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[400px]">
             <h3 className="text-lg font-bold text-slate-800 mb-6">Income vs. Discretionary Spending Trend</h3>
             <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                 <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    fontSize={12}
                 />
                 <YAxis
                    yAxisId="left"
                    tickFormatter={(val) => `€${val/1000}k`}
                    stroke="#94a3b8"
                    fontSize={12}
                 />
                 <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(val) => `€${val}`}
                    stroke="#94a3b8"
                    fontSize={12}
                 />
                 <Tooltip content={<CustomTooltip />} />
                 <Legend verticalAlign="top" height={36} />

                 <Bar
                    yAxisId="left"
                    dataKey="income"
                    name="Total Income"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                 />
                 <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="discretionary"
                    name="Discretionary Spending"
                    stroke="#d946ef"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                 />
               </ComposedChart>
             </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h3 className="text-md font-bold text-slate-800 mb-3">What is this telling me?</h3>
             <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                <li><strong className="text-slate-800">Total Income:</strong> This includes all transactions marked as 'Income' within each calendar month.</li>
                <li><strong className="text-slate-800">Discretionary Spending:</strong> This includes expenses in non-essential categories (like Entertainment or Other). If this line climbs faster than your income bars, it indicates lifestyle inflation.</li>
                <li><strong className="text-slate-800">Recommendation:</strong> If you receive a raise or a bonus, consider directing a percentage of it immediately towards savings goals rather than increasing discretionary budgets to combat creep.</li>
             </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default LifestyleCreepMonitor;
