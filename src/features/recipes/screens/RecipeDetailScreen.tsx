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
import { RecipeHeader } from '../components/RecipeHeader';
import { RecipeImage } from '../components/RecipeImage';
import { useRecipeDetail, useSavedMutation } from '../hooks';

export function RecipeDetailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? '');
  const recipe = useRecipeDetail(id);
  const saved = useSavedMutation();

  if (recipe.isLoading)
    return (
      <ScreenWrapper contentContainerStyle={styles.screen}>
        <RecipeHeader
          title={t('recipe.detailTitle')}
          backFallbackHref="/(tabs)/explore"
        />
        <LoadingSpinner text={t('discover.loadingRecipes')} />
      </ScreenWrapper>
    );
  if (recipe.isError || !recipe.data) {
    return (
      <ScreenWrapper contentContainerStyle={styles.screen}>
        <RecipeHeader
          title={t('recipe.detailTitle')}
          backFallbackHref="/(tabs)/explore"
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
  const calories = data.nutritionPerServing?.caloriesKcal;

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.screen}>
      <RecipeHeader
        title={t('recipe.detailTitle')}
        subtitle={data.title}
        backFallbackHref="/(tabs)/explore"
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
            data.totalMinutes
              ? t('common.minutes', { count: data.totalMinutes })
              : null,
            data.difficulty,
          ]
            .filter(Boolean)
            .join(' · ')}
        </AppText>
      </InfoBlock>
      <InfoBlock title={t('recipe.nutritionPerServing')}>
        <AppText color={colors.primary[700]}>
          {calories != null ? `${calories} kcal` : t('recipe.noNutrition')}
        </AppText>
      </InfoBlock>
      <InfoBlock
        title={
          data.servings
            ? t('recipe.ingredientsFor', { count: data.servings })
            : t('recipe.ingredients')
        }
      >
        {data.ingredients?.length ? (
          data.ingredients.map((item) => (
            <AppText key={`${item.foodItemId}-${item.quantity}`}>
              • {item.foodNameSnapshot}: {item.quantity} {item.unit}
            </AppText>
          ))
        ) : (
          <AppText color={colors.text.secondary}>
            {t('recipe.noIngredients')}
          </AppText>
        )}
      </InfoBlock>
      {saved.error ? (
        <AppText color={colors.status.danger}>{saved.error.message}</AppText>
      ) : null}
      <AppButton
        title={t('recipe.startCooking')}
        disabled={!data.steps?.length}
        onPress={() =>
          router.push({ pathname: '/(discover)/recipe/[id]/cook', params: { id } })
        }
      />
      <AppButton
        title={data.isSaved ? t('recipe.unsave') : t('recipe.save')}
        variant="outline"
        loading={saved.isPending}
        onPress={() =>
          saved.mutate({
            type: 'recipe',
            id: data._id,
            saved: data.isSaved === true,
          })
        }
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
