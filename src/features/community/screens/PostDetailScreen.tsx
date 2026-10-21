import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppButton,
  AppInput,
  AppText,
  CustomHeader,
  ScreenWrapper,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useAuthStore } from '@/features/auth';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { useCommunityPost } from '../hooks';
import { postStatusLabel } from '../status';
import type { PostComment } from '../types';

export function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const vi = useTranslation().locale === 'vi';
  const userId = useAuthStore((state) => state.user?.id);
  const actions = useCommunityPost(id);
  const post = actions.post.data;
  const [commentText, setCommentText] = useState('');
  const [editingComment, setEditingComment] = useState<PostComment | null>(null);
  const [deletingPost, setDeletingPost] = useState(false);
  const [deletingComment, setDeletingComment] = useState<string | null>(null);
  const mine = post?.authorId === userId;
  const published = post?.status === 'published';
  const busy =
    actions.submit.isPending ||
    actions.remove.isPending ||
    actions.comment.isPending ||
    actions.editComment.isPending ||
    actions.removeComment.isPending ||
    actions.react.isPending;
  const liked = Boolean(post?.reacted);
  return (
    <ScreenWrapper
      scrollable
      contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
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
          <AppText variant="heading2">{post.title}</AppText>
          <AppText>{postStatusLabel(post.status, vi)}</AppText>
          <AppText selectable>{post.content}</AppText>
          {post.rejectionReason ? <AppText>{post.rejectionReason}</AppText> : null}
          {mine && ['draft', 'rejected'].includes(post.status) ? (
            <>
              <AppButton
                title={vi ? 'Sửa bài' : 'Edit post'}
                disabled={busy}
                onPress={() =>
                  router.push({ pathname: '/community/editor', params: { id } })
                }
              />
              <AppButton
                title={vi ? 'Gửi duyệt' : 'Submit for review'}
                loading={actions.submit.isPending}
                disabled={busy}
                onPress={() => actions.submit.mutate(post)}
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
              <AppButton
                title={liked ? (vi ? 'Bỏ thích' : 'Unlike') : vi ? 'Thích' : 'Like'}
                variant="outline"
                disabled={busy}
                onPress={() => actions.react.mutate(liked)}
              />
              <AppButton
                title={vi ? 'Báo cáo bài viết' : 'Report post'}
                variant="ghost"
                onPress={() =>
                  router.push({
                    pathname: '/community/report',
                    params: { targetType: 'post', targetId: id },
                  })
                }
              />
              <AppText variant="heading3">{vi ? 'Bình luận' : 'Comments'}</AppText>
              <FeatureState
                loading={actions.comments.isLoading}
                error={actions.comments.error}
                retry={() => void actions.comments.refetch()}
              />
              {actions.comments.data?.data.length === 0 ? (
                <AppText>{vi ? 'Chưa có bình luận.' : 'No comments yet.'}</AppText>
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
                  {comment.authorId === userId ? (
                    <>
                      <AppButton
                        title={vi ? 'Sửa bình luận' : 'Edit comment'}
                        variant="ghost"
                        disabled={busy}
                        onPress={() => {
                          setEditingComment(comment);
                          setCommentText(comment.content);
                        }}
                      />
                      <AppButton
                        title={vi ? 'Xóa bình luận' : 'Delete comment'}
                        variant="ghost"
                        disabled={busy}
                        onPress={() => setDeletingComment(comment._id)}
                      />
                    </>
                  ) : (
                    <AppButton
                      title={vi ? 'Báo cáo bình luận' : 'Report comment'}
                      variant="ghost"
                      onPress={() =>
                        router.push({
                          pathname: '/community/report',
                          params: { targetType: 'comment', targetId: comment._id },
                        })
                      }
                    />
                  )}
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
                  };
                  if (editingComment)
                    actions.editComment.mutate(
                      { comment: editingComment, content: commentText.trim() },
                      { onSuccess: done }
                    );
                  else
                    actions.comment.mutate(commentText.trim(), { onSuccess: done });
                }}
              />
              {editingComment ? (
                <AppButton
                  title={vi ? 'Hủy sửa' : 'Cancel editing'}
                  variant="ghost"
                  onPress={() => {
                    setEditingComment(null);
                    setCommentText('');
                  }}
                />
              ) : null}
            </>
          ) : null}
        </>
      ) : null}
      <FeatureState
        error={
          actions.submit.error ||
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
