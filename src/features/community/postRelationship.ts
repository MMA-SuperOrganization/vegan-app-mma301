export function normalizeLinkedRecipeId(recipeId?: string | null) {
  return recipeId?.trim() || null;
}
