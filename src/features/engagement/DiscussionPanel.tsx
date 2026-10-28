import { useState } from 'react';
import { View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppButton, AppInput, AppText, Surface } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useAuthStore } from '@/features/auth';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';
import {
  engagementApi,
  type DiscussionComment,
  type DiscussionTarget,
  type ReactionType,
} from './engagementApi';

export function DiscussionPanel({
  targetType,
  targetId,
  initialReaction,
}: {
  targetType: DiscussionTarget;
  targetId: string;
  initialReaction?: string | null;
}) {
  const vi = useTranslation().locale === 'vi';
  const userId = useAuthStore((state) => state.user?.id);
  const client = useQueryClient();
  const key = ['discussion', targetType, targetId];
  const comments = useQuery({
    queryKey: key,
    queryFn: () => engagementApi.comments(targetType, targetId),
  });
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<DiscussionComment | null>(null);
  const [editing, setEditing] = useState<DiscussionComment | null>(null);
  const [reaction, setReaction] = useState<ReactionType | null>(
    (initialReaction as ReactionType | null) || null
  );
  const refresh = () => client.invalidateQueries({ queryKey: key });
  const saveComment = useMutation({
    mutationFn: () =>
      editing
        ? engagementApi.updateComment(editing, content.trim())
        : engagementApi.comment(targetType, targetId, content.trim(), replyTo?._id),
    onSuccess: async () => {
      setContent('');
      setReplyTo(null);
      setEditing(null);
      await refresh();
    },
  });
  const removeComment = useMutation({
    mutationFn: engagementApi.removeComment,
    onSuccess: refresh,
  });
  const saveReaction = useMutation({
    mutationFn: (type: ReactionType) =>
      reaction === type
        ? engagementApi.removeReaction(targetType, targetId)
        : engagementApi.react(targetType, targetId, type),
    onSuccess: (_, type) =>
      setReaction((current) => (current === type ? null : type)),
  });
  const busy = saveComment.isPending || removeComment.isPending;
  return (
    <Surface bordered padding="lg" radius="lg" style={{ gap: spacing.md }}>
      <AppText variant="heading4">{vi ? 'Tương tác' : 'Discussion'}</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {(['like', 'love', 'helpful'] as const).map((type) => (
          <AppButton
            key={type}
            title={
              type === 'like'
                ? vi
                  ? 'Thích'
                  : 'Like'
                : type === 'love'
                  ? vi
                    ? 'Yêu thích'
                    : 'Love'
                  : vi
                    ? 'Hữu ích'
                    : 'Helpful'
            }
            fullWidth={false}
            variant={reaction === type ? 'primary' : 'outline'}
            disabled={saveReaction.isPending}
            onPress={() => saveReaction.mutate(type)}
          />
        ))}
      </View>
      <AppText variant="heading4">{vi ? 'Bình luận' : 'Comments'}</AppText>
      <FeatureState
        loading={comments.isLoading}
        error={
          comments.error ||
          saveComment.error ||
          removeComment.error ||
          saveReaction.error
        }
        retry={() => void comments.refetch()}
      />
      {(comments.data?.data || []).map((comment) => (
        <View
          key={comment._id}
          style={{
            gap: spacing.xs,
            marginLeft: comment.parentCommentId ? spacing.xl : 0,
            padding: spacing.sm,
            backgroundColor: colors.background.base,
          }}
        >
          <AppText>{comment.content}</AppText>
          {!comment.parentCommentId ? (
            <AppButton
              title={vi ? 'Trả lời' : 'Reply'}
              variant="ghost"
              fullWidth={false}
              disabled={busy}
              onPress={() => {
                setReplyTo(comment);
                setEditing(null);
                setContent('');
              }}
            />
          ) : null}
          {comment.authorId === userId ? (
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <AppButton
                title={vi ? 'Sửa' : 'Edit'}
                variant="ghost"
                fullWidth={false}
                disabled={busy}
                onPress={() => {
                  setEditing(comment);
                  setReplyTo(null);
                  setContent(comment.content);
                }}
              />
              <AppButton
                title={vi ? 'Xóa' : 'Delete'}
                variant="ghost"
                fullWidth={false}
                disabled={busy}
                onPress={() => removeComment.mutate(comment._id)}
              />
            </View>
          ) : null}
        </View>
      ))}
      <AppInput
        label={
          editing
            ? vi
              ? 'Sửa bình luận'
              : 'Edit comment'
            : replyTo
              ? `${vi ? 'Trả lời' : 'Reply'}: ${replyTo.content}`
              : vi
                ? 'Viết bình luận'
                : 'Write a comment'
        }
        value={content}
        onChangeText={setContent}
        multiline
        maxLength={5000}
      />
      <AppButton
        title={vi ? 'Gửi bình luận' : 'Post comment'}
        loading={saveComment.isPending}
        disabled={busy || !content.trim()}
        onPress={() => saveComment.mutate()}
      />
      {replyTo || editing ? (
        <AppButton
          title={vi ? 'Hủy' : 'Cancel'}
          variant="ghost"
          onPress={() => {
            setReplyTo(null);
            setEditing(null);
            setContent('');
          }}
        />
      ) : null}
    </Surface>
  );
}
