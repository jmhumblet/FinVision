import React from 'react';
import { useUserData, useMutations } from '../queries/useUserData';
import { auth } from '../services/firebaseService';
import SubscriptionManager from '../components/SubscriptionManager';
import { Loader2 } from 'lucide-react';

const SubscriptionsPage: React.FC = () => {
  const user = auth.currentUser;
  const { data, isLoading } = useUserData(user?.uid);
  const mutations = useMutations();

  if (isLoading || !data) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <SubscriptionManager 
      projections={data.projections || []}
      categories={data.settings?.categories || []}
      onUpdateProjection={(item) => mutations.updateProjection.mutate({ uid: user!.uid, item })}
    />
  );
};

export default SubscriptionsPage;
