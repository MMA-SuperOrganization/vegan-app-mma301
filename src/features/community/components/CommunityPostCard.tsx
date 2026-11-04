import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, AppText, Badge, Surface } from '@/components';
import { colors, radius, shadows, spacing } from '@/theme';
import { useSavedMutation, useSavedState } from '@/features/recipes/hooks';

import { postCopy } from '../postPresentation';
import { postStatusLabel } from '../status';
import type { CommunityPost } from '../types';
import { usePostMediaAssets } from '../usePostMediaAssets';
import { PostAuthorHeader } from './PostAuthorHeader';
import { PostFoodSummary } from './PostFoodSummary';
import { PostLikeIcon } from './PostLikeIcon';
import { PostMediaGallery } from './PostMediaGallery';

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
  onComment,
  onArchive,
}: {
  post: CommunityPost;
  mine: boolean;
  vi: boolean;
  onOpen: () => void;
  onReact: () => void;
  onComment: () => void;
  onArchive?: () => void;
}) {
  const visibleTags = post.tags?.filter((tag) => !tag.startsWith('community-demo-'));
  const liked = post.reacted === 'like';
  const copy = postCopy(post.title, post.content);
  const media = usePostMediaAssets(post.mediaIds);
  const savedState = useSavedState('post', post._id);
  const savedMutation = useSavedMutation();
  const isSaved = savedState.isSaved;

  const toggleSave = () => {
    savedMutation.mutate({
      type: 'post',
      id: post._id,
      saved: isSaved,
      target: {
        _id: post._id,
        type: 'post',
        title: post.title || post.content?.slice(0, 50),
        excerpt: post.content?.slice(0, 100),
        imageUrl: media.data?.[0]?.downloadUrl,
      },
    });
  };

  return (
    <Surface bordered radius="xl" style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${vi ? 'Mở bài viết' : 'Open post'} ${post.title}`}
        onPress={onOpen}
        style={({ pressed }) => [styles.post, pressed && styles.pressed]}
      >
        <View style={styles.header}>
          <PostAuthorHeader
            author={post.author}
            createdAt={post.createdAt}
            publishedAt={post.publishedAt}
            status={post.status}
            visibility={post.visibility}
            vi={vi}
          />
          {mine ? (
            <View style={styles.badges}>
              <Badge
                label={postStatusLabel(post.status, vi)}
                variant={statusVariant(post.status)}
                size="sm"
              />
              {post.visibility === 'private' ? (
                <Badge label={vi ? 'Riêng tư' : 'Private'} variant="warning" size="sm" />
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.copy}>
          {copy.title ? (
            <AppText variant="heading4" numberOfLines={2}>
              {copy.title}
            </AppText>
          ) : null}
          {copy.content ? (
            <AppText color={colors.text.primary} numberOfLines={5}>
              {copy.content}
            </AppText>
          ) : null}
          {visibleTags?.length ? (
            <View style={styles.tags}>
              {visibleTags.slice(0, 3).map((tag) => (
                <AppText key={tag} variant="caption" color={colors.primary[700]}>
                  #{tag}
                </AppText>
              ))}
            </View>
          ) : null}
        </View>

        <PostMediaGallery assets={media.data} vi={vi} />

        <View style={styles.foodPreview}>
          {post.recipeId ? (
            <AppText variant="caption" color={colors.text.secondary}>
              {vi ? 'Có công thức' : 'Recipe attached'}
            </AppText>
          ) : null}
          <PostFoodSummary
            recipeId={post.recipeId}
            foodItemIds={post.foodItemIds}
            relatedRecipe={post.relatedRecipe}
            relatedFoodItems={post.relatedFoodItems}
          />
        </View>

        <View style={styles.stats}>
          <AppText variant="caption" color={colors.text.secondary}>
            {post.reactionCount ?? 0} {vi ? 'lượt thích' : 'likes'}
          </AppText>
          <AppText variant="caption" color={colors.text.secondary}>
            {post.commentCount ?? 0} {vi ? 'bình luận' : 'comments'}
          </AppText>
        </View>
      </Pressable>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={vi ? (liked ? 'Bỏ thích' : 'Thích') : liked ? 'Unlike' : 'Like'}
          accessibilityState={{ selected: liked }}
          onPress={onReact}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <PostLikeIcon liked={liked} />
          <AppText
            variant="caption"
            color={liked ? colors.primary[700] : colors.text.secondary}
          >
            {post.reactionCount ?? 0}
          </AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={vi ? 'Xem bình luận' : 'View comments'}
          onPress={onComment}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <AppIcon name="comment" size={20} color={colors.text.secondary} decorative />
          <AppText variant="caption" color={colors.text.secondary}>
            {post.commentCount ?? 0}
          </AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            vi
              ? isSaved
                ? 'Bỏ lưu bài viết'
                : 'Lưu bài viết'
              : isSaved
                ? 'Unsave post'
                : 'Save post'
          }
          accessibilityState={{ selected: isSaved }}
          onPress={toggleSave}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <AppIcon
            name={isSaved ? 'bookmark-filled' : 'bookmark'}
            size={20}
            color={isSaved ? colors.primary[700] : colors.text.secondary}
            decorative
          />
          <AppText
            variant="caption"
            color={isSaved ? colors.primary[700] : colors.text.secondary}
          >
            {vi ? (isSaved ? 'Đã lưu' : 'Lưu') : isSaved ? 'Saved' : 'Save'}
          </AppText>
        </Pressable>
      </View>

      {onArchive ? (
        <Pressable
          accessibilityRole="button"
          onPress={onArchive}
          hitSlop={8}
          style={styles.archive}
        >
          <AppText variant="caption" color={colors.text.secondary}>
            {vi ? 'Lưu trữ bài viết' : 'Archive post'}
          </AppText>
        </Pressable>
      ) : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', ...shadows.sm },
  post: { gap: spacing.md },
  pressed: { opacity: 0.74 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.sm },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  copy: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  foodPreview: { paddingHorizontal: spacing.lg },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  actions: {
    minHeight: 48,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  action: {
    flex: 1,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.full,
  },
  archive: { alignItems: 'center', paddingBottom: spacing.sm },
});
