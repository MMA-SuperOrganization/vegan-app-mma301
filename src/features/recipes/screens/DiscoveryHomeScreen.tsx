import { getUserErrorMessage } from '@/services/errors';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  AppText,
  EmptyState,
  LoadingSpinner,
  ScreenWrapper,
} from '@/components';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';
import { HomeRecipeStories } from '@/features/community/components/HomeRecipeStories';
import { HomeSocialHeader } from '@/features/community/components/HomeSocialHeader';
import { HomeSocialPostCard } from '@/features/community/components/HomeSocialPostCard';
import { useHomeFeed } from '../hooks';
import type { ContentCardData } from '../types';

export function DiscoveryHomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const home = useHomeFeed();
  const featured = home.data?.featured.recipes ?? [];
  const communityPosts = home.data?.featured.posts ?? [];
  const recommendations = home.data?.personalized?.recipes?.length
    ? home.data.personalized.recipes
    : featured;

  const openRecipe = (recipe: ContentCardData) =>
    router.push({
      pathname: '/(discover)/recipe/[id]',
      params: { id: recipe.slug ?? recipe._id },
    });

  return (
    <ScreenWrapper
      scrollable
      keyboardAvoiding={false}
      edges={['top', 'left', 'right']}
      contentContainerStyle={styles.screen}
    >
      <HomeSocialHeader
        onCreatePost={() => router.push('/recipes/editor')}
        onSearch={() => router.push('/(discover)/search')}
      />

      {home.isLoading ? (
        <LoadingSpinner text={t('home.loadingSuggestions')} />
      ) : null}
      {home.isError ? (
        <EmptyState
          title={t('home.suggestionError')}
          description={getUserErrorMessage(home.error)}
          actionLabel={t('common.retry')}
          onAction={() => void home.refetch()}
        />
      ) : null}
      {!home.isLoading && !home.isError && !recommendations.length ? (
        <EmptyState
          title={t('home.noSuggestions')}
          description={t('home.noSuggestionsDescription')}
          actionLabel={t('home.explore')}
          onAction={() => router.push('/(discover)/explore')}
        />
      ) : null}

      <HomeRecipeStories recipes={recommendations} onSelect={openRecipe} />

      <View style={styles.feedHeading}>
        <AppText variant="heading3">{t('home.socialFeed')}</AppText>
        <AppText variant="caption" color={colors.text.secondary}>{t('home.socialPostCount', { count: communityPosts.length })}</AppText>
      </View>
      {communityPosts.length ? communityPosts.slice(0, 3).map((post) => (
        <HomeSocialPostCard key={post._id} post={post} onPress={() => router.push({ pathname: '/community/post', params: { id: post._id } })} />
      )) : <AppText color={colors.text.secondary}>{t('home.socialEmptyFeed')}</AppText>}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.md, paddingBottom: spacing['4xl'], gap: spacing.lg, backgroundColor: colors.background.base },
  feedHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.sm },
});
