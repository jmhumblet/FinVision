import React from 'react';
import { useUserData, useMutations } from '../queries/useUserData';
import { auth } from '../services/firebaseService';
import DebtDashboard from '../components/DebtDashboard';
import { Loader2 } from 'lucide-react';
import { DebtStrategy } from '../types';

const DebtPage: React.FC = () => {
  const user = auth.currentUser;
  const { data, isLoading } = useUserData(user?.uid);
  const mutations = useMutations();

  if (isLoading || !data) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <DebtDashboard 
      debts={data.debts || []}
      strategy={data.settings?.debtStrategy || DebtStrategy.SNOWBALL}
      monthlyExtra={data.settings?.debtMonthlyExtra || 0}
      onAddDebt={(item) => mutations.updateDebt.mutate({ uid: user!.uid, item })}
      onUpdateDebt={(item) => mutations.updateDebt.mutate({ uid: user!.uid, item })}
      onDeleteDebt={(id) => mutations.deleteDebt.mutate({ uid: user!.uid, id })}
      onStrategyChange={(strategy) => mutations.updateSettings.mutate({ uid: user!.uid, settings: { debtStrategy: strategy } })}
      onMonthlyExtraChange={(extra) => mutations.updateSettings.mutate({ uid: user!.uid, settings: { debtMonthlyExtra: extra } })}
    />
  );
};

export default DebtPage;
