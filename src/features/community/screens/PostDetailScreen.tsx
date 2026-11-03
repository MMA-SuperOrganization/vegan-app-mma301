import { useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, Share, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppButton,
  BackButton,
  AppIcon,
  AppText,
  ScreenWrapper,
  Surface,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useAuthStore } from '@/features/auth';
import { useTranslation } from '@/i18n';
import { useSafeBack } from '@/hooks';
import { colors, spacing, webLayout } from '@/theme';
import { useCommunityPost, usePostReaction } from '../hooks';
import { useSavedMutation, useSavedState } from '@/features/recipes/hooks';
import { engagementApi } from '@/features/engagement/engagementApi';
import { PostComments } from '../components/PostComments';
import { PostDetailEngagement } from '../components/PostDetailEngagement';
import { PostFoodSummary } from '../components/PostFoodSummary';
import { PostMediaGallery } from '../components/PostMediaGallery';
import { PostAuthorHeader } from '../components/PostAuthorHeader';
import { postCopy } from '../postPresentation';
import { usePublicProfile } from '@/features/profile/hooks';

export function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const goBack = useSafeBack('/community');
  const vi = useTranslation().locale === 'vi';
  const userId = useAuthStore((state) => state.user?.id);
  const actions = useCommunityPost(id);
  const postReaction = usePostReaction();
  const post = actions.post.data;
  const author = usePublicProfile(post?.author ? undefined : post?.authorId);
  const copy = postCopy(post?.title, post?.content);
  const sharePost = () =>
    Share.share({ message: copy.content || copy.title || '' });
  const savedState = useSavedState('post', id);
  const savedMutation = useSavedMutation();
  const isSaved = savedState.isSaved;
  const toggleSave = () => {
    savedMutation.mutate({
      type: 'post',
      id,
      saved: isSaved,
      target: {
        _id: id,
        type: 'post',
        title: post?.title || post?.content?.slice(0, 50),
        excerpt: post?.content?.slice(0, 100),
        imageUrl: actions.media.data?.[0]?.downloadUrl,
      },
    });
  };
  const presentedAuthor =
    post?.author ??
    (author.data
      ? {
          userId: post?.authorId ?? '',
          displayName: author.data.displayName,
          avatarUrl: author.data.avatarUrl,
        }
      : null);
  useEffect(() => {
    if (post?._id && post.status === 'published')
      void engagementApi.recordView('post', post._id).catch(() => undefined);
  }, [post?._id, post?.status]);
  const [deletingPost, setDeletingPost] = useState(false);
  const [commentFocusRequest, setCommentFocusRequest] = useState(0);
  const [postMenuOpen, setPostMenuOpen] = useState(false);
  const moreButtonRef = useRef<View>(null);
  const [menuCoords, setMenuCoords] = useState<{ top: number; right: number }>({
    top: 60,
    right: 16,
  });

  const toggleMenu = () => {
    if (postMenuOpen) {
      setPostMenuOpen(false);
      return;
    }
    moreButtonRef.current?.measureInWindow((x, y, width, height) => {
      const windowWidth = Dimensions.get('window').width;
      const top = y && height ? y + height + 6 : 60;
      const right = x && width ? Math.max(16, windowWidth - (x + width)) : 16;
      setMenuCoords({ top, right });
      setPostMenuOpen(true);
    });
  };
  const mine = post?.authorId === userId;
  const published = post?.status === 'published';
  const busy = actions.remove.isPending;
  const reportPost = () => {
    setPostMenuOpen(false);
    router.push({
      pathname: '/community/report',
      params: {
        targetType: 'post',
        targetId: id,
        targetPreview: post?.title ?? '',
      },
    });
  };
  const editPost = () => {
    setPostMenuOpen(false);
    router.push({ pathname: '/community/editor', params: { id } });
  };
  const requestDelete = () => {
    setPostMenuOpen(false);
    setDeletingPost(true);
  };
  return (
    <ScreenWrapper webMaxWidth={webLayout.feedMaxWidth}>
      <PostComments
        postId={id}
        scrollable
        showComments={published}
        contentContainerStyle={styles.screenContent}
        focusRequestKey={commentFocusRequest}
        contentHeader={
          <>
            {!post ? (
              <View style={styles.loadingNavigation}>
                <BackButton onPress={goBack} />
              </View>
            ) : null}
            <FeatureState
              loading={actions.post.isLoading}
              error={actions.post.error}
              retry={() => void actions.post.refetch()}
            />
            {post ? (
              <>
                <View style={styles.articleCard}>
                  <View style={styles.articleContent}>
                    <View style={styles.articleHeaderRow}>
                      <BackButton
                        onPress={goBack}
                        size={28}
                        iconSize={20}
                        style={styles.stickyBackButton}
                      />
                      <PostAuthorHeader
                        author={presentedAuthor}
                        createdAt={post.createdAt}
                        publishedAt={post.publishedAt}
                        status={post.status}
                        visibility={post.visibility}
                        vi={vi}
                        trailing={<View style={styles.authorAvatar} />}
                        // FR-PROFILE-05: tạm tắt, chờ nhóm thống nhất việc mở hồ sơ tác giả
                        // từ màn bài viết (tests/action-icons.test.mjs đang cấm). Bật lại bằng
                        // cách bỏ comment và import openAuthorProfile từ @/features/profile/authorProfile.
                        // onAuthorPress={
                        //   post.authorId
                        //     ? () => openAuthorProfile(router, post.authorId)
                        //     : undefined
                        // }
                      />
                      <View style={styles.moreWrap} ref={moreButtonRef} collapsable={false}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={
                            vi ? 'Mở tùy chọn bài viết' : 'Open post options'
                          }
                          accessibilityState={{ expanded: postMenuOpen }}
                          onPress={toggleMenu}
                          hitSlop={10}
                          style={({ pressed }) => [
                            styles.moreButton,
                            pressed && styles.cardPressed,
                          ]}
                        >
                          <AppText style={styles.moreIcon}>•••</AppText>
                        </Pressable>
                        <Modal
                          visible={postMenuOpen}
                          transparent
                          animationType="fade"
                          onRequestClose={() => setPostMenuOpen(false)}
                          statusBarTranslucent
                        >
                          <Pressable
                            accessibilityLabel={vi ? 'Đóng tùy chọn bài viết' : 'Close post options'}
                            style={styles.menuBackdrop}
                            onPress={() => setPostMenuOpen(false)}
                          >
                            <View
                              style={[
                                styles.postMenu,
                                {
                                  position: 'absolute',
                                  top: menuCoords.top,
                                  right: menuCoords.right,
                                },
                              ]}
                            >
                            <Pressable
                              accessibilityRole="button"
                              onPress={() => {
                                setPostMenuOpen(false);
                                toggleSave();
                              }}
                              style={({ pressed }) => [
                                styles.menuItem,
                                pressed && styles.cardPressed,
                              ]}
                            >
                              <AppIcon
                                name={isSaved ? 'bookmark-filled' : 'bookmark'}
                                size={17}
                                color={isSaved ? colors.primary[700] : colors.text.secondary}
                                decorative
                              />
                              <AppText
                                variant="bodySmall"
                                color={isSaved ? colors.primary[700] : colors.text.primary}
                              >
                                {vi
                                  ? isSaved
                                    ? 'Bỏ lưu bài viết'
                                    : 'Lưu bài viết'
                                  : isSaved
                                    ? 'Unsave post'
                                    : 'Save post'}
                              </AppText>
                            </Pressable>
                            <Pressable
                              accessibilityRole="button"
                              onPress={reportPost}
                              style={({ pressed }) => [
                                styles.menuItem,
                                pressed && styles.cardPressed,
                              ]}
                            >
                              <AppIcon name="flag" size={17} color={colors.text.secondary} decorative />
                              <AppText variant="bodySmall">
                                {vi ? 'Báo cáo' : 'Report'}
                              </AppText>
                            </Pressable>
                            {mine ? (
                              <>
                              <Pressable
                                accessibilityRole="button"
                                onPress={editPost}
                                style={({ pressed }) => [
                                  styles.menuItem,
                                  pressed && styles.cardPressed,
                                ]}
                              >
                                <AppIcon name="edit" size={17} color={colors.text.secondary} decorative />
                                <AppText variant="bodySmall">
                                  {vi ? 'Chỉnh sửa bài viết' : 'Edit post'}
                                </AppText>
                              </Pressable>
                              <Pressable
                                accessibilityRole="button"
                                onPress={requestDelete}
                                style={({ pressed }) => [
                                  styles.menuItem,
                                  pressed && styles.cardPressed,
                                ]}
                              >
                                <AppIcon name="trash" size={17} color={colors.status.danger} decorative />
                                <AppText variant="bodySmall" color={colors.status.danger}>
                                  {vi ? 'Xóa bài viết' : 'Delete post'}
                                </AppText>
                              </Pressable>
                              </>
                            ) : null}
                            </View>
                          </Pressable>
                        </Modal>
                      </View>
                    </View>
                    {copy.content || copy.title ? (
                      <AppText selectable style={styles.articleBody}>
                        {copy.content || copy.title}
                      </AppText>
                    ) : null}
                  </View>

                  <View style={styles.hiddenBackButton} />

                  <PostMediaGallery assets={actions.media.data ?? []} vi={vi} />
                  <FeatureState error={actions.media.error} />

                  {post.recipeId || post.foodItemIds?.length ? (
                    <View style={styles.linkedRecipeCard}>
                      <AppText variant="bodyStrong">
                        {vi ? 'Món ăn được nhắc đến' : 'Food mentioned in this post'}
                      </AppText>
                      {post.recipeId ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={
                            vi ? 'Mở công thức liên quan' : 'Open related recipe'
                          }
                          onPress={() =>
                            router.push({
                              pathname: '/(discover)/recipe/[id]',
                              params: {
                                id:
                                  post.relatedRecipe?.slug ??
                                  post.relatedRecipe?._id ??
                                  post.recipeId!,
                              },
                            })
                          }
                          style={({ pressed }) => pressed && styles.cardPressed}
                        >
                          <PostFoodSummary
                            recipeId={post.recipeId}
                            foodItemIds={post.foodItemIds}
                            relatedRecipe={post.relatedRecipe}
                            relatedFoodItems={post.relatedFoodItems}
                          />
                        </Pressable>
                      ) : (
                        <PostFoodSummary
                          foodItemIds={post.foodItemIds}
                          relatedFoodItems={post.relatedFoodItems}
                        />
                      )}
                    </View>
                  ) : null}

                  {published ? (
                    <View style={styles.engagement}>
                      <PostDetailEngagement
                        vi={vi}
                        selectedReaction={post.reacted}
                        reactionCount={post.reactionCount ?? 0}
                        commentCount={
                          post.commentCount ??
                          actions.comments.data?.data.length ??
                          0
                        }
                        onReact={(type, remove) =>
                          postReaction.mutate({
                            postId: post._id,
                            nextReaction: remove ? null : type,
                          })
                        }
                        onComment={() =>
                          setCommentFocusRequest((value) => value + 1)
                        }
                        saved={isSaved}
                        onSave={toggleSave}
                      />
                      <FeatureState error={postReaction.error} />
                    </View>
                  ) : null}
                </View>
                {post.rejectionReason ? (
                  <AppText>{post.rejectionReason}</AppText>
                ) : null}
                {false &&
                ['draft', 'rejected', 'published', 'archived'].includes(
                  post?.status ?? ''
                ) ? (
                  <>
                    <AppButton
                      title={vi ? 'Sửa bài' : 'Edit post'}
                      disabled={busy}
                      onPress={() =>
                        router.push({
                          pathname: '/community/editor',
                          params: { id },
                        })
                      }
                    />
                  </>
                ) : null}
                {mine ? (
                  deletingPost ? (
                    <Surface
                      bordered
                      padding="lg"
                      radius="xl"
                      style={styles.deleteCard}
                    >
                      <View style={styles.deleteTitle}>
                        <AppIcon
                          name="trash"
                          size={20}
                          color={colors.status.danger}
                          decorative
                        />
                        <AppText variant="bodyStrong" color={colors.status.danger}>
                          {vi ? 'Xóa bài viết này?' : 'Delete this post?'}
                        </AppText>
                      </View>
                      <AppText variant="bodySmall" color={colors.text.secondary}>
                        {vi
                          ? 'Bài viết và các tương tác liên quan sẽ không còn hiển thị.'
                          : 'The post and its engagement will no longer be visible.'}
                      </AppText>
                      <AppButton
                        title={vi ? 'Xác nhận xóa' : 'Confirm deletion'}
                        variant="danger"
                        disabled={busy}
                        loading={busy}
                        onPress={() =>
                          actions.remove.mutate(id, {
                            onSuccess: () => router.replace('/community'),
                          })
                        }
                      />
                      <AppButton
                        title={vi ? 'Hủy' : 'Cancel'}
                        variant="ghost"
                        onPress={() => setDeletingPost(false)}
                      />
                    </Surface>
                  ) : (
                    <AppButton
                      title={vi ? 'Xóa bài' : 'Delete post'}
                      variant="ghost"
                      style={{ display: 'none' }}
                      disabled={busy}
                      onPress={() => setDeletingPost(true)}
                    />
                  )
                ) : null}
              </>
            ) : null}
            <FeatureState error={actions.remove.error} />
          </>
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingNavigation: { alignItems: 'flex-start' },
  screenContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  articleCard: {
    gap: spacing.md,
  },
  articleContent: { gap: spacing.md },
  articleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stickyBackButton: {
    flexShrink: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  hiddenBackButton: { display: 'none' },
  authorAvatar: { width: 0, height: 0 },
  moreButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  moreWrap: { position: 'relative', zIndex: 20 },
  menuBackdrop: { flex: 1, backgroundColor: 'transparent' },
  moreIcon: {
    color: colors.text.secondary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  postMenu: {
    position: 'absolute',
    top: 40,
    right: 0,
    width: 178,
    padding: spacing.xs,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 10,
    backgroundColor: colors.background.surface,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  menuItem: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 7,
  },
  articleBody: {
    lineHeight: 25,
  },
  linkedRecipeCard: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  engagement: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  cardPressed: { opacity: 0.78 },
  deleteCard: { gap: spacing.sm, borderColor: colors.status.danger },
  deleteTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
