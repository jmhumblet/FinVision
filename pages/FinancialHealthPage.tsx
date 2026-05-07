import React from 'react';
import { useUserData } from '../queries/useUserData';
import { useAppTimeline } from '../queries/useDomainData';
import { auth } from '../services/firebaseService';
import FinancialHealthDashboard from '../components/FinancialHealthDashboard';
import { Loader2 } from 'lucide-react';

const FinancialHealthPage: React.FC = () => {
  const user = auth.currentUser;
  const { data, isLoading } = useUserData(user?.uid);
  
  const timelineData = useAppTimeline(user?.uid, data?.settings?.projectionDays || 180, []);

  if (isLoading || !data) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  const currentBalance = (() => {
    const lastHistorical = [...timelineData].reverse().find(d => d.historicalBalance !== null);
    return lastHistorical ? (lastHistorical.historicalBalance as number) : (data.settings?.initialBalance || 0);
  })();

  return (
    <FinancialHealthDashboard 
      assets={data.assets || []}
      debts={data.debts || []}
      projections={data.projections || []}
      currentBalance={currentBalance}
      timelineData={timelineData}
    />
  );
};

export default FinancialHealthPage;
