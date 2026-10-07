import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recipeApi } from './recipeApi';
import type { ContentType } from './types';

export const recipeKeys = {
  home: ['home'] as const,
  all: ['recipes'] as const,
  detail: (id: string) => ['recipes', 'detail', id] as const,
  search: (query: string, type: string) => ['search', query, type] as const,
  recent: ['search', 'recent'] as const,
  suggestions: (query: string) => ['search', 'suggestions', query] as const,
  saved: ['saved-items'] as const,
};

export function useHomeFeed() {
  return useQuery({ queryKey: recipeKeys.home, queryFn: recipeApi.home });
}

export function useExploreRecipes() {
  return useQuery({ queryKey: recipeKeys.all, queryFn: recipeApi.list });
}

export function useSearchResults(query: string, type: ContentType | 'all' = 'all') {
  return useQuery({
    queryKey: recipeKeys.search(query, type),
    queryFn: () => recipeApi.search(query, type),
    enabled: query.trim().length > 0,
  });
}

export function useRecentSearches() {
  return useQuery({ queryKey: recipeKeys.recent, queryFn: recipeApi.recent });
}

export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: recipeKeys.suggestions(query),
    queryFn: () => recipeApi.suggestions(query),
    enabled: query.trim().length > 0,
  });
}

export function useRecipeDetail(id: string) {
  return useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: () => recipeApi.detail(id),
    enabled: Boolean(id),
  });
}

export function useSavedItems() {
  return useQuery({ queryKey: recipeKeys.saved, queryFn: recipeApi.saved });
}

export function useSavedMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id, saved }: { type: 'recipe' | 'post' | 'video'; id: string; saved: boolean }) =>
      saved ? recipeApi.unsave(type, id) : recipeApi.save(type, id),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        client.invalidateQueries({ queryKey: recipeKeys.saved }),
        client.invalidateQueries({ queryKey: recipeKeys.detail(variables.id) }),
      ]);
    },
  });
}
