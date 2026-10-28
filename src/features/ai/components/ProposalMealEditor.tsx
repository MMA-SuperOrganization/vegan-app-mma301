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
  const { t, locale } = useTranslation();
  const vi = locale === 'vi';
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
      <AppText>
        {recipeName || (vi ? 'Đang tải công thức…' : 'Loading recipe…')}
      </AppText>
      <FeatureState error={recipe.error} retry={() => void recipe.refetch()} />
      <AppButton
        title={vi ? 'Thay món' : 'Replace recipe'}
        variant="outline"
        disabled={disabled}
        onPress={() => setOpen(true)}
      />
      <AppInput
        label={vi ? 'Khẩu phần (tối đa 20)' : 'Servings (up to 20)'}
        value={servings}
        editable={!disabled}
        keyboardType="decimal-pad"
        error={
          parsed === null || parsed <= 0 || parsed > 20
            ? vi
              ? 'Nhập từ trên 0 đến 20.'
              : 'Enter a number greater than 0 and at most 20.'
            : null
        }
        onChangeText={(value) => {
          setServings(value);
          onChange({ ...meal, servings: parseDecimal(value) ?? 0 });
        }}
      />
      <AppButton
        title={vi ? 'Bỏ món' : 'Remove meal'}
        variant="ghost"
        disabled={disabled}
        onPress={onRemove}
      />
      <SearchPickerSheet
        visible={open}
        title={vi ? 'Chọn công thức' : 'Choose recipe'}
        searchPlaceholder={vi ? 'Tìm công thức' : 'Search recipes'}
        query={search}
        onQueryChange={setSearch}
        items={(recipes.data?.data ?? []).map((recipe) => ({
          id: recipe._id,
          title: recipe.title || '',
          imageUrl: recipe.coverImageUrl,
        }))}
        isLoading={recipes.isLoading}
        isError={recipes.isError}
        onRetry={() => void recipes.refetch()}
        onSelect={(recipeId) => {
          setName(
            recipes.data?.data.find((recipe) => recipe._id === recipeId)?.title || ''
          );
          onChange({ ...meal, recipeId });
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    </View>
  );
}
