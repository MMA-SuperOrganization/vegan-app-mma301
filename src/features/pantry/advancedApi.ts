import { apiClient, unwrapApiPageRequest, unwrapApiRequest } from '@/services/api';
import { collectPages } from '@/services/api/collectPages';
import type { RecipeDetail } from '@/features/recipes/types';
import type {
  Pantry,
  PantryAutomation,
  PantryItem,
  PantryItemInput,
  PantryRestockSuggestion,
} from './types';

const defaultAutomation: PantryAutomation = {
  autoDeductOnMealCompletion: false,
  expiryTrackingEnabled: true,
  expiryLeadDays: 2,
  restockSuggestionsEnabled: true,
  restockThresholdGrams: 100,
};

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
  automation: () =>
    unwrapApiRequest<{ profile?: { kitchenAutomation?: PantryAutomation } | null }>(
      () => apiClient.get('/users/me')
    ).then((result) => ({
      ...defaultAutomation,
      ...(result.profile?.kitchenAutomation ?? {}),
    })),
  updateAutomation: (input: PantryAutomation) =>
    unwrapApiRequest<{ kitchenAutomation?: PantryAutomation }>(() =>
      apiClient.put('/profiles/me', { kitchenAutomation: input })
    ).then((profile) => ({
      ...defaultAutomation,
      ...(profile.kitchenAutomation ?? input),
    })),
  restock: async (thresholdGrams: number) => {
    const pantry = await unwrapApiRequest<Pantry>(() => apiClient.get('/pantry'));
    const now = Date.now();
    const grouped = new Map<string, PantryRestockSuggestion>();
    for (const item of pantry.items) {
      if (!item.foodItemId || !['g', 'kg'].includes(item.unit)) continue;
      const grams = item.unit === 'kg' ? item.quantity * 1000 : item.quantity;
      const current = grouped.get(item.foodItemId) ?? {
        foodItemId: item.foodItemId,
        foodNameSnapshot: item.foodNameSnapshot,
        availableGrams: 0,
        expiredGrams: 0,
        earliestExpiry: null,
        suggestedQuantityGrams: 0,
        reason: 'low_stock',
      };
      if (item.expiresAt && new Date(item.expiresAt).getTime() < now)
        current.expiredGrams += grams;
      else current.availableGrams += grams;
      if (
        item.expiresAt &&
        (!current.earliestExpiry ||
          new Date(item.expiresAt) < new Date(current.earliestExpiry))
      )
        current.earliestExpiry = item.expiresAt;
      grouped.set(item.foodItemId, current);
    }
    const data = [...grouped.values()]
      .filter((item) => item.availableGrams <= thresholdGrams)
      .map((item) => ({
        ...item,
        suggestedQuantityGrams: Math.max(
          thresholdGrams * 2 - item.availableGrams,
          thresholdGrams
        ),
        reason: (item.expiredGrams > 0
          ? 'expired_or_low_stock'
          : 'low_stock') as PantryRestockSuggestion['reason'],
      }))
      .sort((left, right) => left.availableGrams - right.availableGrams);
    return {
      data,
      meta: { page: 1, limit: data.length || 1, total: data.length, totalPages: 1 },
    };
  },
};
