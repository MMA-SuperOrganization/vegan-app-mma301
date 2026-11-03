import { Pressable, Share, StyleSheet, View } from 'react-native';

import { AppIcon, AppText } from '@/components';
import type { ReactionType } from '@/features/engagement/engagementApi';
import { colors, radius, spacing, type AssetName } from '@/theme';
import {
  formatEngagementCount,
  formatFullEngagementCount,
} from '../engagementPresentation';

// Kept as a non-visual action for callers that need native sharing; the post
// detail UI intentionally does not render a share button.
export function sharePost(message: string) {
  return Share.share({ message });
}

interface PostDetailEngagementProps {
  vi: boolean;
  selectedReaction?: string | null;
  reactionCount: number;
  commentCount: number;
  onReact: (type: ReactionType, remove: boolean) => void;
  onComment: () => void;
  saved?: boolean;
  onSave?: () => void;
}

export function PostDetailEngagement({
  vi,
  selectedReaction,
  reactionCount,
  commentCount,
  onReact,
  onComment,
  saved,
  onSave,
}: PostDetailEngagementProps) {
  const loved = selectedReaction === 'love';
  const locale = vi ? 'vi' : 'en';

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <EngagementAction
          icon={loved ? 'heart-filled' : 'heart'}
          count={formatEngagementCount(reactionCount, locale)}
          accessibilityLabel={`${vi ? 'Yêu thích bài viết' : 'Favorite post'}, ${formatFullEngagementCount(reactionCount, locale)}`}
          selected={loved}
          onPress={() => onReact('love', loved)}
        />
        <EngagementAction
          icon="comment"
          count={formatEngagementCount(commentCount, locale)}
          accessibilityLabel={`${vi ? 'Bình luận' : 'Comment'}, ${formatFullEngagementCount(commentCount, locale)}`}
          onPress={onComment}
        />
        {onSave ? (
          <EngagementAction
            icon={saved ? 'bookmark-filled' : 'bookmark'}
            count={vi ? (saved ? 'Đã lưu' : 'Lưu') : saved ? 'Saved' : 'Save'}
            accessibilityLabel={`${vi ? (saved ? 'Bỏ lưu bài viết' : 'Lưu bài viết') : saved ? 'Unsave post' : 'Save post'}`}
            selected={saved}
            onPress={onSave}
          />
        ) : null}
      </View>
    </View>
  );
}

function EngagementAction({
  icon,
  accessibilityLabel,
  count,
  selected = false,
  onPress,
}: {
  icon: AssetName;
  accessibilityLabel: string;
  count?: string;
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
      {count ? (
        <AppText variant="caption" color={colors.text.secondary} numberOfLines={1}>
          {count}
        </AppText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  actions: { flexDirection: 'row', gap: spacing.xs },
  action: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.background.muted,
  },
  actionSelected: { backgroundColor: colors.background.selected },
  pressed: { opacity: 0.65 },
});
