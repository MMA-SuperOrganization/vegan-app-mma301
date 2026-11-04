import type { IngredientSuggestion } from './types';

export function normalizeIngredientName(value: string) {
  return value
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/gi, 'd')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function hasExactIngredientName(
  suggestions: IngredientSuggestion[],
  query: string
) {
  const normalizedQuery = normalizeIngredientName(query);
  return Boolean(
    normalizedQuery &&
    suggestions.some(
      (suggestion) => normalizeIngredientName(suggestion.name) === normalizedQuery
    )
  );
}
