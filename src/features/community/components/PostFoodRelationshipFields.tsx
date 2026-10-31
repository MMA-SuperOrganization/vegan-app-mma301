import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useQueries } from '@tanstack/react-query';
import { AppButton, AppIcon, AppText, SearchPickerSheet } from '@/components';
import { recipeApi } from '@/features/recipes/recipeApi';
import { recipeKeys, useRecipeDetail } from '@/features/recipes/hooks';
import {
  useFoodOptions,
  useRecipeOptions,
} from '@/features/tracking/hooks/usePickerOptions';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';

interface PostFoodRelationshipFieldsProps {
  recipeId: string;
  foodItemIds: string[];
  disabled?: boolean;
  showValidation?: boolean;
  onRecipeChange: (recipeId: string) => void;
  onFoodItemsChange: (foodItemIds: string[]) => void;
}

export function PostFoodRelationshipFields({
  recipeId,
  foodItemIds,
  disabled,
  showValidation,
  onRecipeChange,
  onFoodItemsChange,
}: PostFoodRelationshipFieldsProps) {
  const { t } = useTranslation();
  const [picker, setPicker] = useState<'recipe' | 'food' | null>(null);
  const [search, setSearch] = useState('');
  const recipes = useRecipeOptions(search, picker === 'recipe');
  const foods = useFoodOptions(search, picker === 'food');
  const selectedRecipe = useRecipeDetail(recipeId);
  const selectedFoods = useQueries({
    queries: foodItemIds.map((foodItemId) => ({
      queryKey: recipeKeys.foodDetail(foodItemId),
      queryFn: () => recipeApi.foodDetail(foodItemId),
      staleTime: 1000 * 60 * 10,
    })),
  });
  const relationshipMissing = !recipeId && foodItemIds.length === 0;

  const openPicker = (nextPicker: 'recipe' | 'food') => {
    setSearch('');
    setPicker(nextPicker);
  };
  const closePicker = () => {
    setPicker(null);
    setSearch('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <AppText variant="bodyStrong">{t('postFood.title')}</AppText>
        <AppText variant="bodySmall" color={colors.text.secondary}>
          {t('postFood.hint')}
        </AppText>
      </View>

      {recipeId ? (
        <RelationshipChip
          label={selectedRecipe.data?.title ?? t('postFood.selectedRecipe')}
          onRemove={() => onRecipeChange('')}
          disabled={disabled}
        />
      ) : null}
      {foodItemIds.map((foodItemId, index) => (
        <RelationshipChip
          key={foodItemId}
          label={selectedFoods[index].data?.name ?? t('postFood.selectedIngredient')}
          onRemove={() =>
            onFoodItemsChange(foodItemIds.filter((id) => id !== foodItemId))
          }
          disabled={disabled}
        />
      ))}

      <View style={styles.actions}>
        <AppButton
          title={recipeId ? t('postFood.changeRecipe') : t('postFood.addRecipe')}
          variant="outline"
          disabled={disabled}
          onPress={() => openPicker('recipe')}
          style={styles.action}
        />
        <AppButton
          title={t('postFood.addIngredient')}
          variant="outline"
          disabled={disabled}
          onPress={() => openPicker('food')}
          style={styles.action}
        />
      </View>

      {showValidation && relationshipMissing ? (
        <AppText accessibilityRole="alert" color={colors.status.danger}>
          {t('postFood.required')}
        </AppText>
      ) : null}

      <SearchPickerSheet
        visible={picker === 'recipe'}
        title={t('postFood.chooseRecipe')}
        searchPlaceholder={t('postFood.searchRecipe')}
        query={search}
        onQueryChange={setSearch}
        items={(recipes.data?.data ?? []).map((recipe) => ({
          id: recipe._id,
          title: recipe.title ?? t('postFood.untitledRecipe'),
          imageUrl: recipe.coverImageUrl,
        }))}
        isLoading={recipes.isLoading}
        isError={recipes.isError}
        onRetry={() => void recipes.refetch()}
        onSelect={(id) => {
          onRecipeChange(id);
          closePicker();
        }}
        onClose={closePicker}
      />
      <SearchPickerSheet
        visible={picker === 'food'}
        title={t('postFood.chooseIngredient')}
        searchPlaceholder={t('postFood.searchIngredient')}
        query={search}
        onQueryChange={setSearch}
        items={(foods.data?.data ?? [])
          .filter((food) => !foodItemIds.includes(food._id))
          .map((food) => ({
            id: food._id,
            title: food.name,
            imageUrl: food.imageUrl,
          }))}
        isLoading={foods.isLoading}
        isError={foods.isError}
        onRetry={() => void foods.refetch()}
        onSelect={(id) => {
          onFoodItemsChange([...foodItemIds, id]);
          closePicker();
        }}
        onClose={closePicker}
      />
    </View>
  );
}

function RelationshipChip({
  label,
  disabled,
  onRemove,
}: {
  label: string;
  disabled?: boolean;
  onRemove: () => void;
}) {
  return (
    <View style={styles.chip}>
      <AppIcon name="pantry" size={18} color={colors.primary[700]} decorative />
      <AppText variant="bodyStrong" style={styles.chipLabel} numberOfLines={2}>
        {label}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        disabled={disabled}
        onPress={onRemove}
        hitSlop={8}
      >
        <AppIcon name="close" size={18} color={colors.text.secondary} decorative />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  heading: { gap: spacing.xs },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  action: { flexGrow: 1, minWidth: 150 },
  chip: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary[300],
    backgroundColor: colors.background.selected,
  },
  chipLabel: { flex: 1 },
});
