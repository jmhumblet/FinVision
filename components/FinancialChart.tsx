import React from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { DailyBalance, Scenario } from '../types';
import { formatCurrency, formatDate } from '../utils/financialUtils';

interface FinancialChartProps {
  data: DailyBalance[];
  scenarios?: Scenario[];
}

const FinancialChart: React.FC<FinancialChartProps> = ({ data, scenarios = [] }) => {
  const today = new Date().toISOString().split('T')[0];
  const activeScenarios = scenarios.filter(s => s.isActive);

  // Filter data to only show last 30 days of history + Future
  const filteredData = React.useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    // Ensure we don't have gaps that Recharts might struggle with
    return data.filter(d => new Date(d.date) >= thirtyDaysAgo);
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm z-50">
          <p className="font-bold text-slate-700 mb-2">{formatDate(label)}</p>
          {payload.map((entry: any, idx: number) => (
             <div key={idx} className="flex items-center space-x-2 mb-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span className="text-slate-500 capitalize">{entry.name}:</span>
                <span className={`font-semibold ${entry.value >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
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
    <div className="w-full h-[450px] bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Cash Flow Projection & Scenarios</h2>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={filteredData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 20,
          }}
        >
          <defs>
            <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
               <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
               <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(str) => {
              const d = new Date(str);
              return `${d.getDate()}/${d.getMonth() + 1}`;
            }}
            minTickGap={30}
            stroke="#94a3b8"
            fontSize={12}
          />
          <YAxis 
            tickFormatter={(val) => `€${val}`} 
            stroke="#94a3b8"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} iconType="circle" />
          <ReferenceLine x={today} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Today', fill: '#94a3b8', fontSize: 10 }} />
          
          {/* Historical Area */}
          <Area
            type="monotone"
            dataKey="historicalBalance"
            name="History"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorHistorical)"
            connectNulls={true}
          />

          {/* Base Projected Area */}
          <Area
            type="monotone"
            dataKey="projectedBalance"
            name="Projected (Base)"
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="5 5"
            fillOpacity={1}
            fill="url(#colorProjected)"
            connectNulls={true}
          />

          {/* Render Dynamic Scenario Lines */}
          {activeScenarios.map((scenario) => (
             <Line
                key={scenario.id}
                type="monotone"
                dataKey={`scenario_${scenario.id}`}
                name={scenario.name}
                stroke={scenario.color}
                strokeWidth={3}
                dot={false}
                strokeDasharray="3 3"
                connectNulls={true}
                animationDuration={300}
             />
          ))}

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinancialChart;