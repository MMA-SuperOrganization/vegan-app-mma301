import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppText,
  EmptyState,
  LoadingSpinner,
  ScreenWrapper,
} from '@/components';
import { colors, radius, spacing } from '@/theme';
import { useTranslation } from '@/i18n';
import { useProfileStore } from '@/features/profile/profileStore';
import { RecipeHeader } from '../components/RecipeHeader';
import { RecipeImage } from '../components/RecipeImage';
import { ContentSaveButton } from '../components/ContentSaveButton';
import { IngredientList } from '../components/IngredientList';
import { NutritionSummary } from '../components/NutritionSummary';
import { useRecipeDetail } from '../hooks';

export function RecipeDetailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? '');
  const recipe = useRecipeDetail(id);
  const allergenCatalog = useProfileStore((state) => state.data?.allergens ?? []);

  if (recipe.isLoading)
    return (
      <ScreenWrapper contentContainerStyle={styles.screen}>
        <RecipeHeader
          title={t('recipe.detailTitle')}
          backFallbackHref="/(discover)/explore"
        />
        <LoadingSpinner text={t('discover.loadingRecipes')} />
      </ScreenWrapper>
    );
  if (recipe.isError || !recipe.data) {
    return (
      <ScreenWrapper contentContainerStyle={styles.screen}>
        <RecipeHeader
          title={t('recipe.detailTitle')}
          backFallbackHref="/(discover)/explore"
        />
        <EmptyState
          title={t('recipe.openError')}
          description={recipe.error?.message}
          actionLabel={t('common.retry')}
          onAction={() => void recipe.refetch()}
        />
      </ScreenWrapper>
    );
  }
  const data = recipe.data;
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

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.screen}>
      <RecipeHeader
        title={t('recipe.detailTitle')}
        subtitle={data.title}
        backFallbackHref="/(discover)/explore"
      />
      <RecipeImage
        uri={data.coverImageUrl}
        style={styles.cover}
        fallbackSize="large"
      />
      <InfoBlock title={t('recipe.info')}>
        <AppText color={colors.text.secondary}>
          {data.summary || data.description || t('recipe.noDescription')}
        </AppText>
        <AppText>
          {[
            data.servings ? t('recipe.servings', { count: data.servings }) : null,
            data.prepMinutes != null
              ? t('recipe.prepMinutes', { count: data.prepMinutes })
              : null,
            data.cookMinutes != null
              ? t('recipe.cookMinutes', { count: data.cookMinutes })
              : null,
            data.difficulty,
          ]
            .filter(Boolean)
            .join(' · ')}
        </AppText>
      </InfoBlock>
      <InfoBlock title={t('recipe.nutritionPerServing')}>
        <NutritionSummary nutrition={data.nutritionPerServing} />
      </InfoBlock>
      <InfoBlock
        title={
          data.servings
            ? t('recipe.ingredientsFor', { count: data.servings })
            : t('recipe.ingredients')
        }
      >
        <IngredientList
          ingredients={data.ingredients}
          onOpen={(foodItemId) =>
            router.push({
              pathname: '/(discover)/food/[id]',
              params: { id: foodItemId },
            })
          }
        />
      </InfoBlock>
      <InfoBlock title={t('recipe.allergens')}>
        <AppText color={colors.text.secondary}>{allergenText}</AppText>
      </InfoBlock>
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
  cover: { width: '100%', height: 210, borderRadius: radius.xl },
  block: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
    gap: spacing.sm,
  },
});
