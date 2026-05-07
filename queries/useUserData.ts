import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchUserData, 
  updateRemoteTransaction, 
  deleteRemoteTransaction,
  updateRemoteProjection,
  deleteRemoteProjection,
  updateRemoteSettings,
  saveMonthlySetup,
  updateRemoteDebt,
  deleteRemoteDebt,
  updateRemoteSavingsGoal,
  deleteRemoteSavingsGoal,
  updateRemoteAsset,
  deleteRemoteAsset
} from '../services/firebaseService';
import { Transaction, Projection, Debt, SavingsGoal, Asset, MonthlySetup } from '../types';

export const USER_DATA_QUERY_KEY = ['userData'];

export const useUserData = (uid: string | undefined) => {
  return useQuery({
    queryKey: [...USER_DATA_QUERY_KEY, uid],
    queryFn: () => fetchUserData(uid!),
    enabled: !!uid,
  });
};

// Generic mutation factory for optimistic updates
function createOptimisticMutation<T extends { id: string }>(
  queryClient: ReturnType<typeof useQueryClient>,
  mutationFn: (uid: string, item: T) => Promise<void>,
  collectionKey: keyof Awaited<ReturnType<typeof fetchUserData>>
) {
  return useMutation({
    mutationFn: ({ uid, item }: { uid: string; item: T }) => mutationFn(uid, item),
    onMutate: async ({ uid, item }) => {
      await queryClient.cancelQueries({ queryKey: [...USER_DATA_QUERY_KEY, uid] });
      const previousData = queryClient.getQueryData([...USER_DATA_QUERY_KEY, uid]);
      
      queryClient.setQueryData([...USER_DATA_QUERY_KEY, uid], (old: any) => {
        if (!old) return old;
        const collection = old[collectionKey] as T[];
        const exists = collection.find(i => i.id === item.id);
        return {
          ...old,
          [collectionKey]: exists 
            ? collection.map(i => i.id === item.id ? item : i)
            : [item, ...collection]
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData([...USER_DATA_QUERY_KEY, variables.uid], context.previousData);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: [...USER_DATA_QUERY_KEY, variables.uid] });
    },
  });
}

function createDeleteMutation(
  queryClient: ReturnType<typeof useQueryClient>,
  mutationFn: (uid: string, id: string) => Promise<void>,
  collectionKey: keyof Awaited<ReturnType<typeof fetchUserData>>
) {
  return useMutation({
    mutationFn: ({ uid, id }: { uid: string; id: string }) => mutationFn(uid, id),
    onMutate: async ({ uid, id }) => {
      await queryClient.cancelQueries({ queryKey: [...USER_DATA_QUERY_KEY, uid] });
      const previousData = queryClient.getQueryData([...USER_DATA_QUERY_KEY, uid]);
      
      queryClient.setQueryData([...USER_DATA_QUERY_KEY, uid], (old: any) => {
        if (!old) return old;
        const collection = old[collectionKey] as any[];
        return {
          ...old,
          [collectionKey]: collection.filter(i => i.id !== id)
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData([...USER_DATA_QUERY_KEY, variables.uid], context.previousData);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: [...USER_DATA_QUERY_KEY, variables.uid] });
    },
  });
}

export const useMutations = () => {
  const queryClient = useQueryClient();

  return {
    updateTransaction: createOptimisticMutation<Transaction>(queryClient, updateRemoteTransaction, 'transactions'),
    deleteTransaction: createDeleteMutation(queryClient, deleteRemoteTransaction, 'transactions'),
    
    updateProjection: createOptimisticMutation<Projection>(queryClient, updateRemoteProjection, 'projections'),
    deleteProjection: createDeleteMutation(queryClient, deleteRemoteProjection, 'projections'),

    updateDebt: createOptimisticMutation<Debt>(queryClient, updateRemoteDebt, 'debts'),
    deleteDebt: createDeleteMutation(queryClient, deleteRemoteDebt, 'debts'),

    updateSavingsGoal: createOptimisticMutation<SavingsGoal>(queryClient, updateRemoteSavingsGoal, 'savingsGoals'),
    deleteSavingsGoal: createDeleteMutation(queryClient, deleteRemoteSavingsGoal, 'savingsGoals'),

    updateAsset: createOptimisticMutation<Asset>(queryClient, updateRemoteAsset, 'assets'),
    deleteAsset: createDeleteMutation(queryClient, deleteRemoteAsset, 'assets'),

    updateSettings: useMutation({
        mutationFn: ({ uid, settings }: { uid: string; settings: any }) => updateRemoteSettings(uid, settings),
        onMutate: async ({ uid, settings }) => {
            await queryClient.cancelQueries({ queryKey: [...USER_DATA_QUERY_KEY, uid] });
            const previousData = queryClient.getQueryData([...USER_DATA_QUERY_KEY, uid]);
            queryClient.setQueryData([...USER_DATA_QUERY_KEY, uid], (old: any) => ({
                ...old,
                settings: { ...old.settings, ...settings }
            }));
            return { previousData };
        },
        onError: (err, variables, context) => {
            if (context?.previousData) {
              queryClient.setQueryData([...USER_DATA_QUERY_KEY, variables.uid], context.previousData);
            }
        },
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({ queryKey: [...USER_DATA_QUERY_KEY, variables.uid] });
        }
    }),

    saveMonthlySetup: useMutation({
        mutationFn: ({ uid, setup }: { uid: string; setup: MonthlySetup }) => saveMonthlySetup(uid, setup),
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({ queryKey: [...USER_DATA_QUERY_KEY, variables.uid] });
        }
    })
  };
};
