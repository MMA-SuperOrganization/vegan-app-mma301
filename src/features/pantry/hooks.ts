import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth';
import { foodItemsApi } from '@/features/tracking/services/foodItemsApi';
import { useDebouncedValue } from '@/hooks';
import { pantryApi } from './pantryApi';
import type { Pantry, PantryItemInput, PantryItemUpdate } from './types';

const pantryKey = (userId?: string) => ['account', userId, 'pantry'] as const;

export function usePantry() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: pantryKey(userId),
    queryFn: pantryApi.get,
    enabled: Boolean(userId),
  });
}

export function usePantryActions() {
  const client = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const storePantry = async (pantry: Pantry) => {
    await client.cancelQueries({ queryKey: pantryKey(userId) });
    client.setQueryData(pantryKey(userId), pantry);
    await client.invalidateQueries({ queryKey: pantryKey(userId) });
  };
  const addItem = useMutation({
    mutationFn: (input: PantryItemInput) => pantryApi.addItem(input),
    onSuccess: storePantry,
  });
  const updateItem = useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: PantryItemUpdate }) =>
      pantryApi.updateItem(itemId, input),
    onSuccess: storePantry,
  });
  const deleteItem = useMutation({
    mutationFn: pantryApi.deleteItem,
    onSuccess: storePantry,
  });
  return { addItem, updateItem, deleteItem };
}

export function usePantryFoodOptions(search: string, enabled: boolean) {
  const term = useDebouncedValue(search.trim(), 300);
  return useInfiniteQuery({
    queryKey: ['food-items', 'pantry-picker', term],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      foodItemsApi.list({ q: term || undefined, page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) =>
      lastPage.meta && lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined,
    enabled,
  });
}
