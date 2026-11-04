import { getUserErrorMessage } from '@/services/errors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  AppButton,
  AppIcon,
  AppText,
  EmptyState,
  LoadingSpinner,
  ScreenWrapper,
  Surface,
} from '@/components';
import { useProfileStore } from '@/features/profile/profileStore';
import { matchingAllergenNames } from '@/features/profile/allergenMatching';
import { allergenLabel } from '@/features/recipes/filterLabels';
import { useTranslation, type TranslationKey } from '@/i18n';
import { colors, spacing, webLayout } from '@/theme';

import { ContentSaveButton } from '../components/ContentSaveButton';
import { DiscoveryDetailHeader } from '../components/DiscoveryDetailHeader';
import { RecipeDetailTabs } from '../components/RecipeDetailTabs';
import { RecipeHeroSection } from '../components/RecipeHeroSection';
import { RecipeMacroCards } from '../components/RecipeMacroCards';
import { useRecipeDetail } from '../hooks';
import { engagementApi } from '@/features/engagement/engagementApi';
import { recipeApi } from '../recipeApi';

export function RecipeDetailScreen() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === 'web' && width >= webLayout.desktopBreakpoint;
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? '');
  const recipe = useRecipeDetail(id);
  const [variantId, setVariantId] = useState<string | null>(null);
  const allergenCatalog = useProfileStore((state) => state.data?.allergens ?? []);
  const profileAllergenIds = useProfileStore(
    (state) => state.data?.nutritionProfile?.allergenIds ?? []
  );
  const substitutions = useQuery({
    queryKey: [
      'recipe-substitutions',
      recipe.data?._id,
      variantId,
      ...profileAllergenIds,
    ],
    queryFn: () =>
      recipeApi.substitutions(recipe.data!, profileAllergenIds, variantId),
    enabled: Boolean(recipe.data?._id && profileAllergenIds.length),
  });
  useEffect(() => {
    if (recipe.data?._id)
      void engagementApi
        .recordView('recipe', recipe.data._id)
        .catch(() => undefined);
  }, [recipe.data?._id]);

  if (recipe.isLoading) {
    return (
      <ScreenWrapper
        header={
          <DiscoveryDetailHeader
            title={t('recipe.detailTitle')}
            backFallbackHref="/(discover)/explore"
            showHome={false}
          />
        }
        contentContainerStyle={styles.state}
      >
        <LoadingSpinner text={t('discover.loadingRecipes')} />
      </ScreenWrapper>
    );
  }

  if (recipe.isError || !recipe.data) {
    return (
      <ScreenWrapper
        header={
          <DiscoveryDetailHeader
            title={t('recipe.detailTitle')}
            backFallbackHref="/(discover)/explore"
            showHome={false}
          />
        }
        contentContainerStyle={styles.state}
      >
        <EmptyState
          title={t('recipe.openError')}
          description={recipe.error ? getUserErrorMessage(recipe.error) : undefined}
          actionLabel={t('common.retry')}
          onAction={() => void recipe.refetch()}
        />
      </ScreenWrapper>
    );
  }

  const data = recipe.data;
  const selectedVariant =
    data.variants?.find((variant) => variant.variantId === variantId) ?? null;
  const nutrition =
    data.nutritionDataQuality === 'unavailable'
      ? undefined
      : (selectedVariant?.nutritionPerServing ?? data.nutritionPerServing);
  const displayedIngredients = selectedVariant?.ingredients ?? data.ingredients;
  const allergenText =
    data.allergenIds === undefined
      ? t('recipe.allergensUnknown')
      : data.allergenIds.length === 0
        ? t('recipe.noDeclaredAllergens')
        : data.allergenIds
            .map((allergenId) => {
              const name = allergenCatalog.find(
                (allergen) => allergen._id === allergenId
              )?.name;
              return name
                ? allergenLabel(name, locale)
                : t('recipe.unknownAllergen');
            })
            .join(', ');
  const matchingAllergens = matchingAllergenNames(
    data.allergenIds,
    profileAllergenIds,
    allergenCatalog,
    t('recipe.unknownAllergen'),
    (name) => allergenLabel(name, locale)
  );
  const difficulty = data.difficulty
    ? t(`filters.difficulty.${data.difficulty}` as TranslationKey)
    : null;

  return (
    <ScreenWrapper
      webMaxWidth={webLayout.catalogMaxWidth}
      header={
        <DiscoveryDetailHeader
          title={data.title ?? t('recipe.detailTitle')}
          backFallbackHref="/(discover)/explore"
          showHome={false}
        />
      }
      scrollable
      contentContainerStyle={styles.screen}
    >
      <View style={[styles.detailLayout, desktop && styles.desktopDetailLayout]}>
        <View style={[styles.mainColumn, desktop && styles.desktopMainColumn]}>
          <RecipeHeroSection
            title={data.title}
            coverImageUrl={data.coverImageUrl}
            summary={data.summary}
            description={data.description}
            servings={data.servings}
            prepMinutes={data.prepMinutes}
            cookMinutes={data.cookMinutes}
            difficulty={difficulty}
          />

          {data.variants?.length ? (
            <Surface bordered padding="lg" radius="lg" style={styles.block}>
              <AppText variant="heading4">
                {locale === 'vi' ? 'Biến thể vùng miền' : 'Regional variant'}
              </AppText>
              <View style={styles.variantRow}>
                <Pressable
                  onPress={() => setVariantId(null)}
                  style={[
                    styles.variantChip,
                    !variantId && styles.variantChipSelected,
                  ]}
                >
                  <AppText
                    color={!variantId ? colors.text.inverse : colors.text.primary}
                  >
                    {locale === 'vi' ? 'Bản gốc' : 'Original'}
                  </AppText>
                </Pressable>
                {data.variants.map((variant) => {
                  const selected = variant.variantId === variantId;
                  return (
                    <Pressable
                      key={variant.variantId}
                      onPress={() => setVariantId(variant.variantId)}
                      style={[
                        styles.variantChip,
                        selected && styles.variantChipSelected,
                      ]}
                    >
                      <AppText
                        color={selected ? colors.text.inverse : colors.text.primary}
                      >
                        {variant.name}
                        {variant.region ? ` · ${variant.region}` : ''}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </Surface>
          ) : null}

          {matchingAllergens.length ? (
            <Surface
              bordered
              padding="lg"
              radius="lg"
              style={styles.allergenWarning}
            >
              <View style={styles.warningHeader}>
                <View style={styles.warningIcon}>
                  <AppIcon
                    name="flag"
                    size={22}
                    color={colors.status.danger}
                    decorative
                  />
                </View>
                <View style={styles.warningCopy}>
                  <AppText variant="heading4" color={colors.status.danger}>
                    {t('recipe.profileAllergenWarningTitle')}
                  </AppText>
                  <AppText color={colors.text.secondary}>
                    {t('recipe.profileAllergenWarningBody', {
                      allergens: matchingAllergens.join(', '),
                    })}
                  </AppText>
                </View>
              </View>
            </Surface>
          ) : null}

          <RecipeMacroCards
            caloriesKcal={nutrition?.caloriesKcal}
            proteinG={nutrition?.proteinG}
            carbsG={nutrition?.carbsG}
            fatG={nutrition?.fatG}
          />

          {data.nutritionCalculation ? (
            <AppText variant="caption" color={colors.text.secondary}>
              {data.nutritionCalculation.method === 'atwater_general'
                ? locale === 'vi'
                  ? 'Calories được tính theo hệ số Atwater 4–4–9 từ protein, carbohydrate và chất béo.'
                  : 'Calories are calculated with the Atwater 4–4–9 factors from protein, carbohydrate and fat.'
                : locale === 'vi'
                  ? 'Calories dùng giá trị công bố từ nguồn dữ liệu thực phẩm; Atwater được lưu để đối chiếu.'
                  : 'Calories use the declared food-data value; Atwater is retained as an audit comparison.'}
            </AppText>
          ) : null}

          <RecipeDetailTabs
            servings={data.servings}
            ingredients={displayedIngredients}
            steps={data.steps}
            onOpenIngredient={(foodItemId) =>
              router.push({
                pathname: '/(discover)/food/[id]',
                params: { id: foodItemId },
              })
            }
          />

          {substitutions.data?.length ? (
            <Surface bordered padding="lg" radius="lg" style={styles.block}>
              <AppText variant="heading4">
                {locale === 'vi' ? 'Thay thế an toàn hơn' : 'Safer substitutions'}
              </AppText>
              <AppText color={colors.text.secondary}>
                {locale === 'vi'
                  ? 'Các lựa chọn cùng nhóm thực phẩm đã loại trừ dị nguyên trong hồ sơ của bạn.'
                  : 'Alternatives in the same food category with your profile allergens excluded.'}
              </AppText>
              {substitutions.data.map((suggestion) => (
                <View
                  key={suggestion.ingredient.foodItemId}
                  style={styles.substitutionRow}
                >
                  <AppText variant="bodyStrong">
                    {suggestion.ingredient.foodNameSnapshot}
                  </AppText>
                  {suggestion.alternatives.length ? (
                    suggestion.alternatives.map((item) => (
                      <View key={item.food._id} style={styles.substitutionOption}>
                        <AppText color={colors.primary[700]} variant="bodyStrong">
                          {item.food.name} · {item.recommendedQuantity} {item.unit}
                        </AppText>
                        <AppText variant="caption" color={colors.text.secondary}>
                          {locale === 'vi'
                            ? `Tỷ lệ ${item.quantityRatio}×. Dùng lượng gợi ý rồi điều chỉnh gia vị và kết cấu khi nấu.`
                            : `${item.quantityRatio}× ratio. ${item.guidance}`}
                        </AppText>
                      </View>
                    ))
                  ) : (
                    <AppText color={colors.primary[700]}>
                      {locale === 'vi'
                        ? 'Chưa có lựa chọn phù hợp'
                        : 'No suitable alternative yet'}
                    </AppText>
                  )}
                </View>
              ))}
            </Surface>
          ) : null}
        </View>

        <View style={[styles.asideColumn, desktop && styles.desktopAsideColumn]}>
          <Surface bordered padding="lg" radius="lg" style={styles.block}>
            <AppText variant="heading4">{t('recipe.allergens')}</AppText>
            <AppText color={colors.text.secondary}>{allergenText}</AppText>
          </Surface>

          <AppButton
            title={t('recipe.startCooking')}
            disabled={!data.steps?.length}
            onPress={() =>
              router.push({
                pathname: '/(discover)/recipe/[id]/cook',
                params: { id },
              })
            }
          />
          <ContentSaveButton
            content={{ ...data, type: 'recipe' }}
            initialSaved={data.isSaved}
          />
          <AppButton
            title={locale === 'vi' ? 'Báo cáo công thức' : 'Report recipe'}
            variant="ghost"
            onPress={() =>
              router.push({
                pathname: '/community/report',
                params: {
                  targetType: 'recipe',
                  targetId: data._id,
                  targetPreview: data.title,
                },
              })
            }
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  state: { padding: spacing.xl, justifyContent: 'center' },
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.lg },
  block: { gap: spacing.md },
  variantRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  variantChip: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
  },
  variantChipSelected: {
    borderColor: colors.primary[700],
    backgroundColor: colors.primary[700],
  },
  substitutionRow: { gap: spacing.xs },
  substitutionOption: { gap: spacing.xs, paddingTop: spacing.xs },
  allergenWarning: {
    gap: spacing.md,
    borderColor: colors.status.danger,
    backgroundColor: colors.accent.soft,
  },
  warningHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  warningIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.surface,
  },
  warningCopy: { flex: 1, gap: spacing.xs },
  detailLayout: { gap: spacing.lg },
  mainColumn: { gap: spacing.lg },
  asideColumn: { gap: spacing.lg },
  desktopDetailLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xl,
  },
  desktopMainColumn: { flex: 1, minWidth: 0 },
  desktopAsideColumn: {
    width: 320,
  },
});
