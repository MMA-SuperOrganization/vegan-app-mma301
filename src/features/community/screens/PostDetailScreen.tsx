import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppButton,
  BackButton,
  AppIcon,
  AppText,
  Badge,
  ScreenWrapper,
  Surface,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useAuthStore } from '@/features/auth';
import { useTranslation } from '@/i18n';
import { useSafeBack } from '@/hooks';
import { colors, radius, spacing } from '@/theme';
import { useCommunityPost, usePostReaction } from '../hooks';
import { engagementApi } from '@/features/engagement/engagementApi';
import { postStatusLabel } from '../status';
import { PostComments } from '../components/PostComments';
import { PostDetailEngagement } from '../components/PostDetailEngagement';
import { PostFoodSummary } from '../components/PostFoodSummary';
import { PostMediaGallery } from '../components/PostMediaGallery';
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
  const author = usePublicProfile(post?.authorId);
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
        <View style={styles.backNavigation}>
          <BackButton onPress={goBack} />
        </View>
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
                  <View style={styles.articleTitleRow}>
                    <AppText variant="heading2" style={styles.articleTitle}>
                      {post.title}
                    </AppText>
                    {author.data?.avatarUrl ? (
                      <Image
                        source={{ uri: author.data.avatarUrl }}
                        style={styles.authorAvatar}
                        accessibilityLabel={
                          vi ? 'Ảnh đại diện tác giả' : 'Author avatar'
                        }
                      />
                    ) : (
                      <View style={styles.authorAvatarFallback}>
                        <AppIcon
                          name="user"
                          size={18}
                          color={colors.primary[700]}
                          decorative
                        />
                      </View>
                    )}
                  </View>
                  <View style={styles.articleDivider} />
                  <AppText selectable style={styles.articleBody}>
                    {post.content}
                  </AppText>
                  {published ? (
                    <>
                      <PostDetailEngagement
                        vi={vi}
                        title={post.title}
                        content={post.content}
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
  backNavigation: {
    minHeight: 64,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.base,
  },
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
  articleTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  articleTitle: { flex: 1 },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  authorAvatarFallback: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.selected,
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
  cardPressed: { opacity: 0.78 },
  deleteCard: { gap: spacing.sm, borderColor: colors.status.danger },
  deleteTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
