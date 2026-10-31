import { StyleSheet, View } from 'react-native';

import { AppIcon, AppText } from '@/components';
import { RecipeImage } from '@/features/recipes/components/RecipeImage';
import type {
  RelatedFoodItemSummary,
  RelatedRecipeSummary,
} from '@/features/recipes/types';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';

export function PostFoodSummary({
  recipeId,
  foodItemIds = [],
  relatedRecipe,
  relatedFoodItems = [],
  compact = false,
}: {
  recipeId?: string | null;
  foodItemIds?: string[];
  relatedRecipe?: RelatedRecipeSummary | null;
  relatedFoodItems?: RelatedFoodItemSummary[];
  compact?: boolean;
}) {
  const { t } = useTranslation();
  if (!recipeId && !foodItemIds.length && !relatedRecipe && !relatedFoodItems.length)
    return null;

  const visibleFoodItems = relatedFoodItems.slice(0, 3);
  const remainingFoodItems = Math.max(
    0,
    relatedFoodItems.length - visibleFoodItems.length
  );
  const ingredientNames = visibleFoodItems
    .map((foodItem) => foodItem.name)
    .join(', ');
  const title =
    relatedRecipe?.title ||
    ingredientNames ||
    (recipeId
      ? t('postFood.linkedRecipeFallback')
      : t('postFood.linkedIngredientsFallback'));
  const imageUrl = relatedRecipe?.coverImageUrl ?? relatedFoodItems[0]?.imageUrl;
  const ingredientDetail = ingredientNames
    ? `${t('postFood.ingredientsLabel')}: ${ingredientNames}${
        remainingFoodItems ? ` +${remainingFoodItems}` : ''
      }`
    : foodItemIds.length
      ? t('postFood.ingredientCount', { count: foodItemIds.length })
      : null;

  return (
    <View
      accessibilityLabel={`${t('postFood.cardTitle')}: ${title}`}
      style={[styles.container, compact && styles.containerCompact]}
    >
      {imageUrl ? (
        <RecipeImage
          uri={imageUrl}
          style={[styles.image, compact && styles.imageCompact]}
          fallbackSize="small"
        />
      ) : (
        <View style={[styles.icon, compact && styles.iconCompact]}>
          <AppIcon
            name="pantry"
            size={compact ? 18 : 22}
            color={colors.primary[700]}
            decorative
          />
        </View>
      )}
      <View style={styles.copy}>
        <AppText variant="caption" color={colors.primary[700]}>
          {t('postFood.cardTitle')}
        </AppText>
        <AppText variant="bodyStrong" numberOfLines={compact ? 1 : 2}>
          {title}
        </AppText>
        {relatedRecipe && ingredientDetail ? (
          <AppText variant="caption" color={colors.text.secondary} numberOfLines={2}>
            {ingredientDetail}
          </AppText>
        ) : !relatedRecipe && remainingFoodItems ? (
          <AppText variant="caption" color={colors.text.secondary}>
            {t('postFood.moreIngredients', { count: remainingFoodItems })}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary[300],
    backgroundColor: colors.background.selected,
  },
  containerCompact: { minHeight: 60, marginHorizontal: spacing.md },
  image: { width: 56, height: 56, borderRadius: radius.md },
  imageCompact: { width: 44, height: 44 },
  icon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.background.surface,
  },
  iconCompact: { width: 44, height: 44 },
  copy: { flex: 1, gap: 2 },
});
