import { getUserErrorMessage } from '@/services/errors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import {
  AppButton,
  AppText,
  CustomHeader,
  EmptyState,
  LoadingSpinner,
  ScreenWrapper,
  Surface,
} from '@/components';
import { useProfileStore } from '@/features/profile/profileStore';
import { useTranslation, type TranslationKey } from '@/i18n';
import { colors, spacing } from '@/theme';

import { ContentSaveButton } from '../components/ContentSaveButton';
import { RecipeDetailTabs } from '../components/RecipeDetailTabs';
import { RecipeHeroSection } from '../components/RecipeHeroSection';
import { RecipeMacroCards } from '../components/RecipeMacroCards';
import { useRecipeDetail } from '../hooks';

export function RecipeDetailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? '');
  const recipe = useRecipeDetail(id);
  const allergenCatalog = useProfileStore((state) => state.data?.allergens ?? []);

  if (recipe.isLoading) {
    return (
      <ScreenWrapper
        header={
          <CustomHeader
            title={t('recipe.detailTitle')}
            showBack
            backFallbackHref="/(discover)/explore"
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
          <CustomHeader
            title={t('recipe.detailTitle')}
            showBack
            backFallbackHref="/(discover)/explore"
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
  const nutrition = data.nutritionPerServing;
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
        <CustomHeader
          title={data.title ?? t('recipe.detailTitle')}
          showBack
          backFallbackHref="/(discover)/explore"
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
      />

      <Surface bordered padding="lg" radius="lg" style={styles.block}>
        <AppText variant="heading4">{t('recipe.allergens')}</AppText>
        <AppText color={colors.text.secondary}>{allergenText}</AppText>
      </Surface>

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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  state: { padding: spacing.xl, justifyContent: 'center' },
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.lg },
  block: { gap: spacing.md },
});
