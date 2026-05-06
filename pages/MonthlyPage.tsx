import React from 'react';
import { useUserData, useMutations } from '../queries/useUserData';
import { auth } from '../services/firebaseService';
import MonthlyDashboard from '../components/MonthlyDashboard';
import { Loader2 } from 'lucide-react';

const MonthlyPage: React.FC = () => {
  const user = auth.currentUser;
  const { data, isLoading } = useUserData(user?.uid);
  const mutations = useMutations();

  if (isLoading || !data) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <MonthlyDashboard 
      transactions={data.transactions}
      projections={data.projections}
      categories={data.settings?.categories || []}
      monthlySetup={null} // Currently not stored in useUserData directly, will need to be added or fetched separately
      onAddTransaction={(item) => mutations.updateTransaction.mutate({ uid: user!.uid, item })}
      onUpdateTransaction={(item) => mutations.updateTransaction.mutate({ uid: user!.uid, item })}
      onDeleteTransaction={(id) => mutations.deleteTransaction.mutate({ uid: user!.uid, id })}
      onAddProjection={(item) => mutations.updateProjection.mutate({ uid: user!.uid, item })}
      onUpdateProjection={(item) => mutations.updateProjection.mutate({ uid: user!.uid, item })}
      onDeleteProjection={(id) => mutations.deleteProjection.mutate({ uid: user!.uid, id })}
    />
  );
};

export default MonthlyPage;
