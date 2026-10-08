import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth';
import { recipeApi } from './recipeApi';
import { updateSavedPage, type SavedStateChange } from './savedState';
import type {
  ContentCardData,
  ContentType,
  PageResult,
  RecipeDetail,
  RecipeQuery,
  SavedItem,
  SavedTargetType,
} from './types';

const anonymousAccount = 'anonymous';
const accountKey = (userId?: string | null) => userId ?? anonymousAccount;

export const recipeKeys = {
  home: (userId?: string | null) => ['account', accountKey(userId), 'home'] as const,
  recipes: (userId?: string | null, query: RecipeQuery = {}) =>
    ['account', accountKey(userId), 'recipes', query] as const,
  details: (userId?: string | null) =>
    ['account', accountKey(userId), 'recipes', 'detail'] as const,
  detail: (userId: string | null | undefined, id: string) =>
    [...recipeKeys.details(userId), id] as const,
  search: (
    userId: string | null | undefined,
    query: string,
    type: string,
    filters: RecipeQuery
  ) => ['account', accountKey(userId), 'search', query, type, filters] as const,
  recent: (userId?: string | null) =>
    ['account', accountKey(userId), 'search', 'recent'] as const,
  suggestions: (query: string) => ['search', 'suggestions', query] as const,
  saved: (userId?: string | null) =>
    ['account', accountKey(userId), 'saved-items'] as const,
  categories: ['recipe-categories'] as const,
};

const nextPage = <T>(lastPage: PageResult<T>, pages: PageResult<T>[]) => {
  const current = lastPage.meta?.page ?? pages.length;
  if (lastPage.meta) {
    return current < lastPage.meta.totalPages ? current + 1 : undefined;
  }
  return lastPage.data.length >= 10 ? current + 1 : undefined;
};

export function useHomeFeed() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({ queryKey: recipeKeys.home(userId), queryFn: recipeApi.home });
}

export function useExploreRecipes(filters: RecipeQuery = {}) {
  const userId = useAuthStore((state) => state.user?.id);
  return useInfiniteQuery({
    queryKey: recipeKeys.recipes(userId, filters),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => recipeApi.list({ ...filters, page: pageParam }),
    getNextPageParam: nextPage,
  });
}

export function useSearchResults(
  query: string,
  type: ContentType | 'all' = 'all',
  filters: RecipeQuery = {}
) {
  const userId = useAuthStore((state) => state.user?.id);
  return useInfiniteQuery({
    queryKey: recipeKeys.search(userId, query, type, filters),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      recipeApi.search(query, type, { ...filters, page: pageParam }),
    getNextPageParam: nextPage,
    enabled: query.trim().length > 0,
  });
}

export function useRecentSearches() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: recipeKeys.recent(userId),
    queryFn: recipeApi.recent,
  });
}

export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: recipeKeys.suggestions(query),
    queryFn: () => recipeApi.suggestions(query),
    enabled: query.trim().length > 0,
  });
}

export function useRecipeDetail(id: string) {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: recipeKeys.detail(userId, id),
    queryFn: () => recipeApi.detail(id),
    enabled: Boolean(id),
  });
}

export function useRecipeCategories() {
  return useQuery({
    queryKey: recipeKeys.categories,
    queryFn: recipeApi.categories,
    staleTime: 1000 * 60 * 30,
  });
}

export function useSavedItems() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: recipeKeys.saved(userId),
    queryFn: () => recipeApi.saved(),
    enabled: Boolean(userId),
  });
}

export function useSavedState(targetType: SavedTargetType, targetId: string) {
  const savedItems = useSavedItems();
  return {
    ...savedItems,
    isSaved: Boolean(
      savedItems.data?.data.some(
        (saved) => saved.targetType === targetType && saved.targetId === targetId
      )
    ),
  };
}

type SavedMutationVariables = SavedStateChange;

type SavedMutationContext = {
  savedPage?: PageResult<SavedItem>;
  details: Array<[readonly unknown[], RecipeDetail | undefined]>;
};

export function useSavedMutation() {
  const client = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const savedKey = recipeKeys.saved(userId);
  const detailsKey = recipeKeys.details(userId);

  return useMutation<unknown, Error, SavedMutationVariables, SavedMutationContext>({
    mutationKey: ['account', accountKey(userId), 'saved-items', 'mutation'],
    mutationFn: ({ type, id, saved }) =>
      saved ? recipeApi.unsave(type, id) : recipeApi.save(type, id),
    onMutate: async (variables) => {
      if (!userId) throw new Error('Authentication is required');
      await Promise.all([
        client.cancelQueries({ queryKey: savedKey }),
        client.cancelQueries({ queryKey: detailsKey }),
      ]);
      const savedPage = client.getQueryData<PageResult<SavedItem>>(savedKey);
      const details = client.getQueriesData<RecipeDetail>({ queryKey: detailsKey });
      client.setQueryData(savedKey, updateSavedPage(savedPage, variables, userId));
      for (const [key, detail] of details) {
        if (detail?._id === variables.id) {
          client.setQueryData(key, {
            ...detail,
            saved: !variables.saved,
            isSaved: !variables.saved,
          });
        }
      }
      return { savedPage, details };
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      client.setQueryData(savedKey, context.savedPage);
      for (const [key, detail] of context.details) client.setQueryData(key, detail);
    },
    onSettled: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: savedKey }),
        client.invalidateQueries({ queryKey: detailsKey }),
        client.invalidateQueries({ queryKey: recipeKeys.home(userId) }),
      ]);
    },
  });
}
