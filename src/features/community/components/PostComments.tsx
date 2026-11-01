import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  AppButton,
  AppIcon,
  AppInput,
  AppText,
  BottomSheet,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useAuthStore } from '@/features/auth';
import { useTranslation } from '@/i18n';
import { colors, radius, shadows, spacing } from '@/theme';

import { useCommunityPost } from '../hooks';
import type { PostComment } from '../types';

interface PostCommentsProps {
  postId?: string;
  scrollable?: boolean;
  onNavigateAway?: () => void;
}

export function PostComments({
  postId,
  scrollable = false,
  onNavigateAway,
}: PostCommentsProps) {
  const router = useRouter();
  const vi = useTranslation().locale === 'vi';
  const userId = useAuthStore((state) => state.user?.id);
  const actions = useCommunityPost(postId);
  const [commentText, setCommentText] = useState('');
  const [editingComment, setEditingComment] = useState<PostComment | null>(null);
  const [replyingTo, setReplyingTo] = useState<PostComment | null>(null);
  const [deletingComment, setDeletingComment] = useState<string | null>(null);
  const comments = actions.comments.data?.data ?? [];
  const busy =
    actions.comment.isPending ||
    actions.editComment.isPending ||
    actions.removeComment.isPending;

  useEffect(() => {
    setCommentText('');
    setEditingComment(null);
    setReplyingTo(null);
    setDeletingComment(null);
  }, [postId]);

  const resetComposer = () => {
    setCommentText('');
    setEditingComment(null);
    setReplyingTo(null);
  };

  const submitComment = () => {
    const content = commentText.trim();
    if (!content) return;
    if (editingComment) {
      actions.editComment.mutate(
        { comment: editingComment, content },
        { onSuccess: resetComposer }
      );
      return;
    }
    actions.comment.mutate(
      { content, parentCommentId: replyingTo?._id },
      { onSuccess: resetComposer }
    );
  };

  const commentList = (
    <View style={styles.commentSection}>
      <View style={styles.sectionTitle}>
        <AppIcon name="comment" size={22} color={colors.primary[700]} decorative />
        <AppText variant="heading3">{vi ? 'Bình luận' : 'Comments'}</AppText>
        <AppText variant="caption" color={colors.text.secondary}>
          {comments.length}
        </AppText>
      </View>

      <FeatureState
        loading={actions.comments.isLoading || actions.post.isLoading}
        error={actions.comments.error || actions.post.error}
        retry={() => void actions.comments.refetch()}
      />

      {!actions.comments.isLoading && comments.length === 0 ? (
        <View style={styles.emptyComments}>
          <AppIcon name="comment" size={22} color={colors.primary[700]} decorative />
          <View style={styles.emptyCommentCopy}>
            <AppText variant="bodyStrong">
              {vi ? 'Chưa có bình luận' : 'No comments yet'}
            </AppText>
            <AppText variant="caption" color={colors.text.secondary}>
              {vi ? 'Hãy bắt đầu cuộc trò chuyện.' : 'Start the conversation.'}
            </AppText>
          </View>
        </View>
      ) : null}

      {comments.map((comment) => (
        <View
          key={comment._id}
          style={[
            styles.comment,
            comment.parentCommentId ? styles.replyComment : undefined,
          ]}
        >
          <View style={styles.commentAvatar}>
            <AppIcon name="user" size={16} color={colors.primary[700]} decorative />
          </View>
          <View style={styles.commentBody}>
            <AppText>{comment.content}</AppText>
            <View style={styles.commentActions}>
              {!comment.parentCommentId ? (
                <CommentAction
                  label={vi ? 'Trả lời' : 'Reply'}
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
                  <CommentAction
                    label={vi ? 'Sửa' : 'Edit'}
                    disabled={busy}
                    onPress={() => {
                      setEditingComment(comment);
                      setReplyingTo(null);
                      setCommentText(comment.content);
                    }}
                  />
                  <CommentAction
                    label={vi ? 'Xóa' : 'Delete'}
                    disabled={busy}
                    destructive
                    onPress={() => setDeletingComment(comment._id)}
                  />
                </>
              ) : (
                <CommentAction
                  label={vi ? 'Báo cáo' : 'Report'}
                  onPress={() => {
                    onNavigateAway?.();
                    router.push({
                      pathname: '/community/report',
                      params: { targetType: 'comment', targetId: comment._id },
                    });
                  }}
                />
              )}
            </View>
            {deletingComment === comment._id ? (
              <View style={styles.deleteConfirmation}>
                <AppText variant="caption" color={colors.status.danger}>
                  {vi ? 'Xóa bình luận này?' : 'Delete this comment?'}
                </AppText>
                <CommentAction
                  label={vi ? 'Xác nhận' : 'Confirm'}
                  disabled={busy}
                  destructive
                  onPress={() =>
                    actions.removeComment.mutate(comment._id, {
                      onSuccess: () => setDeletingComment(null),
                    })
                  }
                />
                <CommentAction
                  label={vi ? 'Hủy' : 'Cancel'}
                  onPress={() => setDeletingComment(null)}
                />
              </View>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.root, scrollable && styles.fill]}>
      {scrollable ? (
        <ScrollView
          style={styles.fill}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {commentList}
        </ScrollView>
      ) : (
        commentList
      )}

      <View style={styles.composerArea}>
        {editingComment || replyingTo ? (
          <View style={styles.composerContext}>
            <AppText variant="caption" color={colors.text.secondary} numberOfLines={1}>
              {editingComment
                ? vi
                  ? 'Đang sửa bình luận'
                  : 'Editing comment'
                : `${vi ? 'Đang trả lời' : 'Replying to'}: ${replyingTo?.content}`}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={vi ? 'Hủy' : 'Cancel'}
              onPress={resetComposer}
              hitSlop={8}
            >
              <AppText variant="caption" color={colors.primary[700]}>
                {vi ? 'Hủy' : 'Cancel'}
              </AppText>
            </Pressable>
          </View>
        ) : null}
        <View style={styles.composerRow}>
          <AppInput
            value={commentText}
            onChangeText={setCommentText}
            placeholder={vi ? 'Viết bình luận…' : 'Write a comment…'}
            multiline
            maxLength={5000}
            editable={!busy}
            style={styles.composerInput}
            inputStyle={styles.composerText}
          />
          <AppButton
            title={vi ? 'Gửi' : 'Send'}
            fullWidth={false}
            disabled={busy || !commentText.trim()}
            onPress={submitComment}
          />
        </View>
        <FeatureState
          error={
            actions.comment.error ||
            actions.editComment.error ||
            actions.removeComment.error
          }
        />
      </View>
    </View>
  );
}

function CommentAction({
  label,
  onPress,
  disabled = false,
  destructive = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [pressed && styles.pressed, disabled && styles.disabled]}
    >
      <AppText
        variant="caption"
        color={destructive ? colors.status.danger : colors.text.secondary}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

export function PostCommentsSheet({
  visible,
  postId,
  onClose,
}: {
  visible: boolean;
  postId?: string;
  onClose: () => void;
}) {
  const vi = useTranslation().locale === 'vi';
  return (
    <BottomSheet
      visible={visible}
      title={vi ? 'Bình luận' : 'Comments'}
      onClose={onClose}
      tall
      showFooterClose={false}
      headerAction={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={vi ? 'Đóng' : 'Close'}
          onPress={onClose}
          hitSlop={8}
        >
          <AppText variant="bodyStrong" color={colors.primary[700]}>
            {vi ? 'Đóng' : 'Close'}
          </AppText>
        </Pressable>
      }
    >
      <PostComments postId={postId} scrollable onNavigateAway={onClose} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.md },
  fill: { flex: 1 },
  scrollContent: { paddingBottom: spacing.md },
  commentSection: { gap: spacing.md },
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
  emptyCommentCopy: { flex: 1, minWidth: 0, gap: spacing.xs },
  comment: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  replyComment: { marginLeft: spacing.xl },
  commentAvatar: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.selected,
  },
  commentBody: {
    flex: 1,
    minWidth: 0,
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.background.muted,
  },
  commentActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.md,
  },
  deleteConfirmation: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.md,
  },
  composerArea: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border.default,
    backgroundColor: colors.background.surface,
    ...shadows.sm,
  },
  composerContext: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  composerRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  composerInput: { flex: 1, minWidth: 0 },
  composerText: { maxHeight: 96 },
  pressed: { opacity: 0.65 },
  disabled: { opacity: 0.45 },
});
