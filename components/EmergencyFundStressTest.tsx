import React, { useMemo } from 'react';
import { Asset, Projection } from '../types';
import { calculateLiquidAssets, calculateBaseMonthlyExpenses, formatCurrency } from '../utils/financialUtils';
import { AlertTriangle, Activity, ShieldAlert, HeartPulse } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

interface EmergencyFundStressTestProps {
  assets: Asset[];
  projections: Projection[];
  currentBalance: number;
}

const EmergencyFundStressTest: React.FC<EmergencyFundStressTestProps> = ({ assets, projections, currentBalance }) => {
  const liquidAssets = useMemo(() => calculateLiquidAssets(assets, currentBalance), [assets, currentBalance]);
  const baseMonthlyExpenses = useMemo(() => calculateBaseMonthlyExpenses(projections), [projections]);

  const targetRunwayMonths = 6;
  const targetEmergencyFund = baseMonthlyExpenses * targetRunwayMonths;

  // Scenarios
  // 1. Base (Current)
  const baseRunway = baseMonthlyExpenses > 0 ? liquidAssets / baseMonthlyExpenses : 0;

  // 2. Income Loss (assumes 0 income, expenses stay the same - basically the base runway but let's highlight it)
  // Let's say Income Loss means expenses increase by 10% (COBRA health insurance, etc.)
  const incomeLossExpenses = baseMonthlyExpenses * 1.1;
  const incomeLossRunway = incomeLossExpenses > 0 ? liquidAssets / incomeLossExpenses : 0;

  // 3. Macro Shock (inflation + market crash)
  // Liquid assets drop by 20% (if invested), expenses up by 20%
  const macroShockAssets = liquidAssets * 0.8;
  const macroShockExpenses = baseMonthlyExpenses * 1.2;
  const macroShockRunway = macroShockExpenses > 0 ? macroShockAssets / macroShockExpenses : 0;

  const data = [
    { name: 'Base', runway: Number(baseRunway.toFixed(1)) },
    { name: 'Income Loss', runway: Number(incomeLossRunway.toFixed(1)) },
    { name: 'Macro Shock', runway: Number(macroShockRunway.toFixed(1)) },
  ];

  return (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
         <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                <Activity className="mr-2 text-red-500" />
                Emergency Fund Stress Test
              </h2>
              <p className="text-sm text-slate-500 mt-1">Evaluate your financial resilience against unexpected events.</p>
            </div>
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-mono border border-slate-200">
               PENDING_DESIGN_EMERGENCY_FUND_STRESS_TEST
            </span>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
               <div className="text-sm font-semibold text-slate-500 mb-1">Liquid Assets</div>
               <div className="text-2xl font-extrabold text-slate-800">{formatCurrency(liquidAssets)}</div>
               <div className="text-xs text-slate-400 mt-1">Cash & High Liquidity</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
               <div className="text-sm font-semibold text-slate-500 mb-1">Base Monthly Expenses</div>
               <div className="text-2xl font-extrabold text-slate-800">{formatCurrency(baseMonthlyExpenses)}</div>
               <div className="text-xs text-slate-400 mt-1">Recurring Fixed Costs</div>
            </div>
            <div className={`p-4 rounded-xl border ${baseRunway >= targetRunwayMonths ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
               <div className="text-sm font-semibold mb-1 flex items-center">
                 {baseRunway >= targetRunwayMonths ? <HeartPulse size={16} className="text-emerald-600 mr-1"/> : <AlertTriangle size={16} className="text-amber-600 mr-1"/>}
                 <span className={baseRunway >= targetRunwayMonths ? 'text-emerald-700' : 'text-amber-700'}>Current Runway</span>
               </div>
               <div className={`text-2xl font-extrabold ${baseRunway >= targetRunwayMonths ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {baseRunway.toFixed(1)} Months
               </div>
               <div className={`text-xs mt-1 ${baseRunway >= targetRunwayMonths ? 'text-emerald-600' : 'text-amber-600'}`}>
                  Target: {targetRunwayMonths} Months ({formatCurrency(targetEmergencyFund)})
               </div>
            </div>
         </div>

         {/* Chart */}
         <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Runway Scenarios</h3>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} label={{ value: 'Months', angle: -90, position: 'insideLeft', fill: '#64748B' }} />
                    <Tooltip cursor={{fill: '#F1F5F9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <ReferenceLine y={targetRunwayMonths} stroke="#10B981" strokeDasharray="3 3" label={{ position: 'top', value: 'Target (6m)', fill: '#10B981', fontSize: 12 }} />
                    <Bar dataKey="runway" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={60}>
                        {
                            data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.runway >= targetRunwayMonths ? '#10B981' : (entry.runway >= 3 ? '#F59E0B' : '#EF4444')} />
                            ))
                        }
                    </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Recommendations */}
         <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
             <h4 className="font-bold text-blue-800 mb-2 flex items-center">
                 <ShieldAlert size={18} className="mr-2" />
                 Actionable Recommendations
             </h4>
             <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
                {baseRunway < targetRunwayMonths && (
                    <li>You are {formatCurrency(Math.max(0, targetEmergencyFund - liquidAssets))} short of your {targetRunwayMonths}-month target. Consider setting up a Smart Savings Goal for your Emergency Fund.</li>
                )}
                {baseRunway >= targetRunwayMonths && (
                    <li>Your emergency fund is fully funded for {targetRunwayMonths} months! You might consider investing excess cash to outpace inflation.</li>
                )}
                {incomeLossRunway < 3 && (
                    <li>In a sudden income loss scenario, your runway drops to {incomeLossRunway.toFixed(1)} months. Focus on building liquid reserves.</li>
                )}
                {macroShockRunway < baseRunway && (
                    <li>A macro shock (market drop + inflation) reduces your runway significantly. Ensure your emergency fund is kept in stable, high-yield cash equivalents, not volatile investments.</li>
                )}
             </ul>
         </div>

       </div>
    </div>
  );
};

export default EmergencyFundStressTest;
