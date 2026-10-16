import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppButton, AppText, EmptyState, LoadingSpinner } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';
import { useExploreRecipes } from '../hooks';
import { ContentResultCard } from './ContentResultCard';

export function RecipesWithIngredient({
  foodItemId,
  name,
}: {
  foodItemId: string;
  name: string;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const recipes = useExploreRecipes({ foodItemId, limit: 5, sort: 'newest' });
  const items = recipes.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <View style={styles.container}>
      <AppText variant="heading4">{t('food.recipesTitle')}</AppText>
      <AppText color={colors.text.secondary}>
        {t('food.recipesDescription', { name })}
      </AppText>
      {recipes.isLoading ? (
        <LoadingSpinner text={t('discover.loadingRecipes')} />
      ) : recipes.isError && !items.length ? (
        <EmptyState
          title={t('food.recipesError')}
          actionLabel={t('common.retry')}
          onAction={() => void recipes.refetch()}
        />
      ) : !items.length ? (
        <AppText color={colors.text.secondary}>{t('food.noRecipes')}</AppText>
      ) : (
        items.map((item) => (
          <ContentResultCard
            key={item._id}
            item={{ ...item, type: 'recipe' }}
            onPress={() =>
              router.push({
                pathname: '/(discover)/recipe/[id]',
                params: { id: item._id },
              })
            }
          />
        ))
      )}
      {items.length > 0 && recipes.isError ? (
        <AppButton
          title={t('common.retry')}
          variant="outline"
          onPress={() => void recipes.fetchNextPage()}
        />
      ) : recipes.hasNextPage ? (
        <AppButton
          title={t('discover.loadMore')}
          variant="outline"
          loading={recipes.isFetchingNextPage}
          onPress={() => void recipes.fetchNextPage()}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ container: { gap: spacing.md } });
