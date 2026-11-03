import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, AppText } from '@/components';
import { useTranslation } from '@/i18n';
import { usePublicProfile } from '@/features/profile/hooks';
import { colors, radius, spacing } from '@/theme';
import type { PostCardData } from '@/features/recipes/types';
import { RecipeImage } from '@/features/recipes/components/RecipeImage';
import { postCopy } from '../postPresentation';
import { usePostMediaAssets } from '../usePostMediaAssets';
import { PostAuthorHeader } from './PostAuthorHeader';
import { PostFoodSummary } from './PostFoodSummary';
import { PostLikeIcon } from './PostLikeIcon';

type HomePost = PostCardData & {
  content?: string;
  media?: Array<{ url?: string; downloadUrl?: string }>;
};

export function HomeSocialPostCard({
  post,
  onPress,
  onReact,
  onComment,
}: {
  post: HomePost;
  onPress: () => void;
  onReact: () => void;
  onComment: () => void;
}) {
  const { t, locale } = useTranslation();
  const liked = post.reacted === 'like';
  const profile = usePublicProfile(
    post.author?.displayName ? undefined : post.authorId
  );
  const author =
    profile.data
      ? {
          ...post.author,
          userId: post.authorId ?? profile.data.userId ?? '',
          displayName: profile.data.displayName ?? post.author?.displayName,
          avatarUrl: profile.data.avatarUrl ?? post.author?.avatarUrl,
        }
      : post.author ?? null;
  const copy = postCopy(
    post.title,
    post.excerpt ?? post.description ?? post.content
  );
  // The posts feed now includes resolved media assets. Keep the per-asset
  // lookup as a fallback for older/cached responses that only have mediaIds.
  const media = usePostMediaAssets(post.media?.length ? [] : post.mediaIds);
  const imageUrl =
    post.coverImageUrl ??
    post.media?.[0]?.downloadUrl ??
    post.media?.[0]?.url ??
    media.data[0]?.downloadUrl;
  return (
    <View style={styles.card}>
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.header}>
        <View style={styles.author}>
          <PostAuthorHeader
            author={author}
            createdAt={post.createdAt}
            publishedAt={post.publishedAt}
            status={post.status}
            visibility={post.visibility}
            vi={locale === 'vi'}
          />
        </View>
        <AppText style={styles.more}>•••</AppText>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.body}>
        {copy.title || copy.content ? (
          <View style={styles.copy}>
            {copy.title ? <AppText variant="bodyStrong">{copy.title}</AppText> : null}
            {copy.content ? <AppText variant="bodyLarge">{copy.content}</AppText> : null}
          </View>
        ) : null}
        <PostFoodSummary
          compact
          recipeId={post.recipeId}
          foodItemIds={post.foodItemIds}
          relatedRecipe={post.relatedRecipe}
          relatedFoodItems={post.relatedFoodItems}
        />
        {imageUrl ? (
          <RecipeImage
            uri={imageUrl}
            style={styles.postImage}
            fallbackSize="large"
          />
        ) : null}
      </Pressable>
      <View style={styles.stats}>
        <View style={styles.statMetric}>
          <AppIcon
            name="heart"
            size={14}
            color={liked ? colors.primary[700] : colors.text.secondary}
            decorative
          />
          <AppText
            variant="caption"
            color={liked ? colors.primary[700] : colors.text.secondary}
          >
            {t('home.likeCount', { count: post.reactionCount ?? 0 })}
          </AppText>
        </View>
        <Pressable accessibilityRole="button" onPress={onComment} hitSlop={8}>
          <AppText variant="caption" color={colors.text.secondary}>
            {post.commentCount ?? 0} {t('home.comments')}
          </AppText>
        </Pressable>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={liked ? t('home.liked') : t('home.like')}
          accessibilityState={{ selected: liked }}
          onPress={onReact}
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
        >
          <PostLikeIcon liked={liked} />
          <AppText variant="caption" color={liked ? colors.primary[700] : undefined}>
            {liked ? t('home.liked') : t('home.like')}
          </AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onComment}
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
        >
          <AppIcon
            name="comment"
            size={20}
            color={colors.text.secondary}
            decorative
          />
          <AppText variant="caption">{t('home.comment')}</AppText>
        </Pressable>
        <Pressable style={styles.action}>
          <AppIcon name="share" size={20} color={colors.text.secondary} decorative />
          <AppText variant="caption">{t('home.share')}</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.surface,
    borderRadius: radius.xl,
    paddingTop: spacing.md,
    overflow: 'hidden',
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  author: { flex: 1, gap: 2 },
  more: { color: colors.text.secondary, fontWeight: '800', letterSpacing: 2 },
  body: { gap: spacing.sm },
  copy: { paddingHorizontal: spacing.md, gap: spacing.xs },
  postImage: { width: '100%', height: 250, borderRadius: 0 },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  statMetric: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actions: {
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  action: {
    flex: 1,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.full,
  },
  actionPressed: { opacity: 0.68 },
});
