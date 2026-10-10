import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppText,
  EmptyState,
  LoadingSpinner,
  ScreenWrapper,
} from '@/components';
import { useTranslation, type TranslationKey } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { ContentSaveButton } from '../components/ContentSaveButton';
import { RecipeHeader } from '../components/RecipeHeader';
import { RecipeImage } from '../components/RecipeImage';
import { useAllergenCatalog, useContentCategories, useFoodDetail } from '../hooks';
import type { NutritionFacts } from '../types';

const nutrientRows: Array<{
  key: keyof NutritionFacts;
  label: TranslationKey;
  unit: string;
}> = [
  { key: 'caloriesKcal', label: 'food.calories', unit: 'kcal' },
  { key: 'proteinG', label: 'recipe.protein', unit: 'g' },
  { key: 'carbsG', label: 'recipe.carbs', unit: 'g' },
  { key: 'fatG', label: 'recipe.fat', unit: 'g' },
  { key: 'fiberG', label: 'recipe.fiber', unit: 'g' },
  { key: 'sugarG', label: 'food.sugar', unit: 'g' },
  { key: 'sodiumMg', label: 'food.sodium', unit: 'mg' },
  { key: 'calciumMg', label: 'food.calcium', unit: 'mg' },
  { key: 'ironMg', label: 'food.iron', unit: 'mg' },
  { key: 'vitaminB12Mcg', label: 'food.vitaminB12', unit: 'mcg' },
  { key: 'vitaminDMcg', label: 'food.vitaminD', unit: 'mcg' },
];

export function FoodDetailScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? '');
  const food = useFoodDetail(id);
  const allergens = useAllergenCatalog();
  const categories = useContentCategories('food');

  if (food.isLoading)
    return (
      <ScreenWrapper contentContainerStyle={styles.screen}>
        <RecipeHeader title={t('food.detailTitle')} />
        <LoadingSpinner text={t('food.loadingDetail')} />
      </ScreenWrapper>
    );
  if (food.isError || !food.data)
    return (
      <ScreenWrapper contentContainerStyle={styles.screen}>
        <RecipeHeader title={t('food.detailTitle')} />
        <EmptyState
          title={t('food.openError')}
          description={food.error?.message}
          actionLabel={t('common.retry')}
          onAction={() => void food.refetch()}
        />
      </ScreenWrapper>
    );

  const data = food.data;
  const category = categories.data?.data.find(
    (item) => item._id === data.categoryId
  )?.name;
  const allergenNames = data.allergenIds?.map(
    (allergenId) =>
      allergens.data?.data.find((item) => item._id === allergenId)?.name ??
      t('recipe.unknownAllergen')
  );

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.screen}>
      <RecipeHeader
        title={t('food.detailTitle')}
        subtitle={data.name}
        backFallbackHref="/(discover)/foods"
      />
      <RecipeImage uri={data.imageUrl} style={styles.cover} fallbackSize="large" />
      <InfoBlock title={t('food.overview')}>
        {categories.isLoading ? (
          <LoadingSpinner text={t('filters.loadingCategories')} />
        ) : categories.isError ? (
          <AppButton
            title={t('common.retry')}
            variant="outline"
            onPress={() => void categories.refetch()}
          />
        ) : (
          <AppText>{category ?? t('food.unknownCategory')}</AppText>
        )}
        <AppText color={colors.primary[700]}>
          {data.isVegan ? t('food.vegan') : t('food.notVegan')}
        </AppText>
        {data.defaultServing ? (
          <AppText color={colors.text.secondary}>
            {t('food.defaultServing', {
              amount: data.defaultServing.amount,
              unit: data.defaultServing.unit,
              grams: data.defaultServing.gramEquivalent,
            })}
          </AppText>
        ) : null}
      </InfoBlock>
      <InfoBlock title={t('food.nutritionPer100g')}>
        {data.nutritionPer100g ? (
          nutrientRows.map((row) => (
            <View key={row.key} style={styles.nutrientRow}>
              <AppText color={colors.text.secondary}>{t(row.label)}</AppText>
              <AppText variant="bodyStrong">
                {data.nutritionPer100g?.[row.key] ?? 0} {row.unit}
              </AppText>
            </View>
          ))
        ) : (
          <AppText color={colors.text.secondary}>{t('recipe.noNutrition')}</AppText>
        )}
      </InfoBlock>
      <InfoBlock title={t('recipe.allergens')}>
        {allergens.isLoading ? (
          <LoadingSpinner text={t('food.loadingAllergens')} />
        ) : allergens.isError ? (
          <EmptyState
            title={t('food.allergenLoadError')}
            actionLabel={t('common.retry')}
            onAction={() => void allergens.refetch()}
          />
        ) : (
          <AppText color={colors.text.secondary}>
            {data.allergenIds === undefined
              ? t('recipe.allergensUnknown')
              : allergenNames?.length
                ? allergenNames.join(', ')
                : t('recipe.noDeclaredAllergens')}
          </AppText>
        )}
      </InfoBlock>
      <ContentSaveButton content={{ ...data, type: 'food-item' }} />
    </ScreenWrapper>
  );
}

function InfoBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.block}>
      <AppText variant="heading4">{title}</AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, gap: spacing.lg },
  cover: { width: '100%', height: 220, borderRadius: radius.xl },
  block: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
    gap: spacing.sm,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
});
