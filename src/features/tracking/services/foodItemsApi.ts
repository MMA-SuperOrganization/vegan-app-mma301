import { apiClient, unwrapApiPageRequest } from '@/services/api';
import type { FoodItemOption } from '../types';

export const foodItemsApi = {
  /** Public endpoint; `q` matches the food name and aliases. */
  list: ({
    q,
    page = 1,
    limit = 20,
  }: {
    q?: string;
    page?: number;
    limit?: number;
  }) =>
    unwrapApiPageRequest<FoodItemOption>(() =>
      apiClient.get('/food-items', {
        params: q ? { q, page, limit } : { page, limit },
      })
    ),
};
