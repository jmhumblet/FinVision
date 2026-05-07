import React from 'react';
import { useUserData, useMutations } from '../queries/useUserData';
import { useAppTimeline } from '../queries/useDomainData';
import { auth } from '../services/firebaseService';
import SmartBillCalendar from '../components/SmartBillCalendar';
import { Loader2 } from 'lucide-react';

const BillCalendarPage: React.FC = () => {
  const user = auth.currentUser;
  const { data, isLoading } = useUserData(user?.uid);
  const mutations = useMutations();
  
  const timelineData = useAppTimeline(user?.uid, data?.settings?.projectionDays || 180, []);

  if (isLoading || !data) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <SmartBillCalendar 
      transactions={data.transactions || []}
      projections={data.projections || []}
      categories={data.settings?.categories || []}
      timelineData={timelineData}
      onAddTransaction={(item) => mutations.updateTransaction.mutate({ uid: user!.uid, item })}
      onUpdateTransaction={(item) => mutations.updateTransaction.mutate({ uid: user!.uid, item })}
      onDeleteTransaction={(id) => mutations.deleteTransaction.mutate({ uid: user!.uid, id })}
      onAddProjection={(item) => mutations.updateProjection.mutate({ uid: user!.uid, item })}
      onUpdateProjection={(item) => mutations.updateProjection.mutate({ uid: user!.uid, item })}
      onDeleteProjection={(id) => mutations.deleteProjection.mutate({ uid: user!.uid, id })}
    />
  );
};

export default BillCalendarPage;
