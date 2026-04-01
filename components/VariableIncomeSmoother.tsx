import React, { useState, useMemo } from 'react';
import { Transaction, Projection } from '../types';
import { calculateSmoothedIncome, calculateBaseMonthlyExpenses, calculateBufferFundTarget } from '../utils/variableIncomeUtils';
import { formatCurrency } from '../utils/financialUtils';
import { Activity, Target, ShieldAlert, Zap, TrendingDown, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface VariableIncomeSmootherProps {
    transactions: Transaction[];
    projections: Projection[];
}

const VariableIncomeSmoother: React.FC<VariableIncomeSmootherProps> = ({ transactions, projections }) => {
    // Toggles for scenario modifiers
    const [clientDropActive, setClientDropActive] = useState(false);
    const [stretchGoalActive, setStretchGoalActive] = useState(false);
    const [modifierValue, setModifierValue] = useState(0.9); // Default to 90% (conservative)

    const baseExpenses = useMemo(() => calculateBaseMonthlyExpenses(projections), [projections]);
    const bufferTarget = useMemo(() => calculateBufferFundTarget(baseExpenses, 3), [baseExpenses]);

    const { smoothedIncome, averageIncome, monthlyData } = useMemo(() => {
        let appliedModifier = modifierValue;
        if (clientDropActive) appliedModifier *= 0.8; // e.g., 20% drop
        if (stretchGoalActive) appliedModifier *= 1.2; // e.g., 20% increase

        return calculateSmoothedIncome(transactions, appliedModifier);
    }, [transactions, modifierValue, clientDropActive, stretchGoalActive]);

    const chartData = useMemo(() => {
        return monthlyData.map(d => ({
            name: d.month,
            Income: d.income
        }));
    }, [monthlyData]);

    const monthlySurplus = smoothedIncome - baseExpenses;
    const isDeficit = monthlySurplus < 0;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                        <Activity className="w-6 h-6 mr-2 text-blue-600" />
                        Variable Income Smoother
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Predictive modeling for non-traditional earners to stabilize cash flow.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="text-slate-500 text-sm font-semibold mb-2 flex items-center">
                        <Activity size={16} className="mr-1.5" />
                        Avg Historical Income
                    </div>
                    <div className="text-3xl font-extrabold text-slate-800">
                        {formatCurrency(averageIncome)}
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                        Based on past {monthlyData.length} months
                    </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-200">
                    <div className="text-blue-700 text-sm font-semibold mb-2 flex items-center">
                        <ShieldAlert size={16} className="mr-1.5" />
                        Smoothed Baseline
                    </div>
                    <div className="text-3xl font-extrabold text-blue-800">
                        {formatCurrency(smoothedIncome)}
                    </div>
                    <div className="text-xs text-blue-600 mt-2">
                        Conservative estimate
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="text-slate-500 text-sm font-semibold mb-2 flex items-center">
                        <Target size={16} className="mr-1.5" />
                        Base Monthly Expenses
                    </div>
                    <div className="text-3xl font-extrabold text-slate-800">
                        {formatCurrency(baseExpenses)}
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                        From active projections
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="text-slate-500 text-sm font-semibold mb-2 flex items-center">
                        <Zap size={16} className="mr-1.5 text-amber-500" />
                        Buffer Fund Target
                    </div>
                    <div className="text-3xl font-extrabold text-slate-800">
                        {formatCurrency(bufferTarget)}
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                        3x Base Expenses
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Historical vs Smoothed Income</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <YAxis hide />
                                <RechartsTooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Bar dataKey="Income" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                {chartData.length > 0 && (
                                    <ReferenceLine y={smoothedIncome} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Smoothed Baseline', fill: '#ef4444', fontSize: 12 }} />
                                )}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    {chartData.length === 0 && (
                        <div className="flex items-center justify-center h-full w-full text-slate-400 text-sm mt-[-100px]">
                            Not enough historical income data.
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Stress Tests & Scenarios</h3>

                    <div className="flex-1 space-y-4">
                        <label className="flex items-start space-x-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                            <input
                                type="checkbox"
                                className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                checked={clientDropActive}
                                onChange={(e) => setClientDropActive(e.target.checked)}
                            />
                            <div>
                                <div className="font-semibold text-sm text-slate-700 flex items-center">
                                    <TrendingDown size={14} className="mr-1 text-red-500" />
                                    Major Client Drops
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">Simulate a 20% reduction in overall income</div>
                            </div>
                        </label>

                        <label className="flex items-start space-x-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                            <input
                                type="checkbox"
                                className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                checked={stretchGoalActive}
                                onChange={(e) => setStretchGoalActive(e.target.checked)}
                            />
                            <div>
                                <div className="font-semibold text-sm text-slate-700 flex items-center">
                                    <TrendingUp size={14} className="mr-1 text-emerald-500" />
                                    Hit Stretch Goal
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">Simulate a 20% increase in overall income</div>
                            </div>
                        </label>
                    </div>

                    <div className={`mt-6 p-4 rounded-xl border ${isDeficit ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                        <div className="text-sm font-semibold mb-1 flex items-center">
                            {isDeficit ? (
                                <><ShieldAlert size={16} className="mr-1.5 text-red-500" /><span className="text-red-700">Warning: Deficit</span></>
                            ) : (
                                <><Activity size={16} className="mr-1.5 text-emerald-500" /><span className="text-emerald-700">Healthy Surplus</span></>
                            )}
                        </div>
                        <div className={`text-2xl font-bold ${isDeficit ? 'text-red-800' : 'text-emerald-800'}`}>
                            {formatCurrency(monthlySurplus)} <span className="text-sm font-normal">/ month</span>
                        </div>
                        <div className={`text-xs mt-1 ${isDeficit ? 'text-red-600' : 'text-emerald-600'}`}>
                            {isDeficit ? "Smoothed income doesn't cover base expenses." : "Smoothed income covers base expenses comfortably."}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VariableIncomeSmoother;
