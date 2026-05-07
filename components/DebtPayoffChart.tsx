import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { PayoffSummary } from '../utils/debtUtils';
import { formatCurrency } from '../utils/financialUtils';

interface DebtPayoffChartProps {
  summary: PayoffSummary;
}

const DebtPayoffChart: React.FC<DebtPayoffChartProps> = ({ summary }) => {
  if (!summary || summary.timeline.length === 0) {
      return (
          <div className="w-full h-[400px] flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl">
              <p className="text-slate-400">Add debts to see projection.</p>
          </div>
      );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-lg font-semibold text-slate-800">Payoff Timeline</h2>
            <p className="text-sm text-slate-500">Debt Free Date: <span className="font-bold text-emerald-600">{new Date(summary.payoffDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span></p>
        </div>
        <div className="text-right">
            <p className="text-sm text-slate-500">Total Interest</p>
            <p className="text-xl font-bold text-red-500">{formatCurrency(summary.totalInterestPaid)}</p>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={summary.timeline}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
                dataKey="date"
                tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getMonth() + 1}/${d.getFullYear().toString().substring(2)}`;
                }}
                minTickGap={40}
                stroke="#94a3b8"
                fontSize={12}
            />
            <YAxis
                tickFormatter={(val) => `€€{val/1000}k`}
                stroke="#94a3b8"
                fontSize={12}
            />
            <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
            />
            <Legend verticalAlign="top" height={36} />
            <Area
                type="monotone"
                dataKey="totalBalance"
                name="Total Balance"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorBalance)"
                strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DebtPayoffChart;
