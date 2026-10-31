import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import {
  AppButton,
  AppText,
  CustomHeader,
  LoadingSpinner,
  ScreenWrapper,
  Surface,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';

import { communityApi } from '../communityApi';
import { CommunityPostCard } from '../components/CommunityPostCard';
import { useCommunityPosts, useCommunityVideos, usePostReaction } from '../hooks';
import { postStatusLabel } from '../status';
import type { CommunityPost, CommunityVideo } from '../types';

type ContentType = 'posts' | 'videos';

function Segment({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.segment,
        selected && styles.segmentSelected,
        pressed && styles.pressed,
      ]}
    >
      <AppText
        variant="bodyStrong"
        color={selected ? colors.text.inverse : colors.text.secondary}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

export function CommunityScreen() {
  const router = useRouter();
  const vi = useTranslation().locale === 'vi';
  const [mine, setMine] = useState(false);
  const [contentType, setContentType] = useState<ContentType>('posts');
  const posts = useCommunityPosts(mine);
  const postReaction = usePostReaction();
  const videos = useCommunityVideos(mine);
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: ['account'] });
  const archivePost = useMutation({
    mutationFn: communityApi.archivePost,
    onSuccess: refresh,
  });
  const archiveVideo = useMutation({
    mutationFn: communityApi.archiveVideo,
    onSuccess: refresh,
  });
  const postFeed = posts.data?.pages.flatMap((page) => page.data) ?? [];
  const videoFeed = videos.data?.data ?? [];
  const feedItems: Array<
    { kind: 'post'; value: CommunityPost } | { kind: 'video'; value: CommunityVideo }
  > =
    contentType === 'posts'
      ? postFeed.map((value) => ({ kind: 'post', value }))
      : videoFeed.map((value) => ({ kind: 'video', value }));
  const currentLoading =
    contentType === 'posts' ? posts.isLoading : videos.isLoading;
  const currentError = contentType === 'posts' ? posts.error : videos.error;
  const currentRefetching =
    contentType === 'posts' ? posts.isRefetching : videos.isRefetching;
  const refetchCurrent = () =>
    contentType === 'posts' ? posts.refetch() : videos.refetch();
  const writeLabel =
    contentType === 'posts'
      ? vi
        ? 'Viết bài mới'
        : 'Write a post'
      : vi
        ? 'Đăng video'
        : 'Upload video';

  return (
    <ScreenWrapper
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
        keyExtractor={(item) => `${item.kind}-${item.value._id}`}
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
                title={writeLabel}
                onPress={() =>
                  router.push(
                    contentType === 'posts'
                      ? '/community/editor'
                      : '/community/video-editor'
                  )
                }
              />
              <AppText variant="caption" color={colors.text.secondary}>
                {contentType === 'posts'
                  ? vi
                    ? 'Bài viết được đăng ngay và có thể báo cáo nếu vi phạm.'
                    : 'Posts publish immediately and can be reported if they violate rules.'
                  : vi
                    ? 'Video vẫn đi qua quy trình xử lý và kiểm duyệt.'
                    : 'Videos still follow processing and review.'}
              </AppText>
            </Surface>

            <View style={styles.segmentGroup}>
              <Segment
                label={vi ? 'Bài viết' : 'Posts'}
                selected={contentType === 'posts'}
                onPress={() => setContentType('posts')}
              />
              <Segment
                label="Video"
                selected={contentType === 'videos'}
                onPress={() => setContentType('videos')}
              />
            </View>

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
              loading={currentLoading}
              error={currentError}
              retry={() => void refetchCurrent()}
            />

            {!currentLoading && feedItems.length === 0 ? (
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
        renderItem={({ item }) =>
          item.kind === 'post' ? (
            <CommunityPostCard
              post={item.value}
              mine={mine}
              vi={vi}
              onReact={() =>
                postReaction.mutate({
                  postId: item.value._id,
                  nextReaction: item.value.reacted === 'like' ? null : 'like',
                })
              }
              onOpen={() =>
                router.push({
                  pathname: '/community/post',
                  params: { id: item.value._id },
                })
              }
              onArchive={
                mine &&
                ['draft', 'rejected', 'published'].includes(item.value.status)
                  ? () =>
                      Alert.alert(
                        vi ? 'Lưu trữ bài viết?' : 'Archive post?',
                        item.value.title,
                        [
                          { text: vi ? 'Hủy' : 'Cancel', style: 'cancel' },
                          {
                            text: vi ? 'Lưu trữ' : 'Archive',
                            onPress: () => archivePost.mutate(item.value),
                          },
                        ]
                      )
                  : undefined
              }
            />
          ) : (
            <Surface bordered padding="lg" radius="xl" style={styles.videoCard}>
              <View style={styles.videoHeading}>
                <AppText variant="heading3" style={styles.feedCopy}>
                  {item.value.title}
                </AppText>
                {mine ? (
                  <AppText variant="caption" color={colors.primary[700]}>
                    {postStatusLabel(item.value.status, vi)}
                  </AppText>
                ) : null}
              </View>
              <AppText color={colors.text.secondary} numberOfLines={3}>
                {item.value.description}
              </AppText>
              <AppButton
                title={vi ? 'Xem video' : 'View video'}
                variant="outline"
                onPress={() =>
                  router.push({
                    pathname: '/community/video',
                    params: { id: item.value._id },
                  })
                }
              />
              {mine &&
              ['draft', 'rejected', 'published'].includes(item.value.status) ? (
                <AppButton
                  title={vi ? 'Lưu trữ video' : 'Archive video'}
                  variant="ghost"
                  disabled={archiveVideo.isPending}
                  onPress={() => archiveVideo.mutate(item.value)}
                />
              ) : null}
            </Surface>
          )
        }
        ListFooterComponent={
          posts.isFetchingNextPage ? (
            <View style={styles.feedFooter}>
              <LoadingSpinner
                text={vi ? 'Đang tải thêm bài viết…' : 'Loading more posts…'}
              />
            </View>
          ) : null
        }
        refreshing={currentRefetching && !currentLoading}
        onRefresh={() => void refetchCurrent()}
        onEndReachedThreshold={0.6}
        onEndReached={() => {
          if (
            contentType === 'posts' &&
            posts.hasNextPage &&
            !posts.isFetchingNextPage
          )
            void posts.fetchNextPage();
        }}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'] },
  listHeader: { gap: spacing.xl, marginBottom: spacing.xl },
  feedSeparator: { height: spacing.xl },
  feedFooter: { paddingVertical: spacing.xl },
  hero: { gap: spacing.lg },
  heroCopy: { gap: spacing.sm },
  segmentGroup: {
    flexDirection: 'row',
    padding: spacing.xs,
    gap: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.background.muted,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: { backgroundColor: colors.primary[700] },
  pressed: { opacity: 0.74 },
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
  videoCard: { gap: spacing.md },
  videoHeading: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
});
