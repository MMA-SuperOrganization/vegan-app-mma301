import { getUserErrorMessage } from '@/services/errors';
import { useRouter } from 'expo-router';
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
import { ContentResultCard } from '../components/ContentResultCard';
import { RecipeHeader } from '../components/RecipeHeader';
import { useExploreRecipes } from '../hooks';
import { contentHref } from '../contentNavigation';

export function ExploreScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const recipes = useExploreRecipes();
  const content = recipes.data?.pages.flatMap((page) => page.data) ?? [];
  return (
    <ScreenWrapper
      scrollable
      keyboardAvoiding={false}
      contentContainerStyle={styles.screen}
    >
      <RecipeHeader
        title={t('discover.exploreTitle')}
        subtitle={t('discover.exploreSubtitle')}
        backFallbackHref="/(tabs)"
      />
      <View style={styles.headerActions}>
        <AppButton
          title={t('discover.search')}
          variant="outline"
          fullWidth={false}
          onPress={() => router.push('/(discover)/search')}
        />
        <AppButton
          title={t('food.catalogTitle')}
          variant="outline"
          fullWidth={false}
          onPress={() => router.push('/(discover)/foods')}
        />
        <AppButton
          title={t('discover.savedContent')}
          variant="outline"
          fullWidth={false}
          onPress={() => router.push('/(discover)/saved')}
        />
      </View>
      <View style={styles.recipeIntro}>
        <AppText variant="heading3">{t('discover.recipeLibraryTitle')}</AppText>
        <AppText color={colors.text.secondary}>
          {t('discover.recipeLibraryDescription')}
        </AppText>
      </View>
      {recipes.isLoading ? (
        <LoadingSpinner text={t('discover.loadingRecipes')} />
      ) : null}
      {recipes.error ? (
        <EmptyState
          title={t('discover.loadError')}
          description={getUserErrorMessage(recipes.error)}
          actionLabel={t('common.retry')}
          onAction={() => void recipes.refetch()}
        />
      ) : null}
      {!recipes.isLoading && !recipes.error && !content.length ? (
        <EmptyState
          title={t('discover.noRecipes')}
          description={t('discover.noRecipesDescription')}
        />
      ) : null}
      <View style={styles.list}>
        {content.map((item) => (
          <ContentResultCard
            key={item._id}
            item={{ ...item, type: 'recipe' }}
            onPress={() => router.push(contentHref({ ...item, type: 'recipe' }))}
          />
        ))}
      </View>
      {recipes.hasNextPage ? (
        <AppButton
          title={t('discover.loadMore')}
          variant="outline"
          loading={recipes.isFetchingNextPage}
          onPress={() => void recipes.fetchNextPage()}
        />
      ) : null}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, gap: spacing.xl },
  headerActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  recipeIntro: {
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary[300],
    backgroundColor: colors.background.selected,
  },
  list: { gap: spacing.md },
});
