import { apiClient, unwrapApiPageRequest, unwrapApiRequest } from '@/services/api';
import type {
  Category,
  AllergenSummary,
  ContentCardData,
  ContentType,
  PageResult,
  RecentSearch,
  RecipeQuery,
  RecipeDetail,
  SavedItem,
  SavedTargetType,
  HomeFeed,
  FoodItem,
  FoodQuery,
  SearchSuggestion,
} from './types';

const compactParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
  );

const pageRequest = <T>(path: string, params: Record<string, unknown>) =>
  unwrapApiPageRequest<T>(() =>
    apiClient.get(path, { params: compactParams(params) })
  );

export const recipeApi = {
  home: () =>
    unwrapApiRequest<HomeFeed>(() =>
      apiClient.get('/home', { params: { limit: 6 } })
    ),
  list: (query: RecipeQuery = {}): Promise<PageResult<ContentCardData>> =>
    pageRequest('/recipes', {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      sort: query.sort ?? 'popular',
      category: query.category,
      difficulty: query.difficulty,
      maxTotalMinutes: query.maxTotalMinutes,
      dietType: query.dietType,
      excludeAllergenIds: query.excludeAllergenIds,
    }),
  search: (
    query: string,
    type: ContentType | 'all' = 'all',
    filters: RecipeQuery = {}
  ): Promise<PageResult<ContentCardData>> =>
    pageRequest('/search', {
      q: query,
      type,
      page: filters.page ?? 1,
      limit: filters.limit ?? 10,
      category: filters.category,
      difficulty: filters.difficulty,
      maxTotalMinutes: filters.maxTotalMinutes,
      dietType: filters.dietType,
      sort: filters.sort ?? 'popular',
      excludeAllergenIds: filters.excludeAllergenIds,
    }),
  recent: () =>
    unwrapApiRequest<RecentSearch[]>(() =>
      apiClient.get('/search/recent', { params: { page: 1, limit: 10 } })
    ),
  suggestions: (query: string) =>
    unwrapApiRequest<SearchSuggestion[]>(() =>
      apiClient.get('/search/suggestions', {
        params: { q: query, type: 'all', limit: 8 },
      })
    ),
  detail: async (idOrSlug: string) => {
    const recipe = await unwrapApiRequest<RecipeDetail>(() =>
      apiClient.get(`/recipes/${idOrSlug}`)
    );
    return { ...recipe, isSaved: recipe.isSaved ?? recipe.saved ?? false };
  },
  foods: (query: FoodQuery = {}): Promise<PageResult<FoodItem>> =>
    pageRequest('/food-items', {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      q: query.q,
      category: query.category,
      excludeAllergenIds: query.excludeAllergenIds,
      isVegan: query.isVegan ?? true,
      sort: query.sort ?? 'name',
    }),
  foodDetail: (id: string) =>
    unwrapApiRequest<FoodItem>(() => apiClient.get(`/food-items/${id}`)),
  categories: (type?: Category['type']) =>
    pageRequest<Category>('/categories', { type, page: 1, limit: 100 }),
  allergens: () =>
    pageRequest<AllergenSummary>('/allergens', { page: 1, limit: 100 }),
  saved: (page = 1) => pageRequest<SavedItem>('/saved-items', { page, limit: 50 }),
  save: (type: SavedTargetType, id: string) =>
    unwrapApiRequest(() => apiClient.put(`/saved-items/${type}/${id}`, {})),
  unsave: (type: SavedTargetType, id: string) =>
    unwrapApiRequest(() => apiClient.delete(`/saved-items/${type}/${id}`)),
};
