import React, { useState, useMemo } from 'react';
import { Asset, AssetType, Debt, DailyBalance } from '../types';
import { formatCurrency, formatDate } from '../utils/financialUtils';
import {
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  Wallet,
  Home,
  Car,
  PieChart,
  Save,
  X,
  CreditCard
} from 'lucide-react';
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { v4 as uuidv4 } from 'uuid';

interface NetWorthDashboardProps {
  assets: Asset[];
  debts: Debt[];
  currentBalance: number;
  timelineData: DailyBalance[];
  onAddAsset: (asset: Asset) => void;
  onUpdateAsset: (asset: Asset) => void;
  onDeleteAsset: (id: string) => void;
}

const NetWorthDashboard: React.FC<NetWorthDashboardProps> = ({
  assets,
  debts,
  currentBalance,
  timelineData,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Asset>>({});

  // Calculations
  const totalAssets = useMemo(() => assets.reduce((sum, a) => sum + a.value, 0) + currentBalance, [assets, currentBalance]);
  const totalLiabilities = useMemo(() => debts.reduce((sum, d) => sum + d.currentBalance, 0), [debts]);
  const netWorth = totalAssets - totalLiabilities;

  const chartData = useMemo(() => {
    const assetValue = assets.reduce((sum, a) => sum + a.value, 0);
    const liabilityValue = debts.reduce((sum, d) => sum + d.currentBalance, 0);

    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 90);
    const end = new Date(today);
    end.setDate(today.getDate() + 180);

    return timelineData
      .filter(d => {
         const date = new Date(d.date);
         return date >= start && date <= end;
      })
      .map(d => {
        const cash = d.historicalBalance !== null ? d.historicalBalance : (d.projectedBalance || 0);
        return {
          date: d.date,
          netWorth: cash + assetValue - liabilityValue,
          cash: cash,
          assets: assetValue,
          liabilities: liabilityValue
        };
      });
  }, [timelineData, assets, debts]);

  // Handlers
  const startAdd = () => {
    setEditForm({
      name: '',
      value: 0,
      type: AssetType.OTHER,
      liquidity: 'MEDIUM'
    });
    setIsAdding(true);
    setEditingId(null);
  };

  const startEdit = (asset: Asset) => {
    setEditForm({ ...asset });
    setEditingId(asset.id);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    setEditForm({});
  };

  const saveAsset = () => {
    if (!editForm.name || editForm.value === undefined) return;

    const asset: Asset = {
      id: editingId || uuidv4(),
      name: editForm.name,
      value: Number(editForm.value),
      type: editForm.type || AssetType.OTHER,
      liquidity: editForm.liquidity || 'MEDIUM'
    };

    if (editingId) {
      onUpdateAsset(asset);
    } else {
      onAddAsset(asset);
    }
    cancelEdit();
  };

  const getIcon = (type: AssetType) => {
    switch (type) {
      case AssetType.CASH: return <Wallet size={16} />;
      case AssetType.PROPERTY: return <Home size={16} />;
      case AssetType.VEHICLE: return <Car size={16} />;
      case AssetType.INVESTMENT: return <TrendingUp size={16} />;
      default: return <PieChart size={16} />;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm z-50">
          <p className="font-bold text-slate-700 mb-2">{formatDate(label)}</p>
          {payload.map((entry: any, idx: number) => (
             <div key={idx} className="flex items-center justify-between space-x-4 mb-1">
                <span className="text-slate-500 capitalize">{entry.name}:</span>
                <span className={`font-semibold ${entry.name === 'Net Worth' ? 'text-blue-600' : 'text-slate-700'}`}>
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
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <div className="text-sm font-semibold text-slate-500 mb-1">Total Assets</div>
           <div className="text-3xl font-extrabold text-emerald-600">{formatCurrency(totalAssets)}</div>
           <div className="text-xs text-slate-400 mt-2">Includes Cash Balance</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <div className="text-sm font-semibold text-slate-500 mb-1">Total Liabilities</div>
           <div className="text-3xl font-extrabold text-red-600">{formatCurrency(totalLiabilities)}</div>
           <div className="text-xs text-slate-400 mt-2">From Debt Strategist</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 bg-gradient-to-br from-blue-50 to-white">
           <div className="text-sm font-semibold text-blue-600 mb-1">Net Worth</div>
           <div className={`text-3xl font-extrabold ${netWorth >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
             {formatCurrency(netWorth)}
           </div>
           <div className="text-xs text-blue-400 mt-2">Assets - Liabilities</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Col: Asset Management */}
        <div className="lg:col-span-2 space-y-6">
           {/* Chart */}
           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[350px]">
              <h3 className="text-lg font-bold text-slate-800 mb-4 px-2">Net Worth History & Projection</h3>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorNw" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(str) => {
                      const d = new Date(str);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                    stroke="#94a3b8"
                    fontSize={12}
                    minTickGap={30}
                  />
                  <YAxis tickFormatter={(val) => `€${val/1000}k`} stroke="#94a3b8" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <ReferenceLine x={new Date().toISOString().split('T')[0]} stroke="#94a3b8" strokeDasharray="3 3" />

                  <Area
                    type="monotone"
                    dataKey="netWorth"
                    name="Net Worth"
                    stroke="#2563eb"
                    fill="url(#colorNw)"
                    strokeWidth={3}
                  />
                </ComposedChart>
              </ResponsiveContainer>
           </div>

           {/* Assets List */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center">
                  <TrendingUp size={20} className="mr-2 text-emerald-500" />
                  Assets
                </h3>
                {!isAdding && (
                    <button
                    onClick={startAdd}
                    className="flex items-center text-sm font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                    <Plus size={16} className="mr-1" /> Add Asset
                    </button>
                )}
              </div>

              <div className="divide-y divide-slate-100">
                {isAdding && (
                   <div className="p-4 bg-blue-50/50 flex flex-wrap gap-2 items-center">
                       <input
                         className="flex-grow border border-blue-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                         value={editForm.name}
                         onChange={e => setEditForm({...editForm, name: e.target.value})}
                         placeholder="New Asset Name"
                         autoFocus
                       />
                       <select
                          className="border border-blue-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={editForm.type}
                          onChange={e => setEditForm({...editForm, type: e.target.value as AssetType})}
                       >
                          {Object.values(AssetType).map(t => <option key={t} value={t}>{t}</option>)}
                       </select>
                       <div className="relative">
                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400">€</span>
                            <input
                                type="number"
                                className="w-28 border border-blue-200 rounded pl-6 pr-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={editForm.value}
                                onChange={e => setEditForm({...editForm, value: parseFloat(e.target.value)})}
                                placeholder="Value"
                            />
                       </div>
                       <div className="flex items-center space-x-1">
                            <button onClick={saveAsset} className="text-emerald-600 p-2 hover:bg-emerald-100 rounded transition-colors" title="Save"><Save size={18} /></button>
                            <button onClick={cancelEdit} className="text-slate-400 p-2 hover:bg-slate-200 rounded transition-colors" title="Cancel"><X size={18} /></button>
                       </div>
                   </div>
                )}

                {/* Operating Cash Row (Read Only) */}
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                   <div className="flex items-center space-x-3">
                      <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                        <Wallet size={20} />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">Operating Cash</div>
                        <div className="text-xs text-slate-500">Live Balance</div>
                      </div>
                   </div>
                   <div className="font-bold text-slate-700">{formatCurrency(currentBalance)}</div>
                </div>

                {/* User Assets */}
                {assets.map(asset => (
                   <div key={asset.id} className="p-4 flex items-center justify-between hover:bg-slate-50 group transition-colors">
                      {editingId === asset.id ? (
                        <div className="flex-1 flex flex-wrap gap-2 items-center">
                           <input
                             className="flex-grow border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                             value={editForm.name}
                             onChange={e => setEditForm({...editForm, name: e.target.value})}
                             placeholder="Asset Name"
                           />
                           <select
                              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={editForm.type}
                              onChange={e => setEditForm({...editForm, type: e.target.value as AssetType})}
                           >
                              {Object.values(AssetType).map(t => <option key={t} value={t}>{t}</option>)}
                           </select>
                           <div className="relative">
                                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400">€</span>
                                <input
                                    type="number"
                                    className="w-28 border rounded pl-6 pr-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={editForm.value}
                                    onChange={e => setEditForm({...editForm, value: parseFloat(e.target.value)})}
                                    placeholder="Value"
                                />
                           </div>
                           <div className="flex items-center space-x-1">
                                <button onClick={saveAsset} className="text-emerald-600 p-2 hover:bg-emerald-50 rounded transition-colors" title="Save"><Save size={18} /></button>
                                <button onClick={cancelEdit} className="text-slate-400 p-2 hover:bg-slate-100 rounded transition-colors" title="Cancel"><X size={18} /></button>
                           </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center space-x-3">
                              <div className="bg-blue-50 p-2 rounded-lg text-blue-500">
                                {getIcon(asset.type)}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-800">{asset.name}</div>
                                <div className="text-xs text-slate-500 capitalize">{asset.type.toLowerCase().replace('_', ' ')}</div>
                              </div>
                          </div>
                          <div className="flex items-center space-x-4">
                              <div className="font-bold text-slate-700">{formatCurrency(asset.value)}</div>
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEdit(asset)} aria-label="Edit Asset" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"><Edit2 size={16} /></button>
                                <button onClick={() => onDeleteAsset(asset.id)} aria-label="Delete Asset" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"><Trash2 size={16} /></button>
                              </div>
                          </div>
                        </>
                      )}
                   </div>
                ))}

                {assets.length === 0 && !isAdding && (
                    <div className="p-8 text-center text-slate-400 text-sm">
                        No additional assets tracked. Add investments, property, or vehicles.
                    </div>
                )}
              </div>
           </div>
        </div>

        {/* Right Col: Liabilities & Insights */}
        <div className="space-y-6">
           {/* Liabilities List (Read Only) */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center">
                  <CreditCard size={20} className="mr-2 text-red-500" />
                  Liabilities
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                 {debts.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                       No liabilities tracked. Add debts in Debt Strategist.
                    </div>
                 ) : (
                    debts.map(debt => (
                       <div key={debt.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div>
                             <div className="font-semibold text-slate-800">{debt.name}</div>
                             <div className="text-xs text-slate-500">{debt.interestRate}% APR</div>
                          </div>
                          <div className="font-bold text-red-600">
                             {formatCurrency(debt.currentBalance)}
                          </div>
                       </div>
                    ))
                 )}
              </div>
              <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                 <button className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-wide">
                    Manage in Debt Strategist
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default NetWorthDashboard;
