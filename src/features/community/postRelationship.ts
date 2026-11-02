export function normalizeLinkedRecipeId(recipeId?: string | null) {
  return recipeId?.trim() || null;
}

export function hasPostFoodRelationship(
  recipeId?: string | null,
  foodItemIds: string[] = []
) {
  return Boolean(normalizeLinkedRecipeId(recipeId) || foodItemIds.length);
}

export function parsePostTags(value: string) {
  return [
    ...new Set(
      value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => tag.slice(0, 60))
    ),
  ].slice(0, 30);
}
