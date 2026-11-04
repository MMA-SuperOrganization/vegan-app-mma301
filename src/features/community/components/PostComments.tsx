import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Animated,
  Image,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';

import { AppIcon, AppText, BottomSheet, useBottomSheet } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useAuthStore } from '@/features/auth';
import { usePublicProfile } from '@/features/profile/hooks';
import { useTranslation } from '@/i18n';
import { colors, inputTypography, radius, shadows, spacing } from '@/theme';

import { useCommunityPost } from '../hooks';
import { formatCommentRelativeTime } from '../commentPresentation';
import type { PostComment } from '../types';

const REPLIES_PAGE_SIZE = 10;

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
  const [newlyCreatedCommentId, setNewlyCreatedCommentId] = useState<string | null>(
    null
  );
  const [menuComment, setMenuComment] = useState<PostComment | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [shownReplies, setShownReplies] = useState<Record<string, number>>({});
  const composerRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  const { panHandlers: sheetPanHandlers } = useBottomSheet();
  const commentLayouts = useRef<Record<string, { y: number; height: number }>>({});
  const commentSectionOffsetY = useRef(0);
  const scrollViewHeight = useRef<number>(300);
  const scrollFrameRef = useRef<number | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToComment = useCallback((commentId: string, delay = 80) => {
    if (scrollFrameRef.current !== null) {
      cancelAnimationFrame(scrollFrameRef.current);
    }
    if (scrollTimerRef.current !== null) {
      clearTimeout(scrollTimerRef.current);
    }

    scrollFrameRef.current = requestAnimationFrame(() => {
      scrollFrameRef.current = null;
      scrollTimerRef.current = setTimeout(() => {
        scrollTimerRef.current = null;
        const layout = commentLayouts.current[commentId];
        if (layout && scrollRef.current) {
          const vh = scrollViewHeight.current || 300;
          // Never scroll past the top of the comment:
          const maxTargetY = Math.max(0, layout.y - 12);
          // Keep the comment bottom 35dp above the composer area.
          const bottomTargetY = Math.max(0, layout.y + layout.height + 35 - vh);
          const targetY = Math.min(maxTargetY, bottomTargetY);
          scrollRef.current.scrollTo({
            y: targetY,
            animated: true,
          });
        }
      }, delay);
    });
  }, []);

  useEffect(
    () => () => {
      if (scrollFrameRef.current !== null) {
        cancelAnimationFrame(scrollFrameRef.current);
      }
      if (scrollTimerRef.current !== null) {
        clearTimeout(scrollTimerRef.current);
      }
    },
    []
  );

  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      const targetId = replyingTo?._id || newlyCreatedCommentId;
      if (targetId) {
        scrollToComment(targetId, 60);
      }
    });
    return () => sub.remove();
  }, [newlyCreatedCommentId, replyingTo?._id, scrollToComment]);

  const comments = actions.comments.data?.data ?? [];
  const commentsLoaded = Boolean(actions.comments.data) && !actions.comments.isLoading;
  const commentsById = useMemo(
    () => new Map(comments.map((comment) => [comment._id, comment])),
    [comments]
  );
  const { rootComments, repliesByParent } = useMemo(() => {
    const roots: PostComment[] = [];
    const grouped = new Map<string, PostComment[]>();
    for (const comment of comments) {
      const parentId = comment.parentCommentId;
      if (parentId && commentsById.has(parentId)) {
        const list = grouped.get(parentId) ?? [];
        list.push(comment);
        grouped.set(parentId, list);
      } else {
        roots.push(comment);
      }
    }
    return { rootComments: roots, repliesByParent: grouped };
  }, [comments, commentsById]);

  useEffect(() => {
    if (!newlyCreatedCommentId) return;
    const timer = setTimeout(() => {
      scrollToComment(newlyCreatedCommentId, 0);
    }, 220);

    const fadeTimer = setTimeout(() => {
      setNewlyCreatedCommentId(null);
    }, 3600);

    return () => {
      clearTimeout(timer);
      clearTimeout(fadeTimer);
    };
  }, [newlyCreatedCommentId, comments, scrollToComment]);
  const busy =
    actions.comment.isPending ||
    actions.editComment.isPending ||
    actions.removeComment.isPending;

  useEffect(() => {
    setCommentText('');
    setEditingComment(null);
    setReplyingTo(null);
    setMenuComment(null);
    setConfirmingDelete(false);
    setShownReplies({});
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
    setTimeout(() => composerRef.current?.focus(), 80);
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
    const targetParentId = replyingTo?.parentCommentId || replyingTo?._id;
    actions.comment.mutate(
      { content, parentCommentId: targetParentId },
      {
        onSuccess: (newComment) => {
          setCommentText('');
          setEditingComment(null);
          setReplyingTo(null);
          if (newComment?._id) {
            setNewlyCreatedCommentId(newComment._id);
          }
          if (targetParentId) {
            // Make sure the thread holding the new reply is fully visible.
            setShownReplies((current) => ({ ...current, [targetParentId]: 9999 }));
          }
        },
      }
    );
  };

  const renderComment = (comment: PostComment) => (
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
      isReplyTarget={replyingTo?._id === comment._id}
      isNewlyCreated={newlyCreatedCommentId === comment._id}
      onLayout={(y, height) => {
        commentLayouts.current[comment._id] = {
          y: commentSectionOffsetY.current + y,
          height,
        };
      }}
      onOpenMenu={() => {
        setConfirmingDelete(false);
        setMenuComment(comment);
      }}
      onReply={comment.parentCommentId ? undefined : () => startReply(comment)}
    />
  );

  const commentList = (
    <View
      style={styles.commentSection}
      onLayout={(event) => {
        commentSectionOffsetY.current = event.nativeEvent.layout.y;
      }}
    >
      {showSectionHeader ? (
        <View style={styles.sectionTitle}>
          <AppIcon name="comment" size={22} color={colors.primary[700]} decorative />
          <AppText variant="heading3">{vi ? 'Bình luận' : 'Comments'}</AppText>
          {commentsLoaded ? (
            <AppText variant="caption" color={colors.text.secondary}>
              {comments.length}
            </AppText>
          ) : null}
        </View>
      ) : null}

      <FeatureState
        loading={actions.comments.isLoading || actions.post.isLoading}
        error={actions.comments.error || actions.post.error}
        retry={() => void actions.comments.refetch()}
      />

      {commentsLoaded && comments.length === 0 ? (
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

      {rootComments.flatMap((root) => {
        const replies = repliesByParent.get(root._id) ?? [];
        const shown = Math.min(shownReplies[root._id] ?? 0, replies.length);
        const remaining = replies.length - shown;
        const items = [renderComment(root), ...replies.slice(0, shown).map(renderComment)];
        if (replies.length > 0) {
          items.push(
            <View key={`${root._id}-replies-toggle`} style={styles.repliesToggleRow}>
              {remaining > 0 ? (
                <ReplyToggle
                  label={
                    shown === 0
                      ? vi
                        ? `Xem ${remaining} câu trả lời`
                        : `View ${remaining} ${remaining === 1 ? 'reply' : 'replies'}`
                      : vi
                        ? `Xem thêm ${remaining} câu trả lời`
                        : `View ${remaining} more ${remaining === 1 ? 'reply' : 'replies'}`
                  }
                  onPress={() =>
                    setShownReplies((current) => ({
                      ...current,
                      [root._id]: shown + REPLIES_PAGE_SIZE,
                    }))
                  }
                />
              ) : null}
              {shown > 0 ? (
                <ReplyToggle
                  label={vi ? 'Ẩn câu trả lời' : 'Hide replies'}
                  onPress={() =>
                    setShownReplies((current) => ({ ...current, [root._id]: 0 }))
                  }
                />
              ) : null}
            </View>
          );
        }
        return items;
      })}
    </View>
  );

  const startReply = (comment: PostComment) => {
    setMenuComment(null);
    setReplyingTo(comment);
    setNewlyCreatedCommentId(null);
    setEditingComment(null);
    setCommentText('');
    focusComposer();
    // If the keyboard is already open, scroll once after the composer
    // settles. Otherwise keyboardDidShow replaces this fallback call.
    scrollToComment(comment._id, Keyboard.isVisible() ? 120 : 360);
  };

  const closeMenu = () => {
    setMenuComment(null);
    setConfirmingDelete(false);
  };

  const menuMine = menuComment?.authorId === userId;
  const menuModal = (
    <Modal
      visible={Boolean(menuComment)}
      transparent
      animationType="fade"
      onRequestClose={closeMenu}
      statusBarTranslucent
    >
      <Pressable
        accessibilityLabel={vi ? 'Đóng menu' : 'Close menu'}
        style={styles.menuBackdrop}
        onPress={closeMenu}
      >
        {menuComment ? (
          <Pressable style={styles.menuContent} onPress={() => undefined}>
            <CommentPreviewCard
              comment={menuComment}
              parent={
                menuComment.parentCommentId
                  ? commentsById.get(menuComment.parentCommentId)
                  : undefined
              }
              userId={userId}
              vi={vi}
            />
            <View style={styles.menuList}>
              {confirmingDelete ? (
                <>
                  <View style={styles.menuConfirmCopy}>
                    <AppText variant="bodyStrong" color={colors.status.danger}>
                      {vi ? 'Xóa bình luận này?' : 'Delete this comment?'}
                    </AppText>
                    <AppText variant="caption" color={colors.text.secondary}>
                      {vi
                        ? 'Hành động này không thể hoàn tác.'
                        : 'This action cannot be undone.'}
                    </AppText>
                  </View>
                  <MenuItem
                    icon="trash"
                    label={vi ? 'Xóa' : 'Delete'}
                    destructive
                    disabled={busy}
                    onPress={() =>
                      actions.removeComment.mutate(menuComment._id, {
                        onSuccess: closeMenu,
                      })
                    }
                  />
                  <MenuItem
                    icon="close"
                    label={vi ? 'Hủy' : 'Cancel'}
                    onPress={() => setConfirmingDelete(false)}
                  />
                </>
              ) : (
                <>
                  {!menuComment.parentCommentId ? (
                    <MenuItem
                      icon="reply"
                      label={vi ? 'Trả lời' : 'Reply'}
                      disabled={busy}
                      onPress={() => startReply(menuComment)}
                    />
                  ) : null}
                  {menuMine ? (
                    <>
                      <MenuItem
                        icon="edit"
                        label={vi ? 'Sửa' : 'Edit'}
                        disabled={busy}
                        onPress={() => {
                          const target = menuComment;
                          closeMenu();
                          setEditingComment(target);
                          setReplyingTo(null);
                          setCommentText(target.content);
                          focusComposer();
                        }}
                      />
                      <MenuItem
                        icon="trash"
                        label={vi ? 'Xóa' : 'Delete'}
                        destructive
                        disabled={busy}
                        onPress={() => setConfirmingDelete(true)}
                      />
                    </>
                  ) : (
                    <MenuItem
                      icon="flag"
                      label={vi ? 'Báo cáo' : 'Report'}
                      onPress={() => {
                        const target = menuComment;
                        closeMenu();
                        onNavigateAway?.();
                        router.push({
                          pathname: '/community/report',
                          params: {
                            targetType: 'comment',
                            targetId: target._id,
                            targetPreview: target.content.slice(0, 120),
                          },
                        });
                      }}
                    />
                  )}
                </>
              )}
            </View>
          </Pressable>
        ) : null}
      </Pressable>
    </Modal>
  );

  if (!showComments) {
    return scrollable ? (
      <ScrollView
        style={styles.fill}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        keyboardShouldPersistTaps="always"
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
      {menuModal}
      {scrollable ? (
        <ScrollView
          ref={scrollRef}
          style={styles.fill}
          contentContainerStyle={[
            styles.scrollContent,
            contentContainerStyle,
            onNavigateAway && styles.sheetScrollFlex,
          ]}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          onLayout={(e) => {
            scrollViewHeight.current = e.nativeEvent.layout.height;
          }}
        >
          {contentHeader}
          {commentList}
          {onNavigateAway ? (
            <View
              style={styles.emptyScrollSpace}
              accessibilityLabel={vi ? 'Đóng bình luận' : 'Close comments'}
              {...(sheetPanHandlers ?? {})}
            />
          ) : null}
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
  isReplyTarget = false,
  isNewlyCreated = false,
  onLayout,
  onOpenMenu,
  onReply,
}: {
  comment: PostComment;
  parent?: PostComment;
  userId?: string;
  vi: boolean;
  busy: boolean;
  isReplyTarget?: boolean;
  isNewlyCreated?: boolean;
  onLayout?: (y: number, height: number) => void;
  onOpenMenu: () => void;
  onReply?: () => void;
}) {
  const newHighlightProgress = useRef(new Animated.Value(0)).current;
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

  const timeAgo = formatCommentRelativeTime(
    comment.createdAt ?? comment.updatedAt,
    vi ? 'vi' : 'en'
  );

  useEffect(() => {
    if (!isNewlyCreated) {
      newHighlightProgress.setValue(0);
      return;
    }

    newHighlightProgress.setValue(1);
    const animation = Animated.sequence([
      Animated.delay(3000),
      Animated.timing(newHighlightProgress, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [isNewlyCreated, newHighlightProgress]);

  return (
    <Pressable
      accessibilityHint={
        vi ? 'Nhấn giữ để mở menu bình luận' : 'Press and hold for comment options'
      }
      onLongPress={onOpenMenu}
      delayLongPress={450}
      onLayout={(e) =>
        onLayout?.(e.nativeEvent.layout.y, e.nativeEvent.layout.height)
      }
      style={[styles.comment, comment.parentCommentId && styles.replyComment]}
    >
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
      <Animated.View
        style={[
          styles.commentBody,
          isReplyTarget && styles.commentBodyReplyHighlight,
          isNewlyCreated && styles.commentBodyNewHighlightFrame,
          isNewlyCreated && {
            backgroundColor: newHighlightProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [colors.background.muted, 'rgba(46, 125, 50, 0.08)'],
            }),
            borderColor: newHighlightProgress.interpolate({
              inputRange: [0, 1],
              outputRange: ['rgba(46, 125, 50, 0)', 'rgba(46, 125, 50, 0.28)'],
            }),
          },
        ]}
      >
        <View style={styles.commentHeader}>
          <View style={styles.authorRow}>
            {/* FR-PROFILE-05: tạm tắt. Bật lại bằng cách bọc tên tác giả trong
            <Pressable accessibilityRole="link" onPress={() => {
              onNavigateAway?.();
              openAuthorProfile(router, comment.authorId);
            }}> (truyền onNavigateAway và router từ PostComments xuống CommentRow). */}
            <AppText
              variant="caption"
              color={colors.primary[700]}
              numberOfLines={1}
              style={styles.commentAuthor}
            >
              {authorName}
            </AppText>
            {timeAgo ? (
              <AppText
                variant="caption"
                color={colors.text.secondary}
                style={styles.commentTime}
              >
                {` · ${timeAgo}`}
              </AppText>
            ) : null}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vi ? 'Thêm thao tác' : 'More actions'}
            onPress={onOpenMenu}
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

        <View style={styles.commentFooterActions}>
          {onReply ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vi ? 'Trả lời bình luận' : 'Reply to comment'}
            disabled={busy}
            onPress={onReply}
            hitSlop={12}
            style={({ pressed }) => [
              styles.replyAction,
              pressed && styles.pressed,
              busy && styles.disabled,
            ]}
          >
            <AppText variant="caption" color={colors.text.secondary}>
              {vi ? 'Trả lời' : 'Reply'}
            </AppText>
          </Pressable>
          ) : null}

        </View>
      </Animated.View>
    </Pressable>
  );
}

function CommentPreviewCard({
  comment,
  parent,
  userId,
  vi,
}: {
  comment: PostComment;
  parent?: PostComment;
  userId?: string;
  vi: boolean;
}) {
  const author = usePublicProfile(comment.authorId);
  const parentAuthor = usePublicProfile(parent?.authorId);
  const fallbackName = vi ? 'Thành viên cộng đồng' : 'Community member';
  const you = vi ? 'Bạn' : 'You';
  const authorName =
    comment.authorId === userId
      ? you
      : author.data?.displayName?.trim() || fallbackName;
  const parentName =
    parent?.authorId === userId
      ? you
      : parentAuthor.data?.displayName?.trim() || fallbackName;
  const timeAgo = formatCommentRelativeTime(
    comment.createdAt ?? comment.updatedAt,
    vi ? 'vi' : 'en'
  );
  return (
    <View style={styles.menuPreview}>
      {author.data?.avatarUrl ? (
        <Image
          source={{ uri: author.data.avatarUrl }}
          style={styles.commentAvatarImage}
        />
      ) : (
        <View style={styles.commentAvatar}>
          <AppIcon name="user" size={15} color={colors.primary[700]} decorative />
        </View>
      )}
      <View style={styles.menuPreviewBody}>
        <View style={styles.menuPreviewAuthor}>
          <AppText
            variant="caption"
            color={colors.primary[700]}
            numberOfLines={1}
            style={styles.commentAuthor}
          >
            {authorName}
          </AppText>
          {timeAgo ? (
            <AppText
              variant="caption"
              color={colors.text.secondary}
              style={styles.commentTime}
            >
              {` · ${timeAgo}`}
            </AppText>
          ) : null}
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
      </View>
    </View>
  );
}

function ReplyToggle({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.replyToggle, pressed && styles.pressed]}
    >
      <View style={styles.replyToggleLine} />
      <AppText variant="caption" color={colors.text.secondary}>
        {label}
      </AppText>
    </Pressable>
  );
}

function MenuItem({
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
  const tint = destructive ? colors.status.danger : colors.text.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
        disabled && styles.disabled,
      ]}
    >
      <AppIcon name={icon} size={20} color={tint} decorative />
      <AppText color={tint}>{label}</AppText>
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
  repliesToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginLeft: 28 + spacing.xs,
    paddingLeft: spacing.md,
  },
  replyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 28,
  },
  replyToggleLine: {
    width: 20,
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: colors.border.default,
  },
  menuBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  menuContent: { gap: spacing.md },
  menuPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.background.surface,
    ...shadows.md,
  },
  menuPreviewBody: { flex: 1, minWidth: 0, gap: spacing.xs },
  menuPreviewAuthor: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  menuList: {
    alignSelf: 'flex-end',
    minWidth: 220,
    maxWidth: '100%',
    overflow: 'hidden',
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
    ...shadows.md,
  },
  menuConfirmCopy: {
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  menuItemPressed: { backgroundColor: colors.background.muted },
  root: { gap: 0 },
  fill: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: spacing.sm },
  sheetScrollContent: { paddingHorizontal: spacing.md },
  sheetScrollFlex: { flexGrow: 1 },
  emptyScrollSpace: { flex: 1, minHeight: 140 },
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
    position: 'relative',
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
  authorRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  commentTime: {
    flexShrink: 0,
    fontSize: 12,
  },
  commentBodyReplyHighlight: {
    backgroundColor: 'rgba(46, 125, 50, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(46, 125, 50, 0.45)',
  },
  commentBodyNewHighlightFrame: {
    borderWidth: 1.5,
  },
  commentAuthor: { flexShrink: 1, minWidth: 0 },
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
