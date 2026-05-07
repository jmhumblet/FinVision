import React from 'react';
import { useUserData, useMutations } from '../queries/useUserData';
import { useAppTimeline } from '../queries/useDomainData';
import { useAppStore } from '../store/useAppStore';
import { auth } from '../services/firebaseService';
import MonthlyDashboard from '../components/MonthlyDashboard';
import { Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { TransactionType } from '../types';
import { useNavigate } from 'react-router-dom';
import { calculateMonthlySummary, getMonthKey } from '../utils/financialUtils';

const MonthlyPage: React.FC = () => {
  const user = auth.currentUser;
  const { data, isLoading } = useUserData(user?.uid);
  const mutations = useMutations();
  const navigate = useNavigate();
  const { selectedMonthDate, setSelectedMonthDate, setShowReconciliationModal } = useAppStore();

  const timelineData = useAppTimeline(user?.uid, data?.settings?.projectionDays || 180, []);

  if (isLoading || !data) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  const monthKey = getMonthKey(selectedMonthDate);
  // Temporary simplified summary calculation until monthlySetup state is properly ported
  const summary = calculateMonthlySummary(
    monthKey,
    data.settings?.initialBalance || 0,
    [],
    data.projections || []
  );

  return (
    <MonthlyDashboard 
      summary={summary}
      selectedDate={selectedMonthDate}
      onNavigate={(date) => setSelectedMonthDate(date)}
      onSwitchView={() => navigate('/')}
      onOpenSettings={() => setShowReconciliationModal(true)}
      transactions={data.transactions || []}
      projections={data.projections || []}
      categories={data.settings?.categories || []}
      onAddTransaction={() => {
        mutations.updateTransaction.mutate({ 
          uid: user!.uid, 
          item: { id: `manual-${uuidv4()}`, date: new Date().toISOString().split('T')[0], description: 'New Transaction', amount: 0, categoryId: '8', type: TransactionType.EXPENSE, skipAutoCategorization: false }
        });
      }}
      onUpdateTransaction={(item) => mutations.updateTransaction.mutate({ uid: user!.uid, item })}
      onDeleteTransaction={(id) => mutations.deleteTransaction.mutate({ uid: user!.uid, id })}
      onAddProjection={() => {
        mutations.updateProjection.mutate({ 
          uid: user!.uid, 
          item: { id: uuidv4(), name: 'New Item', amount: 0, frequency: 'once' as any, startDate: new Date().toISOString().split('T')[0], categoryId: '8', type: TransactionType.EXPENSE, isActive: true }
        });
      }}
      onUpdateProjection={(item) => mutations.updateProjection.mutate({ uid: user!.uid, item })}
      onDeleteProjection={(id) => mutations.deleteProjection.mutate({ uid: user!.uid, id })}
      onUpdateCategories={(categories) => mutations.updateSettings.mutate({ uid: user!.uid, settings: { categories } })}
    />
  );
};

export default MonthlyPage;
