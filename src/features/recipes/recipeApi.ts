import { apiClient, unwrapApiRequest } from '@/services/api';
import type {
  ContentCardData,
  ContentType,
  RecentSearch,
  RecipeDetail,
  SavedItem,
  HomeFeed,
  SearchSuggestion,
} from './types';

export const recipeApi = {
  home: () =>
    unwrapApiRequest<HomeFeed>(() => apiClient.get('/home', { params: { limit: 6 } })),
  list: () =>
    unwrapApiRequest<ContentCardData[]>(() =>
      apiClient.get('/recipes', { params: { page: 1, limit: 20, sort: 'popular' } })
    ),
  search: (query: string, type: ContentType | 'all' = 'all') =>
    unwrapApiRequest<ContentCardData[]>(() =>
      apiClient.get('/search', { params: { q: query, type, page: 1, limit: 30 } })
    ),
  recent: () =>
    unwrapApiRequest<RecentSearch[]>(() =>
      apiClient.get('/search/recent', { params: { page: 1, limit: 10 } })
    ),
  suggestions: (query: string) =>
    unwrapApiRequest<SearchSuggestion[]>(() =>
      apiClient.get('/search/suggestions', { params: { q: query, type: 'all', limit: 8 } })
    ),
  detail: (idOrSlug: string) =>
    unwrapApiRequest<RecipeDetail>(() => apiClient.get(`/recipes/${idOrSlug}`)),
  saved: () =>
    unwrapApiRequest<SavedItem[]>(() =>
      apiClient.get('/saved-items', { params: { page: 1, limit: 30 } })
    ),
  save: (type: 'recipe' | 'post' | 'video', id: string) =>
    unwrapApiRequest(() => apiClient.put(`/saved-items/${type}/${id}`, {})),
  unsave: (type: 'recipe' | 'post' | 'video', id: string) =>
    unwrapApiRequest(() => apiClient.delete(`/saved-items/${type}/${id}`)),
};
