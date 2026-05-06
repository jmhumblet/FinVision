import { useMemo } from 'react';
import { useUserData } from './useUserData';
import { generateTimeline } from '../utils/financialUtils';
import { DailyBalance } from '../types';

export const useAppTimeline = (uid: string | undefined, projectionDays: number, scenarios: any[]) => {
  const { data } = useUserData(uid);

  return useMemo(() => {
    if (!data) return [];
    
    return generateTimeline(
      data.settings.initialBalance || 0,
      data.transactions || [],
      data.projections || [],
      projectionDays,
      scenarios
    ) as DailyBalance[];
  }, [data, projectionDays, scenarios]);
};
