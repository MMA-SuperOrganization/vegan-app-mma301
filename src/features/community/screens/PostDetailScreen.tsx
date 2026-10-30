import { useEffect, useState } from 'react';
import { Image, Pressable, Share, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppButton,
  AppIcon,
  AppInput,
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
import { useCommunityPost } from '../hooks';
import { engagementApi } from '@/features/engagement/engagementApi';
import { ReactionButtons } from '@/features/engagement/ReactionButtons';
import { postStatusLabel } from '../status';
import type { PostComment } from '../types';
import { ContentResultCard } from '@/features/recipes/components/ContentResultCard';
import { useRecipeDetail } from '@/features/recipes/hooks';

export function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const vi = useTranslation().locale === 'vi';
  const userId = useAuthStore((state) => state.user?.id);
  const actions = useCommunityPost(id);
  const post = actions.post.data;
  const linkedRecipe = useRecipeDetail(post?.recipeId ?? '');
  useEffect(() => {
    if (post?._id && post.status === 'published')
      void engagementApi.recordView('post', post._id).catch(() => undefined);
  }, [post?._id, post?.status]);
  const [commentText, setCommentText] = useState('');
  const [editingComment, setEditingComment] = useState<PostComment | null>(null);
  const [replyingTo, setReplyingTo] = useState<PostComment | null>(null);
  const [deletingPost, setDeletingPost] = useState(false);
  const [deletingComment, setDeletingComment] = useState<string | null>(null);
  const mine = post?.authorId === userId;
  const published = post?.status === 'published';
  const busy =
    actions.remove.isPending ||
    actions.comment.isPending ||
    actions.editComment.isPending ||
    actions.removeComment.isPending ||
    actions.react.isPending;
  const reaction = post?.reacted;
  return (
    <ScreenWrapper
      scrollable
      contentContainerStyle={styles.screenContent}
      header={
        <CustomHeader
          title={post?.title || (vi ? 'Bài viết' : 'Post')}
          showBack
          backFallbackHref="/community"
        />
      }
    >
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
              accessibilityLabel={vi ? 'Xem hồ sơ tác giả' : 'View author profile'}
              onPress={() =>
                router.push({ pathname: '/users/[id]', params: { id: post.authorId } })
              }
              style={({ pressed }) => [styles.authorRow, pressed && styles.actionPressed]}
            >
              <View style={styles.authorAvatar}>
                <AppIcon name="user" size={20} color={colors.primary[700]} decorative />
              </View>
              <View style={styles.authorCopy}>
                <AppText variant="bodyStrong">
                  {vi ? 'Tác giả bài viết' : 'Post author'}
                </AppText>
                <AppText variant="caption" color={colors.text.secondary}>
                  {vi ? 'Chạm để xem hồ sơ' : 'Tap to view profile'}
                </AppText>
              </View>
              <AppText variant="bodyStrong" color={colors.primary[700]}>
                →
              </AppText>
            </Pressable>
            <View style={styles.articleDivider} />
            <AppText selectable style={styles.articleBody}>
              {post.content}
            </AppText>
          </Surface>
          {actions.media.data?.map((asset) =>
            asset.downloadUrl ? (
              <Image
                key={asset._id}
                source={{ uri: asset.downloadUrl }}
                style={{ width: '100%', height: 240, borderRadius: radius.lg }}
                resizeMode="cover"
              />
            ) : null
          )}
          <FeatureState error={actions.media.error} />
          {post.recipeId ? (
            <Surface bordered padding="lg" radius="xl" style={styles.linkedRecipeCard}>
              <AppText variant="heading3">
                {vi ? 'Công thức trong bài viết' : 'Recipe in this post'}
              </AppText>
              <AppText color={colors.text.secondary}>
                {vi
                  ? 'Đây là công thức độc lập được bài viết này nhắc đến.'
                  : 'This is the separate recipe referenced by this post.'}
              </AppText>
              <FeatureState
                loading={linkedRecipe.isLoading}
                error={linkedRecipe.error}
                retry={() => void linkedRecipe.refetch()}
              />
              {linkedRecipe.data ? (
                <ContentResultCard
                  item={{ ...linkedRecipe.data, type: 'recipe' }}
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
          {post.rejectionReason ? <AppText>{post.rejectionReason}</AppText> : null}
          {mine &&
          ['draft', 'rejected', 'published', 'archived'].includes(post.status) ? (
            <>
              <AppButton
                title={vi ? 'Sửa bài' : 'Edit post'}
                disabled={busy}
                onPress={() =>
                  router.push({ pathname: '/community/editor', params: { id } })
                }
              />
            </>
          ) : null}
          {mine ? (
            deletingPost ? (
              <>
                <AppText>{vi ? 'Xóa bài viết này?' : 'Delete this post?'}</AppText>
                <AppButton
                  title={vi ? 'Xác nhận xóa' : 'Confirm deletion'}
                  disabled={busy}
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
              </>
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
              <Surface padding="md" radius="xl" style={styles.engagementCard}>
                <ReactionButtons
                  selected={reaction}
                  disabled={busy}
                  vi={vi}
                  onPress={(type, remove) => actions.react.mutate({ remove, type })}
                />
                <View style={styles.engagementDivider} />
                <View style={styles.secondaryActions}>
                  <AppButton
                    title={vi ? 'Chia sẻ' : 'Share'}
                    variant="ghost"
                    fullWidth={false}
                    style={styles.secondaryActionButton}
                    onPress={() =>
                      void Share.share({ message: `${post.title}\n\n${post.content}` })
                    }
                  />
                  <AppButton
                    title={vi ? 'Báo cáo' : 'Report'}
                    variant="ghost"
                    fullWidth={false}
                    style={styles.secondaryActionButton}
                    onPress={() =>
                      router.push({
                        pathname: '/community/report',
                        params: { targetType: 'post', targetId: id },
                      })
                    }
                  />
                </View>
              </Surface>
              <Surface padding="lg" radius="xl" style={styles.commentsCard}>
              <View style={styles.sectionTitle}>
                <AppIcon name="comment" size={22} color={colors.primary[700]} decorative />
                <AppText variant="heading3">{vi ? 'Bình luận' : 'Comments'}</AppText>
              </View>
              <FeatureState
                loading={actions.comments.isLoading}
                error={actions.comments.error}
                retry={() => void actions.comments.refetch()}
              />
              {actions.comments.data?.data.length === 0 ? (
                <View style={styles.emptyComments}>
                  <View style={styles.emptyCommentIcon}>
                    <AppIcon
                      name="comment"
                      size={22}
                      color={colors.primary[700]}
                      decorative
                    />
                  </View>
                  <View style={styles.emptyCommentCopy}>
                    <AppText variant="bodyStrong">
                      {vi ? 'Chưa có bình luận' : 'No comments yet'}
                    </AppText>
                    <AppText variant="caption" color={colors.text.secondary}>
                      {vi
                        ? 'Hãy bắt đầu cuộc trò chuyện.'
                        : 'Start the conversation.'}
                    </AppText>
                  </View>
                </View>
              ) : null}
              {actions.comments.data?.data.map((comment) => (
                <View
                  key={comment._id}
                  style={{
                    padding: spacing.md,
                    borderRadius: radius.md,
                    backgroundColor: colors.background.surface,
                    gap: spacing.sm,
                  }}
                >
                  <AppText>{comment.content}</AppText>
                  <View style={styles.commentActions}>
                    {!comment.parentCommentId ? (
                      <AppButton
                        title={vi ? 'Trả lời' : 'Reply'}
                        variant="ghost"
                        fullWidth={false}
                        disabled={busy}
                        onPress={() => {
                          setReplyingTo(comment);
                          setEditingComment(null);
                          setCommentText('');
                        }}
                      />
                    ) : null}
                    {comment.authorId === userId ? (
                      <>
                        <AppButton
                          title={vi ? 'Sửa' : 'Edit'}
                          variant="ghost"
                          fullWidth={false}
                          disabled={busy}
                          onPress={() => {
                            setEditingComment(comment);
                            setReplyingTo(null);
                            setCommentText(comment.content);
                          }}
                        />
                        <AppButton
                          title={vi ? 'Xóa' : 'Delete'}
                          variant="ghost"
                          fullWidth={false}
                          disabled={busy}
                          onPress={() => setDeletingComment(comment._id)}
                        />
                      </>
                    ) : (
                      <AppButton
                        title={vi ? 'Báo cáo' : 'Report'}
                        variant="ghost"
                        fullWidth={false}
                        onPress={() =>
                          router.push({
                            pathname: '/community/report',
                            params: { targetType: 'comment', targetId: comment._id },
                          })
                        }
                      />
                    )}
                  </View>
                  {deletingComment === comment._id ? (
                    <>
                      <AppButton
                        title={
                          vi ? 'Xác nhận xóa bình luận' : 'Confirm comment deletion'
                        }
                        disabled={busy}
                        onPress={() =>
                          actions.removeComment.mutate(comment._id, {
                            onSuccess: () => setDeletingComment(null),
                          })
                        }
                      />
                      <AppButton
                        title={vi ? 'Hủy' : 'Cancel'}
                        variant="ghost"
                        onPress={() => setDeletingComment(null)}
                      />
                    </>
                  ) : null}
                </View>
              ))}
              <AppInput
                label={
                  editingComment
                    ? vi
                      ? 'Sửa bình luận'
                      : 'Edit comment'
                    : replyingTo
                      ? `${vi ? 'Trả lời' : 'Reply'}: ${replyingTo.content}`
                      : vi
                        ? 'Viết bình luận'
                        : 'Write a comment'
                }
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={5000}
                editable={!busy}
              />
              <AppButton
                title={vi ? 'Lưu bình luận' : 'Save comment'}
                disabled={busy || !commentText.trim()}
                onPress={() => {
                  const done = () => {
                    setCommentText('');
                    setEditingComment(null);
                    setReplyingTo(null);
                  };
                  if (editingComment)
                    actions.editComment.mutate(
                      { comment: editingComment, content: commentText.trim() },
                      { onSuccess: done }
                    );
                  else
                    actions.comment.mutate(
                      {
                        content: commentText.trim(),
                        parentCommentId: replyingTo?._id,
                      },
                      { onSuccess: done }
                    );
                }}
              />
              {editingComment || replyingTo ? (
                <AppButton
                  title={vi ? 'Hủy sửa' : 'Cancel editing'}
                  variant="ghost"
                  onPress={() => {
                    setEditingComment(null);
                    setReplyingTo(null);
                    setCommentText('');
                  }}
                />
              ) : null}
              </Surface>
            </>
          ) : null}
        </>
      ) : null}
      <FeatureState
        error={
          actions.remove.error ||
          actions.comment.error ||
          actions.editComment.error ||
          actions.removeComment.error ||
          actions.react.error
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    padding: spacing.xl,
    paddingBottom: 132,
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
  engagementCard: {
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  actionPressed: {
    opacity: 0.72,
  },
  engagementDivider: {
    height: 1,
    backgroundColor: colors.border.subtle,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondaryActionButton: {
    flex: 1,
    minWidth: 0,
  },
  commentsCard: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyComments: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.background.muted,
  },
  emptyCommentIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.surface,
  },
  emptyCommentCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  commentActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
