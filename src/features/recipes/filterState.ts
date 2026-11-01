import type { ContentType, RecipeFilters, RecipeQuery } from './types';

type RouteValue = string | string[] | undefined;
export type RecipeFilterRouteParams = {
  q?: RouteValue;
  type?: RouteValue;
  category?: RouteValue;
  categoryIds?: RouteValue;
  tags?: RouteValue;
  difficulty?: RouteValue;
  maxTotalMinutes?: RouteValue;
  dietType?: RouteValue;
  sort?: RouteValue;
  avoidProfileAllergens?: RouteValue;
};

const first = (value: RouteValue) => (Array.isArray(value) ? value[0] : value);
const list = (value: RouteValue) => [
  ...new Set(
    (Array.isArray(value) ? value : [value])
      .flatMap((item) => item?.split(',') ?? [])
      .map((item) => item.trim())
      .filter(Boolean)
  ),
];

const oneOf = <T extends string>(value: string | undefined, values: readonly T[]) =>
  values.includes(value as T) ? (value as T) : undefined;

export function parseRecipeFilters(params: RecipeFilterRouteParams): RecipeFilters {
  const duration = Number(first(params.maxTotalMinutes));
  return {
    categoryIds: list(params.categoryIds ?? params.category).length
      ? list(params.categoryIds ?? params.category)
      : undefined,
    tags: list(params.tags).length ? list(params.tags) : undefined,
    difficulty: oneOf(first(params.difficulty), ['easy', 'medium', 'hard'] as const),
    maxTotalMinutes:
      Number.isInteger(duration) && duration > 0 ? duration : undefined,
    dietType: oneOf(first(params.dietType), ['vegan', 'vegetarian'] as const),
    sort: oneOf(first(params.sort), [
      'newest',
      'popular',
      'rating',
      'quickest',
    ] as const),
    avoidProfileAllergens: first(params.avoidProfileAllergens) === '1',
  };
}

export function serializeRecipeFilters(
  filters: RecipeFilters
): Record<string, string> {
  return Object.fromEntries(
    Object.entries({
      categoryIds: filters.categoryIds?.join(','),
      tags: filters.tags?.join(','),
      difficulty: filters.difficulty,
      maxTotalMinutes: filters.maxTotalMinutes?.toString(),
      dietType: filters.dietType,
      sort: filters.sort,
      avoidProfileAllergens: filters.avoidProfileAllergens ? '1' : undefined,
    }).filter((entry): entry is [string, string] => Boolean(entry[1]))
  );
}

export function buildRecipeQuery(
  filters: RecipeFilters,
  profileAllergenIds: string[] = []
): RecipeQuery {
  const { avoidProfileAllergens, ...query } = filters;
  return {
    ...query,
    ...(avoidProfileAllergens && profileAllergenIds.length
      ? { excludeAllergenIds: profileAllergenIds }
      : {}),
  };
}

export function filtersForContentType(
  filters: RecipeFilters,
  type: ContentType | 'all'
): RecipeFilters {
  if (type === 'recipe' || type === 'all') return filters;
  if (type === 'post')
    return { categoryIds: filters.categoryIds, sort: filters.sort };
  if (type === 'video') return { sort: filters.sort };
  return {
    categoryIds: filters.categoryIds,
    dietType: filters.dietType,
    avoidProfileAllergens: filters.avoidProfileAllergens,
  };
}

export const hasActiveRecipeFilters = (filters: RecipeFilters) =>
  Object.values(filters).some(
    (value) =>
      value !== undefined &&
      value !== false &&
      (!Array.isArray(value) || value.length > 0)
  );

export const toggleFilterValue = (values: string[] | undefined, value: string) => {
  const current = values ?? [];
  return current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
};
