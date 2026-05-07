import React, { useState } from 'react';
import { useUserData, useMutations } from '../queries/useUserData';
import { useAppTimeline } from '../queries/useDomainData';
import { auth } from '../services/firebaseService';
import { formatCurrency } from '../utils/financialUtils';
import { calculateMergeChanges } from '../utils/scenarioUtils';
import { TrendingUp, Scale, AlertCircle, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import SafeToSpendCard from '../components/SafeToSpendCard';
import CashFlowAlerts from '../components/CashFlowAlerts';
import ScenarioBuilder from '../components/ScenarioBuilder';
import FinancialChart from '../components/FinancialChart';
import TransactionTable from '../components/TransactionTable';
import ProjectionTable from '../components/ProjectionTable';
import { Transaction, TransactionType } from '../types';

const DashboardPage: React.FC = () => {
  const user = auth.currentUser;
  const { data, isLoading } = useUserData(user?.uid);
  const mutations = useMutations();
  const [scenarios, setScenarios] = useState<any[]>([]);

  const timelineData = useAppTimeline(user?.uid, data?.settings?.projectionDays || 180, scenarios);

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-400 mt-4">Loading Data...</p>
      </div>
    );
  }

  const { transactions, projections, settings } = data;
  const projectionDays = settings?.projectionDays || 180;
  const categories = settings?.categories || [];

  const loadedInitialBalance = settings?.initialBalance || 0;
  
  const currentBalance = (() => {
    const lastHistorical = [...timelineData].reverse().find(d => d.historicalBalance !== null);
    return lastHistorical ? (lastHistorical.historicalBalance as number) : loadedInitialBalance;
  })();

  const projectedFinalBalance = (() => {
    const last = timelineData[timelineData.length - 1];
    if (!last) return currentBalance;
    return last.projectedBalance !== null ? last.projectedBalance : (last.historicalBalance || 0);
  })();

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
      type: diff > 0 ? TransactionType.INCOME : TransactionType.EXPENSE,
      skipAutoCategorization: false
    };

    mutations.updateTransaction.mutate({ uid: user!.uid, item: correctionTx });
    alert(`Balance aligned. Added a ${formatCurrency(Math.abs(diff))} ${diff > 0 ? 'Income' : 'Expense'} adjustment.`);
  };

  const handleMergeScenario = async (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario || !user) return;

    const changes = calculateMergeChanges(projections, scenario);

    // Sequential updates to avoid overwhelming Firebase mock/real
    for (const p of changes.toAdd) {
        await mutations.updateProjection.mutateAsync({ uid: user.uid, item: p });
    }
    for (const p of changes.toUpdate) {
        await mutations.updateProjection.mutateAsync({ uid: user.uid, item: p });
    }
    for (const id of changes.toDelete) {
        await mutations.deleteProjection.mutateAsync({ uid: user.uid, id });
    }

    setScenarios(prev => prev.filter(s => s.id !== scenarioId));
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

        <SafeToSpendCard currentBalance={currentBalance} projections={projections} />
      </div>

      <CashFlowAlerts timelineData={timelineData} />

      <ScenarioBuilder 
        projections={projections} 
        scenarios={scenarios}
        onAddScenario={s => setScenarios([...scenarios, s])}
        onUpdateScenario={s => setScenarios(prev => prev.map(old => old.id === s.id ? s : old))}
        onDeleteScenario={id => setScenarios(prev => prev.filter(s => s.id !== id))}
        onMergeScenario={handleMergeScenario}
      />

      <div className="relative mb-8">
        <FinancialChart data={timelineData} scenarios={scenarios} />
      </div>

      <div className="flex flex-col space-y-8">
        <TransactionTable 
          transactions={transactions} 
          categories={categories}
          onUpdateTransaction={(item) => mutations.updateTransaction.mutate({ uid: user!.uid, item })}
          onDeleteTransaction={(id) => mutations.deleteTransaction.mutate({ uid: user!.uid, id })}
          onAddTransaction={() => {
            mutations.updateTransaction.mutate({ 
              uid: user!.uid, 
              item: { id: `manual-${uuidv4()}`, date: new Date().toISOString().split('T')[0], description: 'New Transaction', amount: 0, categoryId: '8', type: TransactionType.EXPENSE, skipAutoCategorization: false }
            });
          }}
        />
        <ProjectionTable
          projections={projections}
          categories={categories}
          onUpdateProjection={(item) => mutations.updateProjection.mutate({ uid: user!.uid, item })}
          onDeleteProjection={(id) => mutations.deleteProjection.mutate({ uid: user!.uid, id })}
          onAddProjection={() => {
            mutations.updateProjection.mutate({ 
              uid: user!.uid, 
              item: { id: uuidv4(), name: 'New Item', amount: 0, frequency: 'once' as any, startDate: new Date().toISOString().split('T')[0], categoryId: '8', type: TransactionType.EXPENSE, isActive: true }
            });
          }}
        />
      </div>
    </>
  );
};

export default DashboardPage;
