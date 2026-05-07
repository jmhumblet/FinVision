import React from 'react';
import { useUserData } from '../queries/useUserData';
import { auth } from '../services/firebaseService';
import DataViewer from '../components/DataViewer';
import { Loader2 } from 'lucide-react';

const DataViewerPage: React.FC = () => {
  const user = auth.currentUser;
  const { data, isLoading } = useUserData(user?.uid);

  if (isLoading || !data) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <DataViewer 
      transactions={data.transactions || []}
      projections={data.projections || []}
      debts={data.debts || []}
      assets={data.assets || []}
      savingsGoals={data.savingsGoals || []}
      scenarios={[]}
    />
  );
};

export default DataViewerPage;
