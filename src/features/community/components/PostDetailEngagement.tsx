import { useEffect, useState } from 'react';
import { Pressable, Share, StyleSheet, View } from 'react-native';

import { AppIcon, AppText } from '@/components';
import type { ReactionType } from '@/features/engagement/engagementApi';
import { colors, radius, spacing, type AssetName } from '@/theme';

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
  const loved = selectedReaction === 'love';

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
    <View style={styles.container}>
      <View style={styles.actions}>
        <EngagementAction
          icon={loved ? 'heart-filled' : 'heart'}
          label={`${vi ? 'Yêu thích' : 'Favorite'} · ${reactionCount}`}
          accessibilityLabel={vi ? 'Yêu thích bài viết' : 'Favorite post'}
          selected={loved}
          onPress={() => onReact('love', loved)}
        />
        <EngagementAction
          icon="comment"
          label={`${vi ? 'Bình luận' : 'Comment'} · ${commentCount}`}
          accessibilityLabel={vi ? 'Bình luận' : 'Comment'}
          onPress={onComment}
        />
        <EngagementAction
          icon="share"
          label={vi ? 'Chia sẻ' : 'Share'}
          accessibilityLabel={vi ? 'Chia sẻ' : 'Share'}
          onPress={() => void sharePost()}
        />
      </View>

      {shareFeedback ? (
        <View style={styles.feedback} accessibilityLiveRegion="polite">
          <AppIcon name="check" size={15} color={colors.primary[700]} decorative />
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
        <AppIcon name="flag" size={14} color={colors.text.secondary} decorative />
        <AppText variant="caption" color={colors.text.secondary}>
          {vi ? 'Báo cáo' : 'Report'}
        </AppText>
      </Pressable>
    </View>
  );
}

function EngagementAction({
  icon,
  label,
  accessibilityLabel,
  selected = false,
  onPress,
}: {
  icon: AssetName;
  label: string;
  accessibilityLabel: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        selected && styles.actionSelected,
        pressed && styles.pressed,
      ]}
    >
      <AppIcon name={icon} size={19} color={colors.primary[700]} decorative />
      <AppText variant="caption" color={colors.primary[700]} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  actions: { flexDirection: 'row', gap: spacing.xs },
  action: {
    flex: 1,
    minWidth: 0,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.background.muted,
  },
  actionSelected: { backgroundColor: colors.background.selected },
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.background.selected,
  },
  reportAction: {
    minHeight: 30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  pressed: { opacity: 0.65 },
});
