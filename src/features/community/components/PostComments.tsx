import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';

import { AppIcon, AppText, BottomSheet } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useAuthStore } from '@/features/auth';
import { usePublicProfile } from '@/features/profile/hooks';
import { useTranslation } from '@/i18n';
import { colors, inputTypography, radius, shadows, spacing } from '@/theme';

import { useCommunityPost } from '../hooks';
import type { PostComment } from '../types';

interface PostCommentsProps {
  postId?: string;
  scrollable?: boolean;
  onNavigateAway?: () => void;
  autoFocus?: boolean;
  showSectionHeader?: boolean;
  showComments?: boolean;
  contentHeader?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  focusRequestKey?: number;
}

export function PostComments({
  postId,
  scrollable = false,
  onNavigateAway,
  autoFocus = false,
  showSectionHeader = true,
  showComments = true,
  contentHeader,
  contentContainerStyle,
  focusRequestKey = 0,
}: PostCommentsProps) {
  const router = useRouter();
  const vi = useTranslation().locale === 'vi';
  const userId = useAuthStore((state) => state.user?.id);
  const actions = useCommunityPost(postId);
  const [commentText, setCommentText] = useState('');
  const [editingComment, setEditingComment] = useState<PostComment | null>(null);
  const [replyingTo, setReplyingTo] = useState<PostComment | null>(null);
  const [deletingComment, setDeletingComment] = useState<string | null>(null);
  const [expandedActionsId, setExpandedActionsId] = useState<string | null>(null);
  const composerRef = useRef<TextInput>(null);
  const comments = actions.comments.data?.data ?? [];
  const commentsById = useMemo(
    () => new Map(comments.map((comment) => [comment._id, comment])),
    [comments]
  );
  const busy =
    actions.comment.isPending ||
    actions.editComment.isPending ||
    actions.removeComment.isPending;

  useEffect(() => {
    setCommentText('');
    setEditingComment(null);
    setReplyingTo(null);
    setDeletingComment(null);
    setExpandedActionsId(null);
  }, [postId]);

  useEffect(() => {
    if (!autoFocus) return;
    const timer = setTimeout(() => composerRef.current?.focus(), 220);
    return () => clearTimeout(timer);
  }, [autoFocus, postId]);

  useEffect(() => {
    if (!focusRequestKey) return;
    focusComposer();
  }, [focusRequestKey]);

  const resetComposer = () => {
    setCommentText('');
    setEditingComment(null);
    setReplyingTo(null);
  };

  const focusComposer = () => {
    requestAnimationFrame(() => composerRef.current?.focus());
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
      {showSectionHeader ? (
        <View style={styles.sectionTitle}>
          <AppIcon name="comment" size={22} color={colors.primary[700]} decorative />
          <AppText variant="heading3">{vi ? 'Bình luận' : 'Comments'}</AppText>
          <AppText variant="caption" color={colors.text.secondary}>
            {comments.length}
          </AppText>
        </View>
      ) : null}

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
        <CommentRow
          key={comment._id}
          comment={comment}
          parent={
            comment.parentCommentId
              ? commentsById.get(comment.parentCommentId)
              : undefined
          }
          userId={userId}
          vi={vi}
          busy={busy}
          actionsExpanded={expandedActionsId === comment._id}
          deleting={deletingComment === comment._id}
          onToggleActions={() =>
            setExpandedActionsId((current) =>
              current === comment._id ? null : comment._id
            )
          }
          onReply={() => {
            setReplyingTo(comment);
            setEditingComment(null);
            setCommentText('');
            focusComposer();
          }}
          onEdit={() => {
            setEditingComment(comment);
            setReplyingTo(null);
            setCommentText(comment.content);
            setExpandedActionsId(null);
            focusComposer();
          }}
          onDelete={() => setDeletingComment(comment._id)}
          onCancelDelete={() => setDeletingComment(null)}
          onConfirmDelete={() =>
            actions.removeComment.mutate(comment._id, {
              onSuccess: () => {
                setDeletingComment(null);
                setExpandedActionsId(null);
              },
            })
          }
          onReport={() => {
            onNavigateAway?.();
            router.push({
              pathname: '/community/report',
              params: { targetType: 'comment', targetId: comment._id },
            });
          }}
        />
      ))}
    </View>
  );

  if (!showComments) {
    return scrollable ? (
      <ScrollView
        style={styles.fill}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {contentHeader}
      </ScrollView>
    ) : (
      <>{contentHeader}</>
    );
  }

  return (
    <View style={[styles.root, scrollable && styles.fill]}>
      {scrollable ? (
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {contentHeader}
          {commentList}
        </ScrollView>
      ) : (
        <>
          {contentHeader}
          {commentList}
        </>
      )}

      <View style={styles.composerArea}>
        {editingComment || replyingTo ? (
          <View style={styles.composerContext}>
            <AppText
              variant="caption"
              color={colors.text.secondary}
              numberOfLines={1}
            >
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
          <TextInput
            ref={composerRef}
            value={commentText}
            onChangeText={setCommentText}
            placeholder={vi ? 'Viết bình luận…' : 'Write a comment…'}
            placeholderTextColor={colors.text.secondary}
            multiline
            maxLength={5000}
            editable={!busy}
            autoFocus={autoFocus}
            autoCapitalize="sentences"
            autoCorrect
            textAlignVertical="center"
            accessibilityLabel={vi ? 'Viết bình luận' : 'Write a comment'}
            style={styles.composerInput}
          />
          {commentText.trim() ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={vi ? 'Gửi bình luận' : 'Send comment'}
              accessibilityState={{ disabled: busy }}
              disabled={busy}
              onPress={submitComment}
              style={({ pressed }) => [
                styles.sendButton,
                pressed && styles.sendButtonPressed,
                busy && styles.disabled,
              ]}
            >
              <AppIcon
                name="send"
                size={20}
                color={colors.common.white}
                decorative
              />
            </Pressable>
          ) : null}
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

function CommentRow({
  comment,
  parent,
  userId,
  vi,
  busy,
  actionsExpanded,
  deleting,
  onToggleActions,
  onReply,
  onEdit,
  onDelete,
  onCancelDelete,
  onConfirmDelete,
  onReport,
}: {
  comment: PostComment;
  parent?: PostComment;
  userId?: string;
  vi: boolean;
  busy: boolean;
  actionsExpanded: boolean;
  deleting: boolean;
  onToggleActions: () => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  onReport: () => void;
}) {
  const author = usePublicProfile(comment.authorId);
  const parentAuthor = usePublicProfile(parent?.authorId);
  const mine = comment.authorId === userId;
  const parentMine = parent?.authorId === userId;
  const fallbackName = vi ? 'Thành viên cộng đồng' : 'Community member';
  const authorName = mine
    ? vi
      ? 'Bạn'
      : 'You'
    : author.data?.displayName?.trim() || fallbackName;
  const parentName = parentMine
    ? vi
      ? 'Bạn'
      : 'You'
    : parentAuthor.data?.displayName?.trim() || fallbackName;

  return (
    <View style={[styles.comment, comment.parentCommentId && styles.replyComment]}>
      {author.data?.avatarUrl ? (
        <Image
          source={{ uri: author.data.avatarUrl }}
          style={styles.commentAvatarImage}
          accessibilityLabel={
            vi ? `Ảnh của ${authorName}` : `${authorName}'s avatar`
          }
        />
      ) : (
        <View style={styles.commentAvatar}>
          <AppIcon name="user" size={15} color={colors.primary[700]} decorative />
        </View>
      )}
      <View style={styles.commentBody}>
        <View style={styles.commentHeader}>
          <AppText
            variant="caption"
            color={colors.primary[700]}
            numberOfLines={1}
            style={styles.commentAuthor}
          >
            {authorName}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vi ? 'Thêm thao tác' : 'More actions'}
            accessibilityState={{ expanded: actionsExpanded }}
            onPress={onToggleActions}
            hitSlop={8}
            style={({ pressed }) => [styles.moreAction, pressed && styles.pressed]}
          >
            <AppText variant="bodyStrong" color={colors.text.secondary}>
              •••
            </AppText>
          </Pressable>
        </View>

        {parent ? (
          <View style={styles.replyContext}>
            <AppIcon
              name="reply"
              size={12}
              color={colors.text.secondary}
              decorative
            />
            <AppText
              variant="caption"
              color={colors.text.secondary}
              numberOfLines={1}
            >
              {vi ? `Trả lời ${parentName}` : `Replying to ${parentName}`}
            </AppText>
          </View>
        ) : null}

        <AppText>{comment.content}</AppText>

        {!comment.parentCommentId || actionsExpanded ? (
          <View style={styles.commentFooterActions}>
            {!comment.parentCommentId ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={vi ? 'Trả lời bình luận' : 'Reply to comment'}
                disabled={busy}
                onPress={onReply}
                hitSlop={6}
                style={({ pressed }) => [
                  styles.replyAction,
                  pressed && styles.pressed,
                  busy && styles.disabled,
                ]}
              >
                <AppIcon
                  name="reply"
                  size={13}
                  color={colors.text.secondary}
                  decorative
                />
                <AppText variant="caption" color={colors.text.secondary}>
                  {vi ? 'Trả lời' : 'Reply'}
                </AppText>
              </Pressable>
            ) : null}

            {actionsExpanded ? (
              <>
                {mine ? (
                  <>
                    <CommentAction
                      icon="edit"
                      label={vi ? 'Sửa' : 'Edit'}
                      disabled={busy}
                      onPress={onEdit}
                    />
                    <CommentAction
                      icon="trash"
                      label={vi ? 'Xóa' : 'Delete'}
                      disabled={busy}
                      destructive
                      onPress={onDelete}
                    />
                  </>
                ) : (
                  <CommentAction
                    icon="flag"
                    label={vi ? 'Báo cáo' : 'Report'}
                    onPress={onReport}
                  />
                )}
              </>
            ) : null}
          </View>
        ) : null}

        {deleting ? (
          <View style={styles.deleteConfirmation}>
            <AppText variant="caption" color={colors.status.danger}>
              {vi ? 'Xóa bình luận này?' : 'Delete this comment?'}
            </AppText>
            <CommentAction
              icon="trash"
              label={vi ? 'Xác nhận' : 'Confirm'}
              disabled={busy}
              destructive
              onPress={onConfirmDelete}
            />
            <CommentAction
              icon="close"
              label={vi ? 'Hủy' : 'Cancel'}
              onPress={onCancelDelete}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function CommentAction({
  icon,
  label,
  onPress,
  disabled = false,
  destructive = false,
}: {
  icon: 'reply' | 'edit' | 'trash' | 'flag' | 'close';
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
      style={({ pressed }) => [
        styles.commentAction,
        destructive && styles.commentActionDestructive,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <AppIcon
        name={icon}
        size={14}
        color={destructive ? colors.status.danger : colors.text.secondary}
        decorative
      />
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
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      tall
      compact
      showFooterClose={false}
    >
      {visible && postId ? (
        <PostComments
          postId={postId}
          scrollable
          autoFocus
          showSectionHeader={false}
          contentContainerStyle={styles.sheetScrollContent}
          onNavigateAway={onClose}
        />
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  root: { gap: 0 },
  fill: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: spacing.sm },
  sheetScrollContent: { paddingHorizontal: spacing.md },
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
    gap: spacing.xs,
  },
  replyComment: {
    marginLeft: spacing.xl,
    paddingLeft: spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary[300],
  },
  commentAvatar: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.selected,
  },
  commentAvatarImage: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.background.selected,
  },
  commentBody: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.background.muted,
  },
  commentHeader: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  commentAuthor: { flex: 1, minWidth: 0 },
  moreAction: {
    minWidth: 30,
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyContext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  replyAction: {
    minHeight: 26,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  commentAction: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.background.surface,
  },
  commentActionDestructive: { backgroundColor: colors.background.surface },
  commentFooterActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deleteConfirmation: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.md,
  },
  composerArea: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
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
  composerInput: {
    ...inputTypography,
    flex: 1,
    minWidth: 0,
    minHeight: 42,
    maxHeight: 96,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
    borderRadius: radius.xl,
    backgroundColor: colors.background.muted,
    color: colors.text.primary,
    fontSize: 16,
    lineHeight: 21,
  },
  sendButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary[700],
  },
  sendButtonPressed: { opacity: 0.78, transform: [{ scale: 0.96 }] },
  pressed: { opacity: 0.65 },
  disabled: { opacity: 0.45 },
});
