import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth';
import { advancedPantryApi } from './advancedApi';
import type { PantryItemInput } from './types';
export function useAdvancedPantry(days: number) {
  const userId = useAuthStore((state) => state.user?.id);
  const client = useQueryClient();
  const root = ['account', userId, 'pantry'];
  const automation = useQuery({
    queryKey: [...root, 'automation'],
    queryFn: advancedPantryApi.automation,
    enabled: Boolean(userId),
  });
  const restock = useQuery({
    queryKey: [...root, 'restock', automation.data?.restockThresholdGrams ?? 100],
    queryFn: () =>
      advancedPantryApi.restock(automation.data?.restockThresholdGrams ?? 100),
    enabled: Boolean(userId) && automation.data?.restockSuggestionsEnabled !== false,
  });
  const saveAutomation = useMutation({
    mutationFn: (input: Partial<NonNullable<typeof automation.data>>) =>
      advancedPantryApi.updateAutomation({
        ...(automation.data ?? {
          autoDeductOnMealCompletion: false,
          expiryTrackingEnabled: true,
          expiryLeadDays: 2,
          restockSuggestionsEnabled: true,
          restockThresholdGrams: 100,
        }),
        ...input,
      }),
    onSuccess: (value) => {
      client.setQueryData([...root, 'automation'], value);
      void client.invalidateQueries({ queryKey: root });
    },
  });
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
    automation,
    restock,
    saveAutomation,
    bulk: useMutation({
      mutationFn: ({ items, key }: { items: PantryItemInput[]; key: string }) =>
        advancedPantryApi.bulk(items, key),
      onSuccess: () => client.invalidateQueries({ queryKey: root }),
    }),
  };
}
