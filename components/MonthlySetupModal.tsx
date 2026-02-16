import React, { useState, useMemo } from 'react';
import { Projection, TransactionType } from '../types';
import { calculateProjectionValueForDate, formatCurrency } from '../utils/financialUtils';
import { Check, Calendar, Wallet, LayoutDashboard } from 'lucide-react';

interface MonthlySetupModalProps {
  projections: Projection[];
  monthKey: string;
  onSubmit: (data: { 
    actualBalance: number; 
    clearedProjectionIds: string[]; 
    setDefaultView: boolean 
  }) => void;
}

interface Occurrence {
  id: string; // projId_dateStr
  projId: string;
  name: string;
  amount: number;
  dateStr: string;
  type: TransactionType;
}

const MonthlySetupModal: React.FC<MonthlySetupModalProps> = ({ projections, monthKey, onSubmit }) => {
  const [actualBalance, setActualBalance] = useState<number>(0);
  const [clearedIds, setClearedIds] = useState<string[]>([]);
  const [setDefaultView, setSetDefaultView] = useState<boolean>(false);

  const monthName = useMemo(() => {
    const [year, month] = monthKey.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }, [monthKey]);

  const occurrences = useMemo(() => {
    const [year, month] = monthKey.split('-').map(Number);
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    const list: Occurrence[] = [];

    projections.forEach(proj => {
      if (!proj.isActive) return;
      // We need a fresh Date object for each projection because we modify it in the loop
      for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${day}`;
        const val = calculateProjectionValueForDate(proj, d, dateStr);
        if (val !== 0) {
          list.push({
            id: `${proj.id}_${dateStr}`,
            projId: proj.id,
            name: proj.name,
            amount: Math.abs(val),
            dateStr,
            type: proj.type
          });
        }
      }
    });
    return list.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  }, [projections, monthKey]);

  const toggleCleared = (id: string) => {
    setClearedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSave = () => {
    onSubmit({
      actualBalance,
      clearedProjectionIds: clearedIds,
      setDefaultView
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Calendar size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Monthly Setup for {monthName}</h2>
          </div>
          <p className="text-slate-500">Let's get your dashboard ready for the new month.</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
          {/* Balance Section */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-slate-800 font-semibold text-lg">
              <Wallet size={20} className="text-blue-500" />
              <label htmlFor="balance">Actual Bank Balance</label>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">€</span>
              <input
                id="balance"
                type="number"
                placeholder="0"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                value={actualBalance || ''}
                onChange={(e) => setActualBalance(parseFloat(e.target.value) || 0)}
              />
            </div>
            <p className="text-sm text-slate-400">Enter your current balance as shown in your bank app today.</p>
          </section>

          {/* Transactions Checklist */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
              <Check size={20} className="text-emerald-500" />
              <span>Which of these have already happened?</span>
            </h3>
            <p className="text-sm text-slate-500 italic text-balance">Select the projected transactions that have already been cleared by your bank.</p>
            
            <div className="space-y-2 border border-slate-100 rounded-xl overflow-hidden">
              {occurrences.map((occ) => (
                <label 
                  key={occ.id}
                  className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${clearedIds.includes(occ.id) ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center space-x-3">
                    <input 
                      type="checkbox"
                      className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                      checked={clearedIds.includes(occ.id)}
                      onChange={() => toggleCleared(occ.id)}
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-800">{occ.name}</div>
                      <div className="text-xs text-slate-400">{new Date(occ.dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${occ.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {occ.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(occ.amount)}
                  </div>
                </label>
              ))}
              {occurrences.length === 0 && (
                <div className="p-8 text-center text-slate-400 italic bg-slate-50/30">
                  No projected transactions for this month yet.
                </div>
              )}
            </div>
          </section>

          {/* Preferences Section */}
          <section className="pt-4 border-t border-slate-100">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                checked={setDefaultView}
                onChange={(e) => setSetDefaultView(e.target.checked)}
              />
              <div className="flex items-center space-x-2">
                <LayoutDashboard size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Set Monthly View as my default landing page</span>
              </div>
            </label>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/30">
          <button
            onClick={handleSave}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonthlySetupModal;
