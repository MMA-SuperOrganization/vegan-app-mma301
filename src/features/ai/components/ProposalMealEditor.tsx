import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recipeApi } from '@/features/recipes/recipeApi';
import { FeatureState } from '@/components/feedback/FeatureState';
import { View } from 'react-native';
import { AppButton, AppInput, AppText, SearchPickerSheet } from '@/components';
import { useRecipeOptions } from '@/features/tracking/hooks/usePickerOptions';
import { parseDecimal } from '@/features/tracking/trackingState';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme';
import { AI_TRANSLATION_KEYS } from '../aiConstants';
import type { ProposalMeal } from '../types';

export function ProposalMealEditor({
  meal,
  onChange,
  onRemove,
  disabled,
}: {
  meal: ProposalMeal;
  onChange: (meal: ProposalMeal) => void;
  onRemove: () => void;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  const keys = AI_TRANSLATION_KEYS.MEAL_PLANNER;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [servings, setServings] = useState(String(meal.servings));
  const recipes = useRecipeOptions(search, open);
  const recipe = useQuery({
    queryKey: ['recipe', meal.recipeId],
    queryFn: () => recipeApi.detail(meal.recipeId),
    enabled: Boolean(meal.recipeId),
  });
  const recipeName = name || recipe.data?.title;
  const parsed = parseDecimal(servings);

  return (
    <View style={{ gap: spacing.sm }}>
      <AppText variant="bodyStrong">{t(`tracking.meal.${meal.slot}`)}</AppText>
      <AppText>{recipeName || t(keys.LOADING_RECIPE)}</AppText>
      <FeatureState error={recipe.error} retry={() => void recipe.refetch()} />
      <AppButton
        title={t(keys.REPLACE_RECIPE)}
        variant="outline"
        disabled={disabled}
        onPress={() => setOpen(true)}
      />
      <AppInput
        label={t(keys.SERVINGS_LABEL)}
        value={servings}
        editable={!disabled}
        keyboardType="decimal-pad"
        error={
          parsed === null || parsed <= 0 || parsed > 20
            ? t(keys.SERVINGS_ERROR)
            : null
        }
        onChangeText={(value) => {
          setServings(value);
          onChange({ ...meal, servings: parseDecimal(value) ?? 0 });
        }}
      />
      <AppButton
        title={t(keys.REMOVE_MEAL)}
        variant="ghost"
        disabled={disabled}
        onPress={onRemove}
      />
      <SearchPickerSheet
        visible={open}
        title={t(keys.CHOOSE_RECIPE)}
        searchPlaceholder={t(keys.SEARCH_RECIPE)}
        query={search}
        onQueryChange={setSearch}
        items={(recipes.data?.data ?? []).map((item) => ({
          id: item._id,
          title: item.title || '',
          imageUrl: item.coverImageUrl,
        }))}
        isLoading={recipes.isLoading}
        isError={recipes.isError}
        onRetry={() => void recipes.refetch()}
        onSelect={(recipeId) => {
          setName(
            recipes.data?.data.find((item) => item._id === recipeId)?.title || ''
          );
          onChange({ ...meal, recipeId });
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    </View>
  );
}
