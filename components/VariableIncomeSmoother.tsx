import React, { useMemo, useState } from 'react';
import { Transaction, Projection } from '../types';
import { analyzeHistoricalIncome, calculateBaseExpenses, suggestBufferFund } from '../utils/variableIncomeUtils';
import { formatCurrency } from '../utils/financialUtils';
import {
    Activity,
    TrendingDown,
    TrendingUp,
    ShieldAlert,
    ShieldCheck,
    Info
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    ReferenceLine,
    Legend
} from 'recharts';

interface VariableIncomeSmootherProps {
    transactions: Transaction[];
    projections: Projection[];
    currentBalance: number;
}

const VariableIncomeSmoother: React.FC<VariableIncomeSmootherProps> = ({ transactions, projections, currentBalance }) => {
    const [monthsToAnalyze, setMonthsToAnalyze] = useState(6);

    const {
        averageIncome,
        minIncome,
        maxIncome,
        smoothedBaseline,
        monthlyData
    } = useMemo(() => analyzeHistoricalIncome(transactions, monthsToAnalyze), [transactions, monthsToAnalyze]);

    const baseExpenses = useMemo(() => calculateBaseExpenses(projections), [projections]);
    const bufferFundTarget = useMemo(() => suggestBufferFund(baseExpenses, smoothedBaseline, minIncome), [baseExpenses, smoothedBaseline, minIncome]);

    const bufferStatus = currentBalance >= bufferFundTarget;
    const isIncomeSufficient = smoothedBaseline >= baseExpenses;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm z-50">
                    <p className="font-bold text-slate-700 mb-2">{label}</p>
                    {payload.map((entry: any, idx: number) => (
                        <div key={idx} className="flex items-center space-x-2 mb-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                            <span className="text-slate-500 capitalize">{entry.name}:</span>
                            <span className="font-semibold text-emerald-600">
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                        <Activity className="mr-2 text-blue-600" />
                        Variable Income Smoother
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Stabilize your variable cash flow by establishing a conservative baseline and building a buffer.
                    </p>
                </div>
                <div className="flex items-center text-sm text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                    <span className="mr-2 font-medium">Analyze Last:</span>
                    <select
                        value={monthsToAnalyze}
                        onChange={(e) => setMonthsToAnalyze(Number(e.target.value))}
                        className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
                    >
                        <option value={3}>3 Months</option>
                        <option value={6}>6 Months</option>
                        <option value={12}>12 Months</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-500 text-sm font-semibold">Average Income</span>
                        <TrendingUp size={16} className="text-slate-400" />
                    </div>
                    <div className="text-3xl font-extrabold text-slate-800 tracking-tight">
                        {formatCurrency(averageIncome)}
                    </div>
                    <div className="text-xs text-slate-400 mt-2 font-medium flex justify-between">
                        <span>Min: {formatCurrency(minIncome)}</span>
                        <span>Max: {formatCurrency(maxIncome)}</span>
                    </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-blue-700 text-sm font-semibold flex items-center">
                            Smoothed Baseline
                            <div className="group relative ml-2">
                                <Info size={14} className="text-blue-400 cursor-pointer" />
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                                    Conservative estimate (85% of average) to use for safe planning.
                                </div>
                            </div>
                        </span>
                    </div>
                    <div className={`text-3xl font-extrabold tracking-tight ${isIncomeSufficient ? 'text-blue-700' : 'text-amber-600'}`}>
                        {formatCurrency(smoothedBaseline)}
                    </div>
                    <div className="text-xs text-blue-600/70 mt-2 font-medium">
                        Monthly Base Expenses: {formatCurrency(baseExpenses)}
                    </div>
                </div>

                <div className={`p-6 rounded-2xl shadow-sm border ${bufferStatus ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <span className={`text-sm font-semibold ${bufferStatus ? 'text-emerald-700' : 'text-amber-700'}`}>
                            Buffer Fund Target
                        </span>
                        {bufferStatus ? (
                            <ShieldCheck size={20} className="text-emerald-500" />
                        ) : (
                            <ShieldAlert size={20} className="text-amber-500" />
                        )}
                    </div>
                    <div className={`text-3xl font-extrabold tracking-tight ${bufferStatus ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {formatCurrency(bufferFundTarget)}
                    </div>
                    <div className={`text-xs mt-2 font-medium ${bufferStatus ? 'text-emerald-600/70' : 'text-amber-600/70'}`}>
                        Current Balance: {formatCurrency(currentBalance)}
                        {!bufferStatus && currentBalance > 0 && ` (${Math.round((currentBalance / bufferFundTarget) * 100)}% funded)`}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[400px]">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Income History vs. Baseline</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                        <YAxis tickFormatter={(val) => `€${val}`} stroke="#94a3b8" fontSize={12} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="top" height={36} />
                        <ReferenceLine
                            y={smoothedBaseline}
                            stroke="#3b82f6"
                            strokeDasharray="5 5"
                            label={{ position: 'top', value: 'Smoothed Baseline', fill: '#3b82f6', fontSize: 12 }}
                        />
                        <ReferenceLine
                            y={baseExpenses}
                            stroke="#ef4444"
                            strokeDasharray="3 3"
                            label={{ position: 'bottom', value: 'Base Expenses', fill: '#ef4444', fontSize: 12 }}
                        />
                        <Bar dataKey="amount" name="Actual Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {!bufferStatus && bufferFundTarget > 0 && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start space-x-3">
                    <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={20} />
                    <div>
                        <h4 className="text-sm font-bold text-amber-800">Buffer Fund Recommended</h4>
                        <p className="text-xs text-amber-700 mt-1">
                            Your current balance is below the recommended buffer target of {formatCurrency(bufferFundTarget)}.
                            This target is calculated to cover 3 months of potential shortfall if your income drops to its historical minimum ({formatCurrency(minIncome)}) against your base expenses ({formatCurrency(baseExpenses)}).
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VariableIncomeSmoother;
