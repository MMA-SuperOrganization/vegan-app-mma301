import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Badge, Surface } from '@/components';
import { colors, radius, shadows, spacing } from '@/theme';

import { postStatusLabel } from '../status';
import type { CommunityPost } from '../types';
import { PostFoodSummary } from './PostFoodSummary';
import { PostLikeIcon } from './PostLikeIcon';

const statusVariant = (status: CommunityPost['status']) => {
  if (status === 'published') return 'success' as const;
  if (status === 'rejected' || status === 'hidden') return 'danger' as const;
  if (status === 'pending_review') return 'warning' as const;
  return 'neutral' as const;
};

export function CommunityPostCard({
  post,
  mine,
  vi,
  onOpen,
  onReact,
  onArchive,
}: {
  post: CommunityPost;
  mine: boolean;
  vi: boolean;
  onOpen: () => void;
  onReact: () => void;
  onArchive?: () => void;
}) {
  const visibleTags = post.tags?.filter((tag) => !tag.startsWith('community-demo-'));
  const liked = post.reacted === 'like';
  return (
    <Surface bordered padding="lg" radius="xl" style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${vi ? 'Mở bài viết' : 'Open post'} ${post.title}`}
        onPress={onOpen}
        style={({ pressed }) => [styles.content, pressed && styles.pressed]}
      >
        <View style={styles.badges}>
          <Badge label={vi ? 'Bài viết' : 'Post'} variant="primary" size="sm" />
          {mine ? (
            <Badge
              label={postStatusLabel(post.status, vi)}
              variant={statusVariant(post.status)}
              size="sm"
            />
          ) : null}
          {post.recipeId ? (
            <Badge
              label={vi ? 'Có công thức' : 'Linked recipe'}
              variant="secondary"
              size="sm"
            />
          ) : null}
          {post.foodItemIds?.length ? (
            <Badge
              label={
                vi
                  ? `${post.foodItemIds.length} nguyên liệu`
                  : `${post.foodItemIds.length} ingredients`
              }
              variant="secondary"
              size="sm"
            />
          ) : null}
        </View>

        <AppText variant="heading3" numberOfLines={2}>
          {post.title}
        </AppText>
        <AppText color={colors.text.secondary} numberOfLines={4}>
          {post.content}
        </AppText>

        <PostFoodSummary
          recipeId={post.recipeId}
          foodItemIds={post.foodItemIds}
          relatedRecipe={post.relatedRecipe}
          relatedFoodItems={post.relatedFoodItems}
        />

        {visibleTags?.length ? (
          <View style={styles.tags}>
            {visibleTags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <AppText variant="caption" color={colors.primary[700]}>
                  #{tag}
                </AppText>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.metrics}>
            <AppText variant="caption" color={colors.text.secondary}>
              {post.reactionCount ?? 0} {vi ? 'cảm xúc' : 'reactions'}
            </AppText>
            <View style={styles.dot} />
            <AppText variant="caption" color={colors.text.secondary}>
              {post.commentCount ?? 0} {vi ? 'bình luận' : 'comments'}
            </AppText>
          </View>
          <AppText variant="bodyStrong" color={colors.primary[700]}>
            {vi ? 'Xem →' : 'View →'}
          </AppText>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          vi ? (liked ? 'Bỏ thích' : 'Thích') : liked ? 'Unlike' : 'Like'
        }
        accessibilityState={{ selected: liked }}
        onPress={onReact}
        style={({ pressed }) => [styles.likeAction, pressed && styles.pressed]}
      >
        <PostLikeIcon liked={liked} />
        <AppText
          variant="bodyStrong"
          color={liked ? colors.primary[700] : colors.text.secondary}
        >
          {vi ? (liked ? 'Đã thích' : 'Thích') : liked ? 'Liked' : 'Like'}
        </AppText>
      </Pressable>

      {onArchive ? (
        <Pressable accessibilityRole="button" onPress={onArchive} hitSlop={8}>
          <AppText variant="caption" color={colors.text.secondary}>
            {vi ? 'Lưu trữ bài viết' : 'Archive post'}
          </AppText>
        </Pressable>
      ) : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    ...shadows.sm,
  },
  content: { gap: spacing.md },
  pressed: { opacity: 0.74 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: {
    backgroundColor: colors.background.selected,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  metrics: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  likeAction: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.none,
    borderRadius: radius.full,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border.strong,
  },
});
