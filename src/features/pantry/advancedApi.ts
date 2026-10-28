import { apiClient, unwrapApiPageRequest, unwrapApiRequest } from '@/services/api';
import { collectPages } from '@/services/api/collectPages';
import type { RecipeDetail } from '@/features/recipes/types';
import type { Pantry, PantryItem, PantryItemInput } from './types';

export interface PantrySuggestion {
  recipe: RecipeDetail;
  matchRatio: number;
  matchedCount: number;
  sufficientCount: number;
  missingIngredients: Array<{
    foodItemId: string;
    foodNameSnapshot?: string;
    quantity: number;
    unit: string;
  }>;
}
export const advancedPantryApi = {
  suggestions: () =>
    collectPages((page) =>
      unwrapApiPageRequest<PantrySuggestion>(() =>
        apiClient.get('/pantry/recipe-suggestions', { params: { page, limit: 50 } })
      )
    ).then((result) => ({
      ...result,
      data: result.data.sort(
        (a, b) =>
          b.matchRatio - a.matchRatio || b.sufficientCount - a.sufficientCount
      ),
    })),
  expiring: (days: number) =>
    collectPages((page) =>
      unwrapApiPageRequest<PantryItem>(() =>
        apiClient.get('/pantry/expiring', {
          params: { page, limit: 100, days, includeExpired: 'true' },
        })
      )
    ),
  bulk: (items: PantryItemInput[], idempotencyKey: string) =>
    unwrapApiRequest<Pantry>(() =>
      apiClient.post('/pantry/items/bulk', { items, idempotencyKey })
    ),
};
