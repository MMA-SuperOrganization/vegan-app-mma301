import { useEffect, useState } from 'react';
import { Pressable, Share, StyleSheet, View } from 'react-native';

import { AppButton, AppIcon, AppText, Surface } from '@/components';
import { ReactionButtons } from '@/features/engagement/ReactionButtons';
import type { ReactionType } from '@/features/engagement/engagementApi';
import { colors, radius, spacing } from '@/theme';

interface PostDetailEngagementProps {
  vi: boolean;
  title: string;
  content: string;
  selectedReaction?: string | null;
  reactionCount: number;
  commentCount: number;
  onReact: (type: ReactionType, remove: boolean) => void;
  onComment: () => void;
  onReport: () => void;
}

export function PostDetailEngagement({
  vi,
  title,
  content,
  selectedReaction,
  reactionCount,
  commentCount,
  onReact,
  onComment,
  onReport,
}: PostDetailEngagementProps) {
  const [shareFeedback, setShareFeedback] = useState<string>();

  useEffect(() => {
    if (!shareFeedback) return;
    const timer = setTimeout(() => setShareFeedback(undefined), 2600);
    return () => clearTimeout(timer);
  }, [shareFeedback]);

  const sharePost = async () => {
    try {
      const excerpt = content.length > 360 ? `${content.slice(0, 357)}…` : content;
      const result = await Share.share({ title, message: `${title}\n\n${excerpt}` });
      if (result.action === Share.sharedAction) {
        setShareFeedback(vi ? 'Đã mở ứng dụng chia sẻ.' : 'Share options opened.');
      }
    } catch {
      setShareFeedback(
        vi
          ? 'Chưa thể chia sẻ bài viết. Vui lòng thử lại.'
          : 'Unable to share. Try again.'
      );
    }
  };

  return (
    <Surface padding="lg" radius="xl" style={styles.card}>
      <View style={styles.header}>
        <View>
          <AppText variant="heading3">{vi ? 'Tương tác' : 'Engagement'}</AppText>
          <AppText variant="caption" color={colors.text.secondary}>
            {vi
              ? 'Chia sẻ cảm nhận của bạn về bài viết'
              : 'Share how this post helped you'}
          </AppText>
        </View>
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <AppIcon name="heart" size={17} color={colors.primary[700]} decorative />
            <AppText variant="bodyStrong">{reactionCount}</AppText>
          </View>
          <View style={styles.metric}>
            <AppIcon
              name="comment"
              size={17}
              color={colors.primary[700]}
              decorative
            />
            <AppText variant="bodyStrong">{commentCount}</AppText>
          </View>
        </View>
      </View>

      <ReactionButtons
        selected={selectedReaction}
        disabled={false}
        vi={vi}
        onPress={onReact}
      />

      <View style={styles.quickActions}>
        <AppButton
          title={vi ? 'Bình luận' : 'Comment'}
          icon="comment"
          variant="outline"
          style={styles.quickAction}
          onPress={onComment}
        />
        <AppButton
          title={vi ? 'Chia sẻ' : 'Share'}
          icon="share"
          variant="outline"
          style={styles.quickAction}
          onPress={() => void sharePost()}
        />
      </View>

      {shareFeedback ? (
        <View style={styles.feedback} accessibilityLiveRegion="polite">
          <AppIcon name="check" size={16} color={colors.primary[700]} decorative />
          <AppText variant="caption" color={colors.primary[700]}>
            {shareFeedback}
          </AppText>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={vi ? 'Báo cáo bài viết' : 'Report post'}
        onPress={onReport}
        style={({ pressed }) => [styles.reportAction, pressed && styles.pressed]}
      >
        <AppIcon name="flag" size={16} color={colors.text.secondary} decorative />
        <AppText variant="caption" color={colors.text.secondary}>
          {vi ? 'Báo cáo bài viết' : 'Report post'}
        </AppText>
      </Pressable>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  metrics: { flexDirection: 'row', gap: spacing.sm },
  metric: {
    minWidth: 52,
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.background.selected,
  },
  quickActions: { flexDirection: 'row', gap: spacing.sm },
  quickAction: { flex: 1, minWidth: 0 },
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.background.selected,
  },
  reportAction: {
    minHeight: 38,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  pressed: { opacity: 0.65 },
});
