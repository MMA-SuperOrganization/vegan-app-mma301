import type { FoodQuery } from './types';

export function buildFoodQuery({
  query,
  category,
  avoidAllergens,
  profileAllergenIds,
}: {
  query: string;
  category?: string;
  avoidAllergens: boolean;
  profileAllergenIds: string[];
}): FoodQuery {
  return {
    q: query.trim() || undefined,
    category,
    isVegan: true,
    excludeAllergenIds:
      avoidAllergens && profileAllergenIds.length
        ? [...new Set(profileAllergenIds)]
        : undefined,
  };
}
