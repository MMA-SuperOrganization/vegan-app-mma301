import { useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '@/hooks';
import { recipeApi } from '@/features/recipes/recipeApi';
import { foodItemsApi } from '../services/foodItemsApi';

const PICKER_LIMIT = 20;

/** Recipes for the diary picker: the popular list, or search results by name. */
export function useRecipeOptions(query: string, enabled: boolean) {
  const term = useDebouncedValue(query.trim(), 300);
  return useQuery({
    queryKey: ['tracking', 'recipe-options', term],
    queryFn: () =>
      term
        ? recipeApi.search(term, 'recipe', { limit: PICKER_LIMIT })
        : recipeApi.list({ limit: PICKER_LIMIT }),
    enabled,
  });
}

export function useFoodOptions(query: string, enabled: boolean) {
  const term = useDebouncedValue(query.trim(), 300);
  return useQuery({
    queryKey: ['tracking', 'food-options', term],
    queryFn: () => foodItemsApi.list({ q: term || undefined, limit: PICKER_LIMIT }),
    enabled,
  });
}
