export function normalizeLinkedRecipeId(recipeId?: string | null) {
  return recipeId?.trim() || null;
}

export function hasPostFoodRelationship(
  recipeId?: string | null,
  foodItemIds: string[] = []
) {
  return Boolean(normalizeLinkedRecipeId(recipeId) || foodItemIds.length);
}
