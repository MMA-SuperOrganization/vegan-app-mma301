import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppButton,
  AppIcon,
  AppText,
  Badge,
  CustomHeader,
  ScreenWrapper,
  Surface,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useAuthStore } from '@/features/auth';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { useCommunityPost, usePostReaction } from '../hooks';
import { engagementApi } from '@/features/engagement/engagementApi';
import { postStatusLabel } from '../status';
import { useRecipeDetail } from '@/features/recipes/hooks';
import { PostComments } from '../components/PostComments';
import { PostDetailEngagement } from '../components/PostDetailEngagement';
import { PostFoodSummary } from '../components/PostFoodSummary';
import { PostMediaGallery } from '../components/PostMediaGallery';

export function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const vi = useTranslation().locale === 'vi';
  const userId = useAuthStore((state) => state.user?.id);
  const actions = useCommunityPost(id);
  const postReaction = usePostReaction();
  const post = actions.post.data;
  const linkedRecipe = useRecipeDetail(post?.recipeId ?? '');
  useEffect(() => {
    if (post?._id && post.status === 'published')
      void engagementApi.recordView('post', post._id).catch(() => undefined);
  }, [post?._id, post?.status]);
  const [deletingPost, setDeletingPost] = useState(false);
  const [commentFocusRequest, setCommentFocusRequest] = useState(0);
  const mine = post?.authorId === userId;
  const published = post?.status === 'published';
  const busy = actions.remove.isPending;
  return (
    <ScreenWrapper
      header={
        <CustomHeader
          title={post?.title || (vi ? 'Bài viết' : 'Post')}
          showBack
          backFallbackHref="/community"
        />
      }
    >
      <PostComments
        postId={id}
        scrollable
        showComments={published}
        contentContainerStyle={styles.screenContent}
        focusRequestKey={commentFocusRequest}
        contentHeader={
          <>
            <FeatureState
              loading={actions.post.isLoading}
              error={actions.post.error}
              retry={() => void actions.post.refetch()}
            />
            {post ? (
              <>
                <Surface padding="lg" radius="xl" style={styles.articleCard}>
                  <View style={styles.articleBadges}>
                    <Badge
                      label={vi ? 'Bài viết cộng đồng' : 'Community post'}
                      variant="primary"
                      size="sm"
                    />
                    <Badge
                      label={postStatusLabel(post.status, vi)}
                      variant={published ? 'success' : 'neutral'}
                      size="sm"
                    />
                  </View>
                  <AppText variant="heading2">{post.title}</AppText>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      vi ? 'Xem hồ sơ tác giả' : 'View author profile'
                    }
                    onPress={() =>
                      router.push({
                        pathname: '/users/[id]',
                        params: { id: post.authorId },
                      })
                    }
                    style={({ pressed }) => [
                      styles.authorRow,
                      pressed && styles.actionPressed,
                    ]}
                  >
                    <View style={styles.authorAvatar}>
                      <AppIcon
                        name="user"
                        size={20}
                        color={colors.primary[700]}
                        decorative
                      />
                    </View>
                    <View style={styles.authorCopy}>
                      <AppText variant="bodyStrong">
                        {vi ? 'Tác giả bài viết' : 'Post author'}
                      </AppText>
                      <AppText variant="caption" color={colors.text.secondary}>
                        {vi ? 'Chạm để xem hồ sơ' : 'Tap to view profile'}
                      </AppText>
                    </View>
                    <AppIcon
                      name="back"
                      size={18}
                      color={colors.primary[700]}
                      style={styles.forwardIcon}
                      decorative
                    />
                  </Pressable>
                  <View style={styles.articleDivider} />
                  <AppText selectable style={styles.articleBody}>
                    {post.content}
                  </AppText>
                </Surface>
                <PostMediaGallery assets={actions.media.data ?? []} vi={vi} />
                <FeatureState error={actions.media.error} />
                {post.recipeId || post.foodItemIds?.length ? (
                  <Surface
                    bordered
                    padding="lg"
                    radius="xl"
                    style={styles.linkedRecipeCard}
                  >
                    <AppText variant="heading3">
                      {vi ? 'Món ăn được nhắc đến' : 'Food mentioned in this post'}
                    </AppText>
                    <AppText color={colors.text.secondary}>
                      {vi
                        ? 'Xem nhanh công thức hoặc nguyên liệu liên quan đến nội dung.'
                        : 'Quickly review the recipe or ingredients related to this story.'}
                    </AppText>
                    <PostFoodSummary
                      recipeId={post.recipeId}
                      foodItemIds={post.foodItemIds}
                      relatedRecipe={post.relatedRecipe}
                      relatedFoodItems={post.relatedFoodItems}
                    />
                    <FeatureState
                      loading={Boolean(post.recipeId) && linkedRecipe.isLoading}
                      error={linkedRecipe.error}
                      retry={() => void linkedRecipe.refetch()}
                    />
                    {linkedRecipe.data ? (
                      <AppButton
                        title={vi ? 'Xem công thức đầy đủ' : 'View full recipe'}
                        variant="outline"
                        onPress={() =>
                          router.push({
                            pathname: '/(discover)/recipe/[id]',
                            params: {
                              id: linkedRecipe.data.slug ?? linkedRecipe.data._id,
                            },
                          })
                        }
                      />
                    ) : null}
                  </Surface>
                ) : null}
                {post.rejectionReason ? (
                  <AppText>{post.rejectionReason}</AppText>
                ) : null}
                {mine &&
                ['draft', 'rejected', 'published', 'archived'].includes(
                  post.status
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
                      disabled={busy}
                      onPress={() => setDeletingPost(true)}
                    />
                  )
                ) : null}
                {published ? (
                  <>
                    <PostDetailEngagement
                      vi={vi}
                      title={post.title}
                      content={post.content}
                      selectedReaction={post.reacted}
                      reactionCount={post.reactionCount ?? 0}
                      commentCount={
                        post.commentCount ?? actions.comments.data?.data.length ?? 0
                      }
                      onReact={(type, remove) =>
                        postReaction.mutate({
                          postId: post._id,
                          nextReaction: remove ? null : type,
                        })
                      }
                      onComment={() => setCommentFocusRequest((value) => value + 1)}
                      onReport={() =>
                        router.push({
                          pathname: '/community/report',
                          params: { targetType: 'post', targetId: id },
                        })
                      }
                    />
                    <FeatureState error={postReaction.error} />
                  </>
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
  screenContent: {
    padding: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  articleCard: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  articleBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.background.selected,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.surface,
  },
  authorCopy: {
    flex: 1,
    minWidth: 0,
  },
  articleDivider: {
    height: 1,
    backgroundColor: colors.border.subtle,
  },
  articleBody: {
    lineHeight: 25,
  },
  linkedRecipeCard: {
    gap: spacing.md,
  },
  actionPressed: {
    opacity: 0.72,
  },
  forwardIcon: { transform: [{ rotate: '180deg' }] },
  deleteCard: { gap: spacing.sm, borderColor: colors.status.danger },
  deleteTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
