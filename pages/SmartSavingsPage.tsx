import React from 'react';
import { useUserData, useMutations } from '../queries/useUserData';
import { auth } from '../services/firebaseService';
import SmartSavingsDashboard from '../components/SmartSavingsDashboard';
import { Loader2 } from 'lucide-react';

const SmartSavingsPage: React.FC = () => {
  const user = auth.currentUser;
  const { data, isLoading } = useUserData(user?.uid);
  const mutations = useMutations();

  if (isLoading || !data) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <SmartSavingsDashboard 
      goals={data.savingsGoals || []}
      onAddGoal={(item) => mutations.updateSavingsGoal.mutate({ uid: user!.uid, item })}
      onUpdateGoal={(item) => mutations.updateSavingsGoal.mutate({ uid: user!.uid, item })}
      onDeleteGoal={(id) => mutations.deleteSavingsGoal.mutate({ uid: user!.uid, id })}
    />
  );
};

export default SmartSavingsPage;
