
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Transaction, 
  Projection, 
  Category, 
  TransactionType, 
  Frequency,
  DailyBalance,
  Scenario
} from './types';
import { geminiService } from './services/geminiService';
import { 
  auth, 
  logout, 
  fetchUserData, 
  updateRemoteTransaction, 
  updateRemoteProjection, 
  updateRemoteSettings,
  deleteRemoteTransaction,
  deleteRemoteProjection,
  observeAuth
} from '@/services/firebaseService';
import { User } from 'firebase/auth';
import FinancialChart from './components/FinancialChart';
import TransactionTable from './components/TransactionTable';
import ProjectionTable from './components/ProjectionTable';
import AuthScreen from './components/AuthScreen';
import QuickActionManager from './components/QuickActionManager';
import Toast, { ToastMessage } from './components/Toast';
import ScenarioBuilder from './components/ScenarioBuilder';
import { generateTimeline, formatCurrency } from './utils/financialUtils';
import { 
  Wallet, 
  Wand2, 
  AlertCircle,
  TrendingUp,
  LogOut,
  Loader2,
  Check,
  Scale
} from 'lucide-react';

// --- Constants & Seed Data ---
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Salary', color: '#10b981' },
  { id: '2', name: 'Rent/Mortgage', color: '#ef4444' },
  { id: '3', name: 'Groceries', color: '#f59e0b' },
  { id: '4', name: 'Utilities', color: '#3b82f6' },
  { id: '5', name: 'Entertainment', color: '#8b5cf6' },
  { id: '6', name: 'Transport', color: '#64748b' },
  { id: '7', name: 'Health', color: '#ec4899' },
  { id: '8', name: 'Other', color: '#94a3b8' },
];

