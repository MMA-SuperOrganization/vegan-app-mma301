import { useState } from 'react';
import { FlatList, Keyboard, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  AppText,
  EmptyState,
  LoadingSpinner,
  ScreenWrapper,
} from '@/components';
import { CreatePostSheet } from '@/features/community/components/CreatePostSheet';
import { HomeRecipeStories } from '@/features/community/components/HomeRecipeStories';
import { HomeSocialHeader } from '@/features/community/components/HomeSocialHeader';
import { HomeSocialPostCard } from '@/features/community/components/HomeSocialPostCard';
import { useCommunityPosts, usePostReaction } from '@/features/community/hooks';
import type { CommunityPost } from '@/features/community/types';
import { useDebouncedValue } from '@/hooks';
import { useTranslation } from '@/i18n';
import { getUserErrorMessage } from '@/services/errors';
import { colors, spacing } from '@/theme';

import { ContentResultCard } from '../components/ContentResultCard';
import { CreateRecipeSheet } from '../components/CreateRecipeSheet';
import { HomeInlineSearchPanel } from '../components/HomeInlineSearchPanel';
import { contentHref } from '../contentNavigation';
import {
  useHomeFeed,
  useRecentSearches,
  useSearchResults,
  useSearchSuggestions,
} from '../hooks';
import { normalizeSearchQuery } from '../searchState';
import type { ContentCardData } from '../types';

type HomeListItem =
  | { kind: 'post'; key: string; post: CommunityPost }
  | { kind: 'result'; key: string; result: ContentCardData };

export function DiscoveryHomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [postComposerOpen, setPostComposerOpen] = useState(false);
  const [recipeComposerOpen, setRecipeComposerOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const activeSearchQuery = normalizeSearchQuery(searchQuery);
  const debouncedSearchQuery = useDebouncedValue(activeSearchQuery, 300);

  const home = useHomeFeed();
  const posts = useCommunityPosts(false, 3);
  const postReaction = usePostReaction();
  const recentSearches = useRecentSearches(searchExpanded);
  const suggestions = useSearchSuggestions(debouncedSearchQuery);
  const searchResults = useSearchResults(debouncedSearchQuery, 'all');

  const featured = home.data?.featured.recipes ?? [];
  const communityPosts = posts.data?.pages.flatMap((page) => page.data) ?? [];
  const searchContent =
    searchResults.data?.pages.flatMap((page) => page.data) ?? [];
  const recommendations = home.data?.personalized?.recipes?.length
    ? home.data.personalized.recipes
    : featured;
  const searchIsSettling = Boolean(
    activeSearchQuery && activeSearchQuery !== debouncedSearchQuery
  );
  const listItems: HomeListItem[] = searchExpanded
    ? searchIsSettling
      ? []
      : searchContent.map((result) => ({
          kind: 'result',
          key: `result-${result.type ?? 'recipe'}-${result._id}`,
          result,
        }))
    : communityPosts.map((post) => ({
        kind: 'post',
        key: `post-${post._id}`,
        post,
      }));

  const openRecipe = (recipe: ContentCardData) =>
    router.push({
      pathname: '/(discover)/recipe/[id]',
      params: { id: recipe.slug ?? recipe._id },
    });

  const closeSearch = () => {
    setSearchExpanded(false);
    setSearchQuery('');
  };

  const refresh = () => {
    if (searchExpanded) {
      void recentSearches.refetch();
      if (activeSearchQuery) {
        void suggestions.refetch();
        void searchResults.refetch();
      }
      return;
    }
    void home.refetch();
    void posts.refetch();
  };

  return (
    <ScreenWrapper keyboardAvoiding={false} edges={['top', 'left', 'right']}>
      <FlatList
        data={listItems}
        keyExtractor={(item) => item.key}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={4}
        maxToRenderPerBatch={5}
        windowSize={7}
        contentContainerStyle={styles.screen}
        ItemSeparatorComponent={() => <View style={styles.feedSeparator} />}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <HomeSocialHeader
              onCreatePost={() => setPostComposerOpen(true)}
              searchExpanded={searchExpanded}
              searchQuery={searchQuery}
              onOpenSearch={() => setSearchExpanded(true)}
              onCloseSearch={closeSearch}
              onChangeSearch={setSearchQuery}
              onSubmitSearch={() => Keyboard.dismiss()}
            />

            {searchExpanded ? (
              <HomeInlineSearchPanel
                query={activeSearchQuery}
                suggestions={suggestions.data}
                recent={recentSearches.data}
                isLoadingSuggestions={searchIsSettling || suggestions.isLoading}
                isLoadingRecent={recentSearches.isLoading}
                suggestionsFailed={suggestions.isError}
                recentFailed={recentSearches.isError}
                onSelectQuery={(query) => {
                  setSearchQuery(query);
                  Keyboard.dismiss();
                }}
                onRetrySuggestions={() => void suggestions.refetch()}
                onRetryRecent={() => void recentSearches.refetch()}
              />
            ) : (
              <>
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
                {!home.isLoading &&
                !home.isError &&
                !recommendations.length ? (
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
                {!posts.isLoading &&
                !posts.isError &&
                !communityPosts.length ? (
                  <AppText color={colors.text.secondary}>
                    {t('home.socialEmptyFeed')}
                  </AppText>
                ) : null}
              </>
            )}
          </View>
        }
        ListEmptyComponent={
          searchExpanded && activeSearchQuery ? (
            searchIsSettling || searchResults.isLoading ? (
              <LoadingSpinner text={t('discover.searching')} />
            ) : searchResults.isError ? (
              <EmptyState
                title={t('discover.searchError')}
                description={getUserErrorMessage(searchResults.error)}
                actionLabel={t('common.retry')}
                onAction={() => void searchResults.refetch()}
              />
            ) : (
              <EmptyState
                title={t('discover.noResults')}
                description={t('discover.noResultsDescription')}
              />
            )
          ) : null
        }
        renderItem={({ item }) =>
          item.kind === 'result' ? (
            <ContentResultCard
              item={item.result}
              onPress={() => router.push(contentHref(item.result))}
            />
          ) : (
            <HomeSocialPostCard
              post={item.post}
              onReact={() =>
                postReaction.mutate({
                  postId: item.post._id,
                  nextReaction: item.post.reacted === 'like' ? null : 'like',
                })
              }
              onPress={() =>
                router.push({
                  pathname: '/community/post',
                  params: { id: item.post._id },
                })
              }
            />
          )
        }
        ListFooterComponent={
          searchExpanded ? (
            searchResults.isFetchingNextPage ? (
              <View style={styles.feedFooter}>
                <LoadingSpinner text={t('discover.searching')} />
              </View>
            ) : null
          ) : posts.isFetchingNextPage ? (
            <View style={styles.feedFooter}>
              <LoadingSpinner text={t('home.loadingMorePosts')} />
            </View>
          ) : null
        }
        refreshing={
          searchExpanded
            ? searchResults.isRefetching || recentSearches.isRefetching
            : (home.isRefetching || posts.isRefetching) && !posts.isLoading
        }
        onRefresh={refresh}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (searchExpanded) {
            if (
              searchResults.hasNextPage &&
              !searchResults.isFetchingNextPage
            ) {
              void searchResults.fetchNextPage();
            }
          } else if (posts.hasNextPage && !posts.isFetchingNextPage) {
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
  screen: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
    backgroundColor: colors.background.base,
  },
  headerContent: { gap: spacing.lg, marginBottom: spacing.lg },
  feedHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  feedSeparator: { height: spacing.lg },
  feedFooter: { paddingVertical: spacing.xl },
});
