import React, { useState, useEffect, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Transaction, 
  Projection, 
  Category, 
  TransactionType, 
  Frequency,
  DailyBalance,
  Scenario,
  AppView,
  MonthlySetup,
  Debt,
  DebtStrategy,
  SavingsGoal,
  Asset
} from './types';
import { 
  logout, 
  fetchUserData, 
  updateRemoteTransaction, 
  updateRemoteProjection, 
  updateRemoteSettings,
  deleteRemoteTransaction,
  deleteRemoteProjection,
  observeAuth,
  getMonthlySetup,
  saveMonthlySetup,
  updateRemoteDebt,
  deleteRemoteDebt,
  updateRemoteSavingsGoal,
  deleteRemoteSavingsGoal,
  updateRemoteAsset,
  deleteRemoteAsset
} from '@/services/firebaseService';
import { User } from 'firebase/auth';
import FinancialChart from './components/FinancialChart';
import NetWorthDashboard from './components/NetWorthDashboard';
import TransactionTable from './components/TransactionTable';
import ProjectionTable from './components/ProjectionTable';
import AuthScreen from './components/AuthScreen';
import Toast, { ToastMessage } from './components/Toast';
import ScenarioBuilder from './components/ScenarioBuilder';
import ReconciliationModal from './components/ReconciliationModal';
import MonthlyDashboard from './components/MonthlyDashboard';
import DebtDashboard from './components/DebtDashboard';
import SubscriptionManager from './components/SubscriptionManager';
import SmartSavingsDashboard from './components/SmartSavingsDashboard';
import SmartBillCalendar from './components/SmartBillCalendar';
import { generateTimeline, formatCurrency, getMonthKey, calculateMonthlySummary } from './utils/financialUtils';
import { calculateMergeChanges } from './utils/scenarioUtils';
import { 
  Wallet, 
  AlertCircle,
  TrendingUp,
  LogOut,
  Loader2,
  Check,
  Scale,
  LayoutDashboard,
  CreditCard,
  Repeat,
  PiggyBank,
  Landmark,
  Calendar
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
  const [debts, setDebts] = useState<Debt[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  
  const [loadedInitialBalance, setLoadedInitialBalance] = useState<number>(0);
  const [projectionDays, setProjectionDays] = useState(180);
  const [lastReconciledDate, setLastReconciledDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentView, setCurrentView] = useState<AppView>(AppView.MAIN);
  const [debtStrategy, setDebtStrategy] = useState<DebtStrategy>(DebtStrategy.SNOWBALL);
  const [monthlyExtra, setMonthlyExtra] = useState<number>(0);

  const [selectedMonthDate, setSelectedMonthDate] = useState<Date>(new Date());
  const [monthlySetup, setMonthlySetup] = useState<MonthlySetup | null>(null);
  const [showReconciliationModal, setShowReconciliationModal] = useState(false);
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
            const data: any = await fetchUserData(u.uid);
            
            if (data.settings) {
              setLoadedInitialBalance(data.settings.initialBalance || 0);
              setProjectionDays(data.settings.projectionDays || 180);
              if (data.settings.lastReconciledDate) {
                setLastReconciledDate(data.settings.lastReconciledDate);
              }
              if (data.settings.defaultView) {
                setCurrentView(data.settings.defaultView);
              }
              if (data.settings.debtStrategy) {
                setDebtStrategy(data.settings.debtStrategy);
              }
              if (data.settings.debtMonthlyExtra) {
                setMonthlyExtra(data.settings.debtMonthlyExtra);
              }
              if (data.settings.categories) {
                setCategories(data.settings.categories);
              }
            }
            
            if (data.transactions.length > 0) {
              setTransactions(data.transactions);
            }
            
            if (data.projections.length > 0) {
              setProjections(data.projections);
            }

            if (data.debts && data.debts.length > 0) {
              setDebts(data.debts);
            }

            if (data.savingsGoals && data.savingsGoals.length > 0) {
              setSavingsGoals(data.savingsGoals);
            }

            if (data.assets && data.assets.length > 0) {
              setAssets(data.assets);
            }

            // Check if reconciliation is needed for current month
            const monthKey = getMonthKey();
            const setup = await getMonthlySetup(u.uid, monthKey);
            if (setup) {
              setMonthlySetup(setup);
            } else {
              setShowReconciliationModal(true);
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

  const monthlySummary = useMemo(() => {
    // We calculate summary for the SELECTED month, not always current
    const monthKey = getMonthKey(selectedMonthDate);
    
    // If it's the current month, use actual balance from setup.
    // If it's a different month, we'd need more complex logic. 
    // For now, let's keep it simple: if setup exists for THIS key, use it.
    // Otherwise, we might need to derive it from timeline.
    
    if (monthlySetup && monthlySetup.monthKey === monthKey) {
        return calculateMonthlySummary(
            monthlySetup.monthKey,
            monthlySetup.actualBalance,
            monthlySetup.clearedProjectionIds,
            projections
        );
    }

    // Fallback: Calculate from timeline for other months
    const monthPoints = timelineData.filter(d => d.date.startsWith(monthKey));
    if (monthPoints.length === 0) return null;

    const lastPoint = monthPoints[monthPoints.length - 1];
    const remainingSpendable = lastPoint.projectedBalance || lastPoint.historicalBalance || 0;

    return {
        remainingSpendable,
        totalProjectedIncome: 0, // Simplified fallback
        totalProjectedExpenses: 0,
        spentPercentage: 0
    };
  }, [monthlySetup, projections, selectedMonthDate, timelineData]);

  const filteredTransactions = useMemo(() => {
    if (currentView !== AppView.MONTHLY) return transactions;
    const key = getMonthKey(selectedMonthDate);
    // Explicitly check for year and month
    return transactions.filter(t => {
        const tKey = t.date.substring(0, 7);
        return tKey === key;
    });
  }, [transactions, currentView, selectedMonthDate]);

  const filteredProjections = useMemo(() => {
    if (currentView !== AppView.MONTHLY) return projections;
    const startStr = `${getMonthKey(selectedMonthDate)}-01`;
    const end = new Date(selectedMonthDate.getFullYear(), selectedMonthDate.getMonth() + 1, 0);
    const endStr = end.toISOString().split('T')[0];

    return projections.filter(p => {
        if (!p.isActive) return false;
        if (p.endDate && p.endDate < startStr) return false;
        if (p.startDate > endStr) return false;
        return true;
    });
  }, [projections, currentView, selectedMonthDate]);

  // --- Toast Logic ---
  const addToast = (message: string, type: 'success' | 'error' | 'info', action?: { label: string, onClick: () => void }) => {
    setToasts(prev => [...prev, { id: uuidv4(), message, type, action }]);
  };

  const checkMonthVisibility = (date: string) => {
    if (currentView !== AppView.MONTHLY) return;
    const targetKey = date.substring(0, 7);
    const currentKey = getMonthKey(selectedMonthDate);
    if (targetKey !== currentKey) {
        const targetDate = new Date(date);
        const monthName = targetDate.toLocaleDateString('en-GB', { month: 'long' });
        addToast(`Entry added for ${date}. Not visible in current month.`, "info", {
            label: `Go to ${monthName}`,
            onClick: () => setSelectedMonthDate(targetDate)
        });
    }
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

  const debouncedSyncDebt = (d: Debt) => {
    if (!user) return;

    if (saveTimeouts.current[d.id]) {
      clearTimeout(saveTimeouts.current[d.id]);
    } else {
      incrementSync();
    }

    saveTimeouts.current[d.id] = setTimeout(async () => {
      try {
        await updateRemoteDebt(user.uid, d);
      } finally {
        delete saveTimeouts.current[d.id];
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

  const immediateSyncDebt = async (d: Debt) => {
    if (!user) return;
    incrementSync();
    try {
      await updateRemoteDebt(user.uid, d);
    } finally {
      decrementSync();
    }
  };

  const immediateSyncSavingsGoal = async (g: SavingsGoal) => {
    if (!user) return;
    incrementSync();
    try {
      await updateRemoteSavingsGoal(user.uid, g);
    } finally {
      decrementSync();
    }
  };

  const immediateSyncAsset = async (a: Asset) => {
    if (!user) return;
    incrementSync();
    try {
      await updateRemoteAsset(user.uid, a);
    } finally {
      decrementSync();
    }
  };

  const syncSettings = async (bal: number, days: number, dStrat?: DebtStrategy, dExtra?: number) => {
    if (!user) return;
    incrementSync();
    try {
        const update: any = { initialBalance: bal, projectionDays: days };
        if (dStrat) update.debtStrategy = dStrat;
        if (dExtra !== undefined) update.debtMonthlyExtra = dExtra;
        await updateRemoteSettings(user.uid, update);
    } finally {
        decrementSync();
    }
  };

  const syncCategories = async (cats: Category[]) => {
    if (!user) return;
    incrementSync();
    try {
        await updateRemoteSettings(user.uid, { categories: cats });
    } finally {
        decrementSync();
    }
  };

  // --- Action Handlers ---

  const handleUpdateTransaction = (updated: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
    debouncedSyncTransaction(updated);
    // If the date changed, check visibility
    const oldTx = transactions.find(t => t.id === updated.id);
    if (oldTx && oldTx.date !== updated.date) {
        checkMonthVisibility(updated.date);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    if (user) {
        incrementSync();
        await deleteRemoteTransaction(user.uid, id);
        decrementSync();
    }
  };

  const handleAddTransaction = (optionalDateStr?: string | React.MouseEvent) => {
    let date = new Date().toISOString().split('T')[0];
    if (typeof optionalDateStr === 'string') {
        date = optionalDateStr;
    } else if (currentView === AppView.MONTHLY) {
        date = new Date(selectedMonthDate.getFullYear(), selectedMonthDate.getMonth(), new Date().getDate()).toISOString().split('T')[0];
    }

    const newTx: Transaction = {
      id: `manual-${uuidv4()}`,
      date,
      description: 'New Transaction',
      amount: 0,
      categoryId: '8',
      type: TransactionType.EXPENSE,
      skipAutoCategorization: false
    };
    setTransactions(prev => [newTx, ...prev]);
    immediateSyncTransaction(newTx);
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

  const handleUpdateCategories = (newCats: Category[]) => {
    setCategories(newCats);
    syncCategories(newCats);
  };

  // --- Debt Handlers ---
  const handleAddDebt = (debt: Debt) => {
    setDebts(prev => [...prev, debt]);
    immediateSyncDebt(debt);
  };

  const handleUpdateDebt = (debt: Debt) => {
    setDebts(prev => prev.map(d => d.id === debt.id ? debt : d));
    debouncedSyncDebt(debt);
  };

  const handleDeleteDebt = async (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
    if (user) {
        incrementSync();
        await deleteRemoteDebt(user.uid, id);
        decrementSync();
    }
  };

  const handleStrategyChange = (s: DebtStrategy) => {
    setDebtStrategy(s);
    syncSettings(loadedInitialBalance, projectionDays, s, monthlyExtra);
  };

  const handleMonthlyExtraChange = (val: number) => {
    setMonthlyExtra(val);
    syncSettings(loadedInitialBalance, projectionDays, debtStrategy, val);
  };

  // --- Smart Savings Handlers ---
  const handleAddSavingsGoal = (goal: SavingsGoal) => {
    setSavingsGoals(prev => [...prev, goal]);
    immediateSyncSavingsGoal(goal);
  };

  const handleUpdateSavingsGoal = (goal: SavingsGoal) => {
    setSavingsGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
    immediateSyncSavingsGoal(goal);
  };

  const handleDeleteSavingsGoal = async (id: string) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== id));
    if (user) {
      incrementSync();
      await deleteRemoteSavingsGoal(user.uid, id);
      decrementSync();
    }
  };

  // --- Asset Handlers ---
  const handleAddAsset = (asset: Asset) => {
    setAssets(prev => [...prev, asset]);
    immediateSyncAsset(asset);
  };

  const handleUpdateAsset = (asset: Asset) => {
    setAssets(prev => prev.map(a => a.id === asset.id ? asset : a));
    immediateSyncAsset(asset);
  };

  const handleDeleteAsset = async (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    if (user) {
      incrementSync();
      await deleteRemoteAsset(user.uid, id);
      decrementSync();
    }
  };

  // --- Scenario Handlers ---
  const handleAddScenario = (s: Scenario) => {
    setScenarios(prev => [...prev, s]);
  };
  
  const handleReconciliationSubmit = async (data: { 
    actualBalance: number; 
    clearedProjectionIds: string[]; 
    setDefaultView: boolean;
    adjustmentTransaction: Transaction | null;
  }) => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const monthKey = getMonthKey();

    const setup: MonthlySetup = {
      monthKey,
      actualBalance: data.actualBalance,
      clearedProjectionIds: data.clearedProjectionIds,
      completedAt: new Date().toISOString()
    };

    setMonthlySetup(setup);
    setLastReconciledDate(today);
    setShowReconciliationModal(false);

    if (data.setDefaultView) {
      setCurrentView(AppView.MONTHLY);
    }

    if (data.adjustmentTransaction) {
      setTransactions(prev => [data.adjustmentTransaction!, ...prev]);
      immediateSyncTransaction(data.adjustmentTransaction);
    }

    // Persist
    incrementSync();
    try {
      await saveMonthlySetup(user.uid, setup);
      const settingsUpdates: any = { lastReconciledDate: today };
      if (data.setDefaultView) {
        settingsUpdates.defaultView = AppView.MONTHLY;
      }
      await updateRemoteSettings(user.uid, settingsUpdates);
      addToast("Reconciliation complete!", "success");
    } catch (e) {
      console.error(e);
      addToast("Error saving reconciliation.", "error");
    } finally {
      decrementSync();
    }
  };

  const handleUpdateScenario = (updated: Scenario) => {
    setScenarios(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const handleMergeScenario = async (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    const changes = calculateMergeChanges(projections, scenario);

    // 1. Update Local State
    setProjections(prev => {
        let newProjections = [...prev];

        // Add new items
        newProjections.push(...changes.toAdd);

        // Update items
        changes.toUpdate.forEach(updated => {
            const index = newProjections.findIndex(p => p.id === updated.id);
            if (index !== -1) newProjections[index] = updated;
        });

        // Remove items
        newProjections = newProjections.filter(p => !changes.toDelete.includes(p.id));

        return newProjections;
    });

    // 2. Sync to Remote
    if (user) {
        // We execute these sequentially to avoid overwhelming the client/connection
        // Ideally these would be a batch write in firebaseService, but we reuse existing methods here.
        for (const p of changes.toAdd) {
            await immediateSyncProjection(p);
        }
        for (const p of changes.toUpdate) {
            await immediateSyncProjection(p);
        }
        for (const id of changes.toDelete) {
            // Manually call delete remote, wrapping in sync counter
            incrementSync();
            try {
                await deleteRemoteProjection(user.uid, id);
            } finally {
                decrementSync();
            }
        }
    }

    // 3. Delete Scenario
    setScenarios(prev => prev.filter(s => s.id !== scenarioId));
    addToast(`Merged scenario "${scenario.name}" into main plan.`, 'success');
  };
  
  const handleDeleteScenario = (id: string) => {
    setScenarios(prev => prev.filter(s => s.id !== id));
  };


  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-400 mt-4">Initializing Auth...</p>
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

      {showReconciliationModal && (
        <ReconciliationModal 
          projections={projections}
          lastReconciledDate={lastReconciledDate}
          initialBalance={currentBalance}
          monthKey={getMonthKey()}
          onSubmit={handleReconciliationSubmit}
        />
      )}

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
             {currentView === AppView.MAIN && (
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
             )}

            {/* View Switchers */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setCurrentView(AppView.MAIN)}
                  className={`p-2 rounded-lg transition-all ${currentView === AppView.MAIN ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  title="Dashboard"
                >
                  <TrendingUp size={20} />
                </button>
                <button
                  onClick={() => setCurrentView(AppView.MONTHLY)}
                  className={`p-2 rounded-lg transition-all ${currentView === AppView.MONTHLY ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  title="Monthly Focus"
                >
                  <LayoutDashboard size={20} />
                </button>
                <button
                  onClick={() => setCurrentView(AppView.CALENDAR)}
                  className={`p-2 rounded-lg transition-all ${currentView === AppView.CALENDAR ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  title="Smart Bill Calendar"
                >
                  <Calendar size={20} />
                </button>
                <button
                  onClick={() => setCurrentView(AppView.DEBT_STRATEGIST)}
                  className={`p-2 rounded-lg transition-all ${currentView === AppView.DEBT_STRATEGIST ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  title="Debt Strategist"
                >
                  <CreditCard size={20} />
                </button>
                <button
                  onClick={() => setCurrentView(AppView.SUBSCRIPTIONS)}
                  className={`p-2 rounded-lg transition-all ${currentView === AppView.SUBSCRIPTIONS ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  title="Subscriptions"
                >
                  <Repeat size={20} />
                </button>
                <button
                  onClick={() => setCurrentView(AppView.SMART_SAVINGS)}
                  className={`p-2 rounded-lg transition-all ${currentView === AppView.SMART_SAVINGS ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  title="Smart Savings"
                >
                  <PiggyBank size={20} />
                </button>
                <button
                  onClick={() => setCurrentView(AppView.NET_WORTH)}
                  className={`p-2 rounded-lg transition-all ${currentView === AppView.NET_WORTH ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  title="Net Worth"
                >
                  <Landmark size={20} />
                </button>
            </div>

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
        
        {currentView === AppView.MONTHLY && monthlySummary ? (
          <MonthlyDashboard 
            summary={monthlySummary}
            selectedDate={selectedMonthDate}
            onNavigate={setSelectedMonthDate}
            onSwitchView={() => setCurrentView(AppView.MAIN)}
            onOpenSettings={() => setShowReconciliationModal(true)}
            transactions={filteredTransactions}
            projections={filteredProjections}
            categories={categories}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onAddTransaction={handleAddTransaction}
            onUpdateProjection={handleUpdateProjection}
            onDeleteProjection={handleDeleteProjection}
            onAddProjection={handleAddProjection}
            onUpdateCategories={handleUpdateCategories}
          />
        ) : currentView === AppView.DEBT_STRATEGIST ? (
            <DebtDashboard
                debts={debts}
                onAddDebt={handleAddDebt}
                onUpdateDebt={handleUpdateDebt}
                onDeleteDebt={handleDeleteDebt}
                strategy={debtStrategy}
                onStrategyChange={handleStrategyChange}
                monthlyExtra={monthlyExtra}
                onMonthlyExtraChange={handleMonthlyExtraChange}
            />
        ) : currentView === AppView.SUBSCRIPTIONS ? (
            <SubscriptionManager
                projections={projections}
                categories={categories}
                onUpdateProjection={handleUpdateProjection}
            />
        ) : currentView === AppView.SMART_SAVINGS ? (
            <SmartSavingsDashboard
                goals={savingsGoals}
                onAddGoal={handleAddSavingsGoal}
                onUpdateGoal={handleUpdateSavingsGoal}
                onDeleteGoal={handleDeleteSavingsGoal}
            />
        ) : currentView === AppView.NET_WORTH ? (
            <NetWorthDashboard
                assets={assets}
                debts={debts}
                currentBalance={currentBalance}
                timelineData={timelineData}
                onAddAsset={handleAddAsset}
                onUpdateAsset={handleUpdateAsset}
                onDeleteAsset={handleDeleteAsset}
            />
        ) : currentView === AppView.CALENDAR ? (
            <SmartBillCalendar
                transactions={transactions}
                projections={projections}
                timelineData={timelineData}
                onAddTransaction={handleAddTransaction}
                onUpdateTransaction={handleUpdateTransaction}
                onUpdateProjection={handleUpdateProjection}
            />
        ) : (
          <>
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
                onMergeScenario={handleMergeScenario}
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
          </>
        )}
      </main>
      
      {/* Footer Info */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <p className="text-xs text-slate-400 font-medium tracking-wide">
             FinVision Planner &bull; Secured with Firebase
           </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
