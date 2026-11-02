import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  AppButton,
  AppText,
  CustomHeader,
  LoadingSpinner,
  ScreenWrapper,
  Surface,
  appDialog,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing, webLayout } from '@/theme';

import { communityApi } from '../communityApi';
import { CommunityPostCard } from '../components/CommunityPostCard';
import { PostCommentsSheet } from '../components/PostComments';
import { useCommunityPosts, usePostReaction } from '../hooks';
import type { CommunityPost } from '../types';

export function CommunityScreen() {
  const router = useRouter();
  const { scope } = useLocalSearchParams<{ scope?: string }>();
  const vi = useTranslation().locale === 'vi';
  const [mine, setMine] = useState(scope === 'mine');
  const [commentPostId, setCommentPostId] = useState<string>();
  const posts = useCommunityPosts(mine);
  const postReaction = usePostReaction();
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: ['account'] });
  const archivePost = useMutation({
    mutationFn: communityApi.archivePost,
    onSuccess: refresh,
  });

  useEffect(() => {
    if (scope !== 'mine') return;
    setMine(true);
  }, [scope]);

  const feedItems = posts.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <>
      <ScreenWrapper
        webMaxWidth={webLayout.feedMaxWidth}
        header={
          <CustomHeader
            title={vi ? 'Cộng đồng' : 'Community'}
            showBack
            backFallbackHref="/(tabs)/profile"
          />
        }
      >
        <FlatList
          data={feedItems}
          keyExtractor={(item) => item._id}
          initialNumToRender={5}
          maxToRenderPerBatch={6}
          windowSize={7}
          removeClippedSubviews
          contentContainerStyle={styles.screen}
          ItemSeparatorComponent={() => <View style={styles.feedSeparator} />}
          ListHeaderComponentStyle={styles.listHeader}
          ListHeaderComponent={
            <>
              <Surface tone="selected" padding="xl" radius="xl" style={styles.hero}>
                <View style={styles.heroCopy}>
                  <AppText variant="heading2">
                    {vi ? 'Cộng đồng ăn xanh' : 'Plant-powered community'}
                  </AppText>
                  <AppText color={colors.text.secondary}>
                    {vi
                      ? 'Lướt chia sẻ mới nhất, trao đổi mẹo nấu và trải nghiệm ăn xanh. Công thức vẫn là nội dung độc lập.'
                      : 'Browse the latest stories, cooking tips and plant-based experiences. Recipes remain independent.'}
                  </AppText>
                </View>
                <AppButton
                  title={vi ? 'Viết bài mới' : 'Write a post'}
                  onPress={() => router.push('/community/editor')}
                />
                <AppText variant="caption" color={colors.text.secondary}>
                  {vi
                    ? 'Bài viết được đăng ngay và có thể báo cáo nếu vi phạm.'
                    : 'Posts publish immediately and can be reported if they violate rules.'}
                </AppText>
              </Surface>

              <View style={styles.feedHeader}>
                <View style={styles.feedCopy}>
                  <AppText variant="heading3">
                    {mine
                      ? vi
                        ? 'Bài của tôi'
                        : 'My posts'
                      : vi
                        ? 'Bảng tin mới nhất'
                        : 'Latest feed'}
                  </AppText>
                  <AppText variant="bodySmall" color={colors.text.secondary}>
                    {mine
                      ? vi
                        ? 'Quản lý những nội dung bạn đã đăng.'
                        : 'Manage the content you have published.'
                      : vi
                        ? 'Cuộn xuống để tự động tải thêm bài viết.'
                        : 'Scroll down to automatically load more posts.'}
                  </AppText>
                </View>
                <View style={styles.scopeToggle}>
                  <Pressable
                    onPress={() => setMine(false)}
                    style={[styles.scopeButton, !mine && styles.scopeButtonSelected]}
                  >
                    <AppText
                      variant="caption"
                      color={!mine ? colors.primary[700] : undefined}
                    >
                      {vi ? 'Mới nhất' : 'Latest'}
                    </AppText>
                  </Pressable>
                  <Pressable
                    onPress={() => setMine(true)}
                    style={[styles.scopeButton, mine && styles.scopeButtonSelected]}
                  >
                    <AppText
                      variant="caption"
                      color={mine ? colors.primary[700] : undefined}
                    >
                      {vi ? 'Của tôi' : 'Mine'}
                    </AppText>
                  </Pressable>
                </View>
              </View>

              <FeatureState
                loading={posts.isLoading}
                error={posts.error}
                retry={() => void posts.refetch()}
              />

              {!posts.isLoading && feedItems.length === 0 ? (
                <Surface bordered padding="xl" radius="xl" style={styles.empty}>
                  <AppText variant="heading4">
                    {vi ? 'Chưa có nội dung ở đây' : 'Nothing here yet'}
                  </AppText>
                  <AppText color={colors.text.secondary}>
                    {mine
                      ? vi
                        ? 'Hãy tạo bài viết đầu tiên của bạn.'
                        : 'Create your first post.'
                      : vi
                        ? 'Bài viết mới sẽ xuất hiện tại đây.'
                        : 'New posts will appear here.'}
                  </AppText>
                </Surface>
              ) : null}
            </>
          }
          renderItem={({ item }) => (
            <CommunityPostCard
              post={item}
              mine={mine}
              vi={vi}
              onReact={() =>
                postReaction.mutate({
                  postId: item._id,
                  nextReaction: item.reacted === 'like' ? null : 'like',
                })
              }
              onComment={() => setCommentPostId(item._id)}
              onOpen={() =>
                router.push({
                  pathname: '/community/post',
                  params: { id: item._id },
                })
              }
              onArchive={
                mine &&
                ['draft', 'rejected', 'published'].includes(item.status)
                  ? () =>
                      appDialog.alert(
                        vi ? 'Lưu trữ bài viết?' : 'Archive post?',
                        item.title,
                        [
                          { text: vi ? 'Hủy' : 'Cancel', style: 'cancel' },
                          {
                            text: vi ? 'Lưu trữ' : 'Archive',
                            onPress: () => archivePost.mutate(item),
                          },
                        ]
                      )
                  : undefined
              }
            />
          )}
          ListFooterComponent={
            posts.isFetchingNextPage ? (
              <View style={styles.feedFooter}>
                <LoadingSpinner
                  text={vi ? 'Đang tải thêm bài viết…' : 'Loading more posts…'}
                />
              </View>
            ) : null
          }
          refreshing={posts.isRefetching && !posts.isLoading}
          onRefresh={() => void posts.refetch()}
          onEndReachedThreshold={0.6}
          onEndReached={() => {
            if (posts.hasNextPage && !posts.isFetchingNextPage) {
              void posts.fetchNextPage();
            }
          }}
        />
      </ScreenWrapper>
      <PostCommentsSheet
        key={commentPostId ?? 'comments-closed'}
        visible={Boolean(commentPostId)}
        postId={commentPostId}
        onClose={() => setCommentPostId(undefined)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'] },
  listHeader: { gap: spacing.xl, marginBottom: spacing.xl },
  feedSeparator: { height: spacing.xl },
  feedFooter: { paddingVertical: spacing.xl },
  hero: { gap: spacing.lg },
  heroCopy: { gap: spacing.sm },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  feedCopy: { flex: 1, gap: spacing.xs },
  scopeToggle: { flexDirection: 'row', gap: spacing.xs },
  scopeButton: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.muted,
  },
  scopeButtonSelected: { backgroundColor: colors.background.selected },
  empty: { alignItems: 'center', gap: spacing.sm },
});
