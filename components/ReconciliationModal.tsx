import React, { useState, useMemo, useEffect } from 'react';
import { Projection, TransactionType, UnreconciledOccurrence, Transaction } from '../types';
import { 
  getUnreconciledProjections, 
  formatCurrency, 
  createReconciliationTransaction 
} from '../utils/financialUtils';
import { Check, Calendar, Wallet, LayoutDashboard, ArrowRight, AlertCircle } from 'lucide-react';

interface ReconciliationModalProps {
  projections: Projection[];
  lastReconciledDate: string;
  initialBalance: number;
  monthKey: string;
  onSubmit: (data: { 
    actualBalance: number; 
    clearedProjectionIds: string[]; 
    setDefaultView: boolean;
    adjustmentTransaction: Transaction | null;
  }) => void;
}

const ReconciliationModal: React.FC<ReconciliationModalProps> = ({ 
  projections, 
  lastReconciledDate,
  initialBalance,
  monthKey, 
  onSubmit 
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  const [actualBalance, setActualBalance] = useState<number>(0);
  const [clearedIds, setClearedIds] = useState<string[]>([]);
  const [setDefaultView, setSetDefaultView] = useState<boolean>(false);
  const [step, setStep] = useState<1 | 2>(1);

  const unreconciled = useMemo(() => {
    // Add 1 day to lastReconciledDate to avoid re-counting the same day? 
    // Actually, usually it's inclusive. Let's say it's projections AFTER last reconciled date.
    const start = new Date(lastReconciledDate);
    start.setDate(start.getDate() + 1);
    const startStr = start.toISOString().split('T')[0];
    
    return getUnreconciledProjections(startStr, todayStr, projections);
  }, [projections, lastReconciledDate, todayStr]);

  // Set all as cleared by default
  useEffect(() => {
    setClearedIds(unreconciled.map(u => u.id));
  }, [unreconciled]);

  const theoreticalBalance = useMemo(() => {
    let bal = initialBalance;
    unreconciled.forEach(u => {
      if (clearedIds.includes(u.id)) {
        bal += (u.type === TransactionType.INCOME ? u.amount : -u.amount);
      }
    });
    return bal;
  }, [initialBalance, unreconciled, clearedIds]);

  const gap = actualBalance - theoreticalBalance;

  const toggleCleared = (id: string) => {
    setClearedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSave = () => {
    let adjustment: Transaction | null = null;
    if (Math.abs(gap) >= 0.01) {
      adjustment = {
        id: crypto.randomUUID(),
        ...createReconciliationTransaction(gap, todayStr)
      } as Transaction;
    }

    onSubmit({
      actualBalance,
      clearedProjectionIds: clearedIds,
      setDefaultView,
      adjustmentTransaction: adjustment
    });
  };

  const monthName = useMemo(() => {
    const [year, month] = monthKey.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }, [monthKey]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Calendar size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Monthly Reconciliation</h2>
            </div>
            <p className="text-slate-500">Aligning {monthName} with your bank.</p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step {step} of 2</span>
            <div className="flex space-x-1 mt-1">
                <div className={`h-1.5 w-8 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-slate-200'}`}></div>
                <div className={`h-1.5 w-8 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-slate-200'}`}></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start space-x-3">
                <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-blue-700">
                  Select the recurring items that have already appeared on your bank statement since <strong>{new Date(lastReconciledDate).toLocaleDateString('en-GB')}</strong>.
                </p>
              </div>

              <div className="space-y-2 border border-slate-100 rounded-xl overflow-hidden">
                {unreconciled.map((occ) => (
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
                {unreconciled.length === 0 && (
                  <div className="p-12 text-center text-slate-400 italic bg-slate-50/30">
                    No pending items to reconcile.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center space-x-2 text-slate-800 font-semibold text-lg">
                  <Wallet size={20} className="text-blue-500" />
                  <label htmlFor="balance">What is your actual bank balance today?</label>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">€</span>
                  <input
                    id="balance"
                    type="number"
                    placeholder="0"
                    autoFocus
                    className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-3xl font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    value={actualBalance || ''}
                    onChange={(e) => setActualBalance(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </section>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Theoretical Balance</span>
                    <div className="text-xl font-bold text-slate-700">{formatCurrency(theoreticalBalance)}</div>
                </div>
                <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Adjustment Needed</span>
                    <div className={`text-xl font-bold ${gap === 0 ? 'text-slate-400' : gap > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {gap > 0 ? '+' : ''}{formatCurrency(gap)}
                    </div>
                </div>
              </div>

              {Math.abs(gap) >= 0.01 && (
                <p className="text-sm text-slate-500 italic text-center">
                  We'll create a "Balance Correction" transaction for {formatCurrency(Math.abs(gap))} to match your bank exactly.
                </p>
              )}

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
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex space-x-3">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
            >
              Back
            </button>
          )}
          <button
            onClick={() => step === 1 ? setStep(2) : handleSave()}
            className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <span>{step === 1 ? 'Next: Verify Balance' : 'Save & Finish'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReconciliationModal;
