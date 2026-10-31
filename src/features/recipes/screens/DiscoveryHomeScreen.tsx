import { getUserErrorMessage } from '@/services/errors';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  AppText,
  EmptyState,
  LoadingSpinner,
  ScreenWrapper,
} from '@/components';
import { useProfileStore } from '@/features/profile/profileStore';
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
  const profile = useProfileStore((state) => state.data);
  const home = useHomeFeed();
  const firstName =
    profile?.user.name.trim().split(/\s+/).at(-1) || t('common.youLower');
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
        name={firstName}
        avatarUrl={profile?.user.avatarUrl}
        onCreatePost={() => router.push('/community/editor')}
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
        <AppText variant="heading3">Bài viết mới nhất</AppText>
        <AppText variant="caption" color={colors.text.secondary}>{communityPosts.length} bài viết</AppText>
      </View>
      {communityPosts.length ? communityPosts.slice(0, 3).map((post) => (
        <HomeSocialPostCard key={post._id} post={post} onPress={() => router.push({ pathname: '/community/post', params: { id: post._id } })} />
      )) : <AppText color={colors.text.secondary}>Chưa có bài viết mới.</AppText>}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.md, paddingBottom: spacing['4xl'], gap: spacing.lg, backgroundColor: colors.background.base },
  feedHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.sm },
});
