import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth';
import { advancedPantryApi } from './advancedApi';
import type { PantryItemInput } from './types';
export function useAdvancedPantry(days: number) {
  const userId = useAuthStore((state) => state.user?.id);
  const client = useQueryClient();
  const root = ['account', userId, 'pantry'];
  return {
    suggestions: useQuery({
      queryKey: [...root, 'suggestions'],
      queryFn: advancedPantryApi.suggestions,
      enabled: Boolean(userId),
    }),
    expiring: useQuery({
      queryKey: [...root, 'expiring', days],
      queryFn: () => advancedPantryApi.expiring(days),
      enabled: Boolean(userId),
    }),
    bulk: useMutation({
      mutationFn: ({ items, key }: { items: PantryItemInput[]; key: string }) =>
        advancedPantryApi.bulk(items, key),
      onSuccess: () => client.invalidateQueries({ queryKey: root }),
    }),
  };
}
