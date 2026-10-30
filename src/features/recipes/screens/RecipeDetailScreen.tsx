import { getUserErrorMessage } from '@/services/errors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Linking, StyleSheet } from 'react-native';

import {
  AppButton,
  AppText,
  EmptyState,
  LoadingSpinner,
  ScreenWrapper,
  Surface,
} from '@/components';
import { useProfileStore } from '@/features/profile/profileStore';
import { useTranslation, type TranslationKey } from '@/i18n';
import { colors, spacing } from '@/theme';

import { ContentSaveButton } from '../components/ContentSaveButton';
import { DiscoveryDetailHeader } from '../components/DiscoveryDetailHeader';
import { RecipeDetailTabs } from '../components/RecipeDetailTabs';
import { RecipeHeroSection } from '../components/RecipeHeroSection';
import { RecipeMacroCards } from '../components/RecipeMacroCards';
import { useRecipeDetail } from '../hooks';
import { engagementApi } from '@/features/engagement/engagementApi';

export function RecipeDetailScreen() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? '');
  const recipe = useRecipeDetail(id);
  const allergenCatalog = useProfileStore((state) => state.data?.allergens ?? []);
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
  const nutrition =
    data.nutritionDataQuality === 'unavailable'
      ? undefined
      : data.nutritionPerServing;
  const allergenText =
    data.allergenIds === undefined
      ? t('recipe.allergensUnknown')
      : data.allergenIds.length === 0
        ? t('recipe.noDeclaredAllergens')
        : data.allergenIds
            .map(
              (allergenId) =>
                allergenCatalog.find((allergen) => allergen._id === allergenId)
                  ?.name ?? t('recipe.unknownAllergen')
            )
            .join(', ');
  const difficulty = data.difficulty
    ? t(`filters.difficulty.${data.difficulty}` as TranslationKey)
    : null;

  return (
    <ScreenWrapper
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

      <RecipeMacroCards
        caloriesKcal={nutrition?.caloriesKcal}
        proteinG={nutrition?.proteinG}
        carbsG={nutrition?.carbsG}
        fatG={nutrition?.fatG}
      />

      <RecipeDetailTabs
        servings={data.servings}
        ingredients={data.ingredients}
        steps={data.steps}
        onOpenIngredient={(foodItemId) =>
          router.push({
            pathname: '/(discover)/food/[id]',
            params: { id: foodItemId },
          })
        }
      />

      <Surface bordered padding="lg" radius="lg" style={styles.block}>
        <AppText variant="heading4">{t('recipe.allergens')}</AppText>
        <AppText color={colors.text.secondary}>{allergenText}</AppText>
      </Surface>

      {data.sourceAttribution ? (
        <Surface bordered padding="lg" radius="lg" style={styles.block}>
          <AppText variant="heading4">
            {locale === 'vi' ? 'Nguồn công thức' : 'Recipe source'}
          </AppText>
          <AppText color={colors.text.secondary}>
            {data.sourceAttribution.provider} · {data.sourceAttribution.license}
          </AppText>
          {data.sourceAttribution.url ? (
            <AppButton
              title={locale === 'vi' ? 'Xem nguồn' : 'View source'}
              variant="ghost"
              fullWidth={false}
              onPress={() => void Linking.openURL(data.sourceAttribution!.url!)}
            />
          ) : null}
        </Surface>
      ) : null}

      <AppButton
        title={t('recipe.startCooking')}
        disabled={!data.steps?.length}
        onPress={() =>
          router.push({ pathname: '/(discover)/recipe/[id]/cook', params: { id } })
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
            params: { targetType: 'recipe', targetId: data._id },
          })
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  state: { padding: spacing.xl, justifyContent: 'center' },
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.lg },
  block: { gap: spacing.md },
});
