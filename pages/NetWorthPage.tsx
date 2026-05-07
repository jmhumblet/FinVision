import React from 'react';
import { useUserData, useMutations } from '../queries/useUserData';
import { useAppTimeline } from '../queries/useDomainData';
import { auth } from '../services/firebaseService';
import NetWorthDashboard from '../components/NetWorthDashboard';
import { Loader2 } from 'lucide-react';

const NetWorthPage: React.FC = () => {
  const user = auth.currentUser;
  const { data, isLoading } = useUserData(user?.uid);
  const mutations = useMutations();
  
  const timelineData = useAppTimeline(user?.uid, data?.settings?.projectionDays || 180, []);

  if (isLoading || !data) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  const currentBalance = (() => {
    const lastHistorical = [...timelineData].reverse().find(d => d.historicalBalance !== null);
    return lastHistorical ? (lastHistorical.historicalBalance as number) : (data.settings?.initialBalance || 0);
  })();

  return (
    <NetWorthDashboard 
      assets={data.assets || []}
      debts={data.debts || []}
      currentBalance={currentBalance}
      timelineData={timelineData}
      onAddAsset={(item) => mutations.updateAsset.mutate({ uid: user!.uid, item })}
      onUpdateAsset={(item) => mutations.updateAsset.mutate({ uid: user!.uid, item })}
      onDeleteAsset={(id) => mutations.deleteAsset.mutate({ uid: user!.uid, id })}
    />
  );
};

export default NetWorthPage;
