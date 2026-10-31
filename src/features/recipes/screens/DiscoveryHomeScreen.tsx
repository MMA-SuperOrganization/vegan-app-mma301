import { getUserErrorMessage } from '@/services/errors';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
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
import { CreatePostSheet } from '@/features/community/components/CreatePostSheet';
import { useCommunityPosts, usePostReaction } from '@/features/community/hooks';
import { CreateRecipeSheet } from '../components/CreateRecipeSheet';
import { useHomeFeed } from '../hooks';
import type { ContentCardData } from '../types';

export function DiscoveryHomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [postComposerOpen, setPostComposerOpen] = useState(false);
  const [recipeComposerOpen, setRecipeComposerOpen] = useState(false);
  const home = useHomeFeed();
  const posts = useCommunityPosts(false, 3);
  const postReaction = usePostReaction();
  const featured = home.data?.featured.recipes ?? [];
  const communityPosts = posts.data?.pages.flatMap((page) => page.data) ?? [];
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
      keyboardAvoiding={false}
      edges={['top', 'left', 'right']}
    >
      <FlatList
        data={communityPosts}
        keyExtractor={(post) => post._id}
        initialNumToRender={4}
        maxToRenderPerBatch={5}
        windowSize={7}
        contentContainerStyle={styles.screen}
        ItemSeparatorComponent={() => <View style={styles.feedSeparator} />}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <HomeSocialHeader
              onCreatePost={() => setPostComposerOpen(true)}
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

            <HomeRecipeStories
              recipes={recommendations}
              onCreateRecipe={() => setRecipeComposerOpen(true)}
              onSelect={openRecipe}
            />

            <View style={styles.feedHeading}>
              <AppText variant="heading3">{t('home.socialFeed')}</AppText>
            </View>

            {posts.isLoading ? (
              <LoadingSpinner text={t('home.loadingMorePosts')} />
            ) : null}
            {posts.isError ? (
              <EmptyState
                title={t('home.postFeedError')}
                description={getUserErrorMessage(posts.error)}
                actionLabel={t('common.retry')}
                onAction={() => void posts.refetch()}
              />
            ) : null}
            {!posts.isLoading && !posts.isError && !communityPosts.length ? (
              <AppText color={colors.text.secondary}>
                {t('home.socialEmptyFeed')}
              </AppText>
            ) : null}
          </View>
        }
        renderItem={({ item: post }) => (
          <HomeSocialPostCard
            post={post}
            onReact={() =>
              postReaction.mutate({
                postId: post._id,
                nextReaction: post.reacted === 'like' ? null : 'like',
              })
            }
            onPress={() =>
              router.push({
                pathname: '/community/post',
                params: { id: post._id },
              })
            }
          />
        )}
        ListFooterComponent={
          posts.isFetchingNextPage ? (
            <View style={styles.feedFooter}>
              <LoadingSpinner text={t('home.loadingMorePosts')} />
            </View>
          ) : null
        }
        refreshing={(home.isRefetching || posts.isRefetching) && !posts.isLoading}
        onRefresh={() => {
          void home.refetch();
          void posts.refetch();
        }}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (posts.hasNextPage && !posts.isFetchingNextPage) {
            void posts.fetchNextPage();
          }
        }}
      />

      <CreatePostSheet
        visible={postComposerOpen}
        onClose={() => setPostComposerOpen(false)}
      />
      <CreateRecipeSheet
        visible={recipeComposerOpen}
        onClose={() => setRecipeComposerOpen(false)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.md, paddingBottom: spacing['4xl'], backgroundColor: colors.background.base },
  headerContent: { gap: spacing.lg, marginBottom: spacing.lg },
  feedHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.sm },
  feedSeparator: { height: spacing.lg },
  feedFooter: { paddingVertical: spacing.xl },
});