const App: React.FC = () => {
  // --- Auth & Sync State ---
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // Debounce/Sync Logic
  const [syncCount, setSyncCount] = useState(0);
  const isSyncing = syncCount > 0;
  
  // Use any instead of NodeJS.Timeout to avoid environment-specific type errors in browser
  const saveTimeouts = useRef<{ [key: string]: any }>({});
  
  // Helper to manage sync count safely
  const incrementSync = () => setSyncCount(c => c + 1);
  const decrementSync = () => setSyncCount(c => Math.max(0, c - 1));

  // --- App State ---
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [projections, setProjections] = useState<Projection[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  
  const [loadedInitialBalance, setLoadedInitialBalance] = useState<number>(0);
  const [projectionDays, setProjectionDays] = useState(180);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);

  // --- Auth Observer ---
  useEffect(() => {
    try {
      const unsubscribe = observeAuth(async (u) => {
        setUser(u);
        setIsInitializing(false);
        
        if (u) {
          setIsLoadingData(true);
          try {
            const data = await fetchUserData(u.uid);
            
            if (data.settings) {
              setLoadedInitialBalance(data.settings.initialBalance || 0);
              setProjectionDays(data.settings.projectionDays || 180);
            }
            
            if (data.transactions.length > 0) {
              setTransactions(data.transactions);
            }
            
            if (data.projections.length > 0) {
              setProjections(data.projections);
            }
          } catch (error) {
            console.error("Error loading user data:", error);
            addToast("Failed to load cloud data. Check your connection.", "error");
          } finally {
            setIsLoadingData(false);
          }
        }
      });
      return () => unsubscribe();
    } catch (e: any) {
      console.error("Auth observer setup failed:", e);
      setAuthError(e.message || "Authentication system failed to initialize.");
      setIsInitializing(false);
    }
  }, []);

  // --- Computed ---
  const timelineData: DailyBalance[] = useMemo(() => {
    return generateTimeline(
        loadedInitialBalance, 
        transactions, 
        projections, 
        projectionDays,
        scenarios // Pass scenarios to timeline generation
    );
  }, [loadedInitialBalance, transactions, projections, projectionDays, scenarios]);

  const currentBalance = useMemo(() => {
    const lastHistorical = [...timelineData].reverse().find(d => d.historicalBalance !== null);
    return lastHistorical ? (lastHistorical.historicalBalance as number) : loadedInitialBalance;
  }, [timelineData, loadedInitialBalance]);

  const projectedFinalBalance = useMemo(() => {
     const last = timelineData[timelineData.length - 1];
     if (!last) return currentBalance;
     return last.projectedBalance !== null ? last.projectedBalance : (last.historicalBalance || 0);
  }, [timelineData, currentBalance]);

  // --- Toast Logic ---
  const addToast = (message: string, type: 'success' | 'error') => {
    setToasts(prev => [...prev, { id: uuidv4(), message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Debounced Sync Functions ---
  
  const debouncedSyncTransaction = (tx: Transaction) => {
    if (!user) return;
    
    // If a timeout exists, clear it (reset debounce timer)
    // We do NOT increment count here because the previous "pending" operation is essentially being extended
    if (saveTimeouts.current[tx.id]) {
      clearTimeout(saveTimeouts.current[tx.id]);
    } else {
      // New distinct sync operation starting
      incrementSync();
    }

    saveTimeouts.current[tx.id] = setTimeout(async () => {
      try {
        await updateRemoteTransaction(user.uid, tx);
      } finally {
        delete saveTimeouts.current[tx.id];
        decrementSync();
      }
    }, 1500); // 1.5s debounce
  };

  const debouncedSyncProjection = (p: Projection) => {
    if (!user) return;
    
    if (saveTimeouts.current[p.id]) {
      clearTimeout(saveTimeouts.current[p.id]);
    } else {
      incrementSync();
    }

    saveTimeouts.current[p.id] = setTimeout(async () => {
      try {
        await updateRemoteProjection(user.uid, p);
      } finally {
        delete saveTimeouts.current[p.id];
        decrementSync();
      }
    }, 1500);
  };

  const immediateSyncTransaction = async (tx: Transaction) => {
    if (!user) return;
    incrementSync();
    try {
      await updateRemoteTransaction(user.uid, tx);
    } finally {
      decrementSync();
    }
  };

  const immediateSyncProjection = async (p: Projection) => {
    if (!user) return;
    incrementSync();
    try {
      await updateRemoteProjection(user.uid, p);
    } finally {
      decrementSync();
    }
  };

  const syncSettings = async (bal: number, days: number) => {
    if (!user) return;
    incrementSync();
    try {
        await updateRemoteSettings(user.uid, { initialBalance: bal, projectionDays: days });
    } finally {
        decrementSync();
    }
  };

  // --- Action Handlers ---

  const handleUpdateTransaction = (updated: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
    debouncedSyncTransaction(updated);
  };

  const handleDeleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    if (user) {
        incrementSync();
        await deleteRemoteTransaction(user.uid, id);
        decrementSync();
    }
  };

  const handleAddTransaction = () => {
    const newTx: Transaction = {
      id: uuidv4(),
      date: new Date().toISOString().split('T')[0],
      description: 'New Transaction',
      amount: 0,
      categoryId: '8',
      type: TransactionType.EXPENSE,
      skipAutoCategorization: false
    };
    setTransactions(prev => [newTx, ...prev]);
    immediateSyncTransaction(newTx);
  };

  // Logic for Quick Action Creation (Data from AI)
  const handleCreateTransactionFromAI = (data: Partial<Transaction>) => {
    const newTx: Transaction = {
      id: uuidv4(),
      date: data.date || new Date().toISOString().split('T')[0],
      description: data.description || 'New AI Transaction',
      amount: data.amount || 0,
      categoryId: data.categoryId || '8',
      type: data.type || TransactionType.EXPENSE,
      skipAutoCategorization: false
    };
    setTransactions(prev => [newTx, ...prev]);
    immediateSyncTransaction(newTx);
  };

  const handleCreateProjectionFromAI = (data: Partial<Projection>) => {
    // Force frequency to uppercase to match Enum key if AI returns mixed case
    const freq = data.frequency ? data.frequency.toUpperCase() as Frequency : Frequency.MONTHLY;

    const newProj: Projection = {
      id: uuidv4(),
      name: data.name || 'New AI Projection',
      amount: data.amount || 0,
      frequency: freq,
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate, // Correctly map endDate
      categoryId: data.categoryId || '8',
      type: data.type || TransactionType.EXPENSE,
      isActive: true
    };
    setProjections(prev => [...prev, newProj]);
    immediateSyncProjection(newProj);
  };

  const handleUpdateProjectionFromAI = (id: string, data: Partial<Projection>) => {
    setProjections(prev => prev.map(p => {
        if (p.id === id) {
            const updated = { ...p, ...data };
            debouncedSyncProjection(updated);
            return updated;
        }
        return p;
    }));
  };

  // --- Align Balance Logic ---
  const handleAlignBalance = () => {
    const input = prompt("Enter your actual current bank balance (e.g., 2500.50):", currentBalance.toString());
    if (input === null) return; 
    
    const actualBalance = parseFloat(input);
    if (isNaN(actualBalance)) {
      alert("Invalid amount entered.");
      return;
    }

    const diff = actualBalance - currentBalance;
    
    if (Math.abs(diff) < 0.01) {
      alert("Balance is already aligned!");
      return;
    }

    const correctionTx: Transaction = {
      id: uuidv4(),
      date: new Date().toISOString().split('T')[0],
      description: 'Balance Correction / Adjustment',
      amount: Math.abs(diff),
      categoryId: '8', 
      type: diff > 0 ? TransactionType.INCOME : TransactionType.EXPENSE
    };

    setTransactions(prev => [correctionTx, ...prev]);
    immediateSyncTransaction(correctionTx);
    alert(`Balance aligned. Added a ${formatCurrency(Math.abs(diff))} ${diff > 0 ? 'Income' : 'Expense'} adjustment.`);
  };

  const handleUpdateProjection = (updated: Projection) => {
    setProjections(prev => prev.map(p => p.id === updated.id ? updated : p));
    debouncedSyncProjection(updated);
  };

  const handleDeleteProjection = async (id: string) => {
    setProjections(prev => prev.filter(p => p.id !== id));
    if (user) {
        incrementSync();
        await deleteRemoteProjection(user.uid, id);
        decrementSync();
    }
  };

  const handleAddProjection = () => {
    const newProj: Projection = {
      id: uuidv4(),
      name: 'New Item',
      amount: 0,
      frequency: Frequency.ONCE,
      startDate: new Date().toISOString().split('T')[0],
      categoryId: '8',
      type: TransactionType.EXPENSE,
      isActive: true
    };
    setProjections(prev => [...prev, newProj]);
    immediateSyncProjection(newProj);
  };

  // --- Scenario Handlers ---
  const handleAddScenario = (s: Scenario) => {
    setScenarios(prev => [...prev, s]);
  };
  
  const handleUpdateScenario = (updated: Scenario) => {
    setScenarios(prev => prev.map(s => s.id === updated.id ? updated : s));
  };
  
  const handleDeleteScenario = (id: string) => {
    setScenarios(prev => prev.filter(s => s.id !== id));
  };


  const handleAutoCategorize = async () => {
    setIsCategorizing(true);
    try {
      const toCategorize = transactions.filter(t => t.categoryId === '8' && !t.skipAutoCategorization);
      
      if (toCategorize.length === 0) {
        alert("No eligible transactions found in 'Other' to analyze.");
        setIsCategorizing(false);
        return;
      }

      const mapping = await geminiService.categorizeTransactions(toCategorize, categories);
      
      let updateCount = 0;
      let skippedCount = 0;
      const updatesToSync: Transaction[] = [];

      const newTransactions = transactions.map(t => {
        if (t.categoryId === '8' && !t.skipAutoCategorization) {
            if (mapping.has(t.id)) {
                updateCount++;
                const updated = { ...t, categoryId: mapping.get(t.id)! };
                updatesToSync.push(updated);
                return updated;
            } else {
                skippedCount++;
                const updated = { ...t, skipAutoCategorization: true };
                updatesToSync.push(updated);
                return updated;
            }
        }
        return t;
      });

      setTransactions(newTransactions);
      
      // Batch sync changes (using individual immediate syncs for simplicity in this structure)
      updatesToSync.forEach(tx => immediateSyncTransaction(tx));
      
      if (updateCount > 0) {
          addToast(`Successfully categorized ${updateCount} transactions!`, 'success');
      } else if (skippedCount > 0) {
          addToast(`AI could not categorize ${skippedCount} items and will ignore them next time.`, 'error');
      } else {
          addToast("No changes made.", 'error');
      }

    } catch (e) {
      console.error(e);
      addToast("AI Categorization error.", 'error');
    } finally {
      setIsCategorizing(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">System Error</h2>
        <p className="text-slate-600 text-center max-w-md">{authError}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[60] flex flex-col items-end space-y-2 pointer-events-none">
        <div className="pointer-events-auto">
          {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </div>
      </div>

      {/* Quick Action Manager (Chat Bubbles) */}
      <QuickActionManager 
        categories={categories}
        projections={projections}
        onTransactionCreate={handleCreateTransactionFromAI}
        onProjectionCreate={handleCreateProjectionFromAI}
        onProjectionUpdate={handleUpdateProjectionFromAI}
        onToast={addToast}
      />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-100">
              <Wallet size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">FinVision</h1>
              <div className="flex items-center text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
                {isSyncing ? (
                  <span className="flex items-center text-blue-500 transition-all duration-300">
                    <Loader2 size={10} className="mr-1 animate-spin" /> Syncing...
                  </span>
                ) : (
                  <span className="flex items-center text-emerald-500 transition-all duration-300">
                    <Check size={10} className="mr-1" /> Saved
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 md:space-x-4">
             <div className="hidden md:flex items-center text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="mr-2 font-medium">Projection:</span>
                <select 
                  value={projectionDays} 
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setProjectionDays(val);
                    syncSettings(loadedInitialBalance, val);
                  }}
                  className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
                >
                  <option value={30}>30 Days</option>
                  <option value={90}>3 Months</option>
                  <option value={180}>6 Months</option>
                  <option value={365}>1 Year</option>
                </select>
             </div>
          
            <button 
              onClick={handleAutoCategorize}
              disabled={isCategorizing}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold text-white shadow-md transition-all
                ${isCategorizing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}
              title="Automatically categorize transactions labeled as 'Other'"
            >
              <Wand2 size={16} className={isCategorizing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">AI Smart Categorize</span>
            </button>

            <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

            <div className="flex items-center space-x-3">
               <div className="hidden lg:block text-right">
                  <p className="text-xs font-bold text-slate-900 leading-none">{user?.displayName || 'User'}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{user?.email || 'Guest Session'}</p>
               </div>
               <button 
                  onClick={() => logout()}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Sign Out"
               >
                 <LogOut size={20} />
               </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden">
             <div className="flex items-center justify-between mb-4">
                <span className="text-slate-500 text-sm font-semibold">Current Available Balance</span>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider">Live</span>
             </div>
             <div className="flex items-end justify-between">
                <div>
                   <div className="text-4xl font-extrabold text-slate-800 tracking-tight">{formatCurrency(currentBalance)}</div>
                   <div className="text-xs text-emerald-600 mt-2 font-semibold flex items-center">
                      <TrendingUp size={14} className="mr-1.5" />
                      Calculated from history
                   </div>
                </div>
                <button 
                  onClick={handleAlignBalance}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <Scale size={16} />
                  <span>Align Balance</span>
                </button>
             </div>
           </div>

           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
             <div className="flex items-center justify-between mb-4">
                <span className="text-slate-500 text-sm font-semibold">Projected Balance ({projectionDays} days)</span>
                <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider">Future</span>
             </div>
             <div className={`text-4xl font-extrabold tracking-tight ${projectedFinalBalance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                {formatCurrency(projectedFinalBalance)}
             </div>
             <div className="text-xs text-slate-400 mt-2 font-semibold">
                {projectedFinalBalance < 0 ? (
                    <span className="flex items-center text-red-500 bg-red-50 px-2 py-1 rounded-lg w-fit">
                        <AlertCircle size={14} className="mr-1.5" />
                        Risk: Deficit predicted
                    </span>
                ) : (
                    <span className="text-slate-400">Estimated position at end of period</span>
                )}
             </div>
           </div>
        </div>
        
        {/* Scenario Builder */}
        <ScenarioBuilder 
            projections={projections} 
            scenarios={scenarios}
            onAddScenario={handleAddScenario}
            onUpdateScenario={handleUpdateScenario}
            onDeleteScenario={handleDeleteScenario}
        />

        {/* Chart Section */}
        <div className="relative">
          {isLoadingData && (
             <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl">
                <div className="flex flex-col items-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                  <p className="text-sm font-bold text-slate-600">Loading Cloud Data...</p>
                </div>
             </div>
          )}
          <FinancialChart data={timelineData} scenarios={scenarios} />
        </div>

        {/* Dynamic Tables Grid - Stacked Vertically */}
        <div className="flex flex-col space-y-8">
          <TransactionTable 
            transactions={transactions} 
            categories={categories}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onAddTransaction={handleAddTransaction}
          />
          <ProjectionTable
            projections={projections}
            categories={categories}
            onUpdateProjection={handleUpdateProjection}
            onDeleteProjection={handleDeleteProjection}
            onAddProjection={handleAddProjection}
          />
        </div>
      </main>
      
      {/* Footer Info */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <p className="text-xs text-slate-400 font-medium tracking-wide">
             FinVision Planner &bull; Secured with Firebase &bull; AI Powered by Gemini
           </p>
           <p className="text-[10px] text-slate-300 mt-1">
             Pro tip: Press Ctrl + Enter to quick add via AI
           </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
