import { Pressable, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AppIcon, AppText, appDialog } from '@/components';
import { useTranslation } from '@/i18n';
import { useAuthStore } from '@/features/auth';
import { usePublicProfile } from '@/features/profile/hooks';
import { colors, radius, spacing } from '@/theme';
import type { PostCardData } from '@/features/recipes/types';
import { RecipeImage } from '@/features/recipes/components/RecipeImage';
import { postCopy } from '../postPresentation';
import { usePostMediaAssets } from '../usePostMediaAssets';
import { communityApi } from '../communityApi';
import { PostAuthorHeader } from './PostAuthorHeader';
import { PostFoodSummary } from './PostFoodSummary';
import { PostLikeIcon } from './PostLikeIcon';

type HomePost = PostCardData & {
  content?: string;
  visibility?: 'public' | 'private' | 'unlisted';
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
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const [menuOpen, setMenuOpen] = useState(false);
  const liked = post.reacted === 'like';
  const mine = post.authorId === userId;
  const removePost = useMutation({
    mutationFn: communityApi.remove,
    onSuccess: () => {
      setMenuOpen(false);
      void queryClient.invalidateQueries({ queryKey: ['account'] });
    },
  });
  const deleting = removePost.isPending;
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
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={locale === 'vi' ? 'Mở bài viết' : 'Open post'}
          onPress={onPress}
          style={styles.author}
        >
          <PostAuthorHeader
            author={author}
            createdAt={post.createdAt}
            publishedAt={post.publishedAt}
            status={post.status}
            visibility={post.visibility === 'private' ? 'private' : 'public'}
            vi={locale === 'vi'}
          />
        </Pressable>
        <AppText style={styles.more}>•••</AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={locale === 'vi' ? 'Tùy chọn bài viết' : 'Post options'}
          accessibilityState={{ expanded: menuOpen }}
          onPress={() => setMenuOpen((open) => !open)}
          style={styles.moreHit}
        />
      </View>
      {menuOpen ? (
        <View style={styles.postMenu}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setMenuOpen(false);
              router.push({
                pathname: '/community/report',
                params: { targetType: 'post', targetId: post._id, targetPreview: post.title ?? '' },
              });
            }}
            style={({ pressed }) => [styles.menuItem, pressed && styles.actionPressed]}
          >
            <AppIcon name="flag" size={17} color={colors.text.secondary} decorative />
            <AppText variant="bodySmall">{locale === 'vi' ? 'Báo cáo' : 'Report'}</AppText>
          </Pressable>
          {mine ? (
                <>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setMenuOpen(false);
                      router.push({ pathname: '/community/editor', params: { id: post._id } });
                    }}
                    style={({ pressed }) => [styles.menuItem, pressed && styles.actionPressed]}
                  >
                    <AppIcon name="edit" size={17} color={colors.text.secondary} decorative />
                    <AppText variant="bodySmall">{locale === 'vi' ? 'Chỉnh sửa' : 'Edit post'}</AppText>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    disabled={deleting}
                    onPress={() =>
                      appDialog.alert(
                        locale === 'vi' ? 'Xóa bài viết?' : 'Delete post?',
                        locale === 'vi'
                          ? 'Bài viết và các tương tác liên quan sẽ bị xóa.'
                          : 'The post and its engagement will be removed.',
                        [
                          { text: locale === 'vi' ? 'Hủy' : 'Cancel', style: 'cancel' },
                          {
                            text: locale === 'vi' ? 'Xóa' : 'Delete',
                            style: 'destructive',
                            onPress: () => removePost.mutate(post._id),
                          },
                        ],
                      )
                    }
                    style={({ pressed }) => [styles.menuItem, pressed && styles.actionPressed]}
                  >
                    <AppIcon name="trash" size={17} color={colors.status.danger} decorative />
                    <AppText variant="bodySmall" color={colors.status.danger}>
                      {locale === 'vi' ? 'Xóa bài viết' : 'Delete post'}
                    </AppText>
                  </Pressable>
                </>
          ) : null}
        </View>
      ) : null}
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.body}>
        {copy.title || copy.content ? (
          <View style={styles.copy}>
            <AppText>{copy.content || copy.title}</AppText>
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
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={liked ? t('home.liked') : t('home.like')}
          accessibilityState={{ selected: liked }}
          onPress={onReact}
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
        >
          <PostLikeIcon liked={liked} />
          <AppText variant="caption" color={liked ? colors.primary[700] : colors.text.secondary}>
            {post.reactionCount ?? 0}
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
          <AppText variant="caption" color={colors.text.secondary}>{post.commentCount ?? 0}</AppText>
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
  moreHit: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.sm,
    width: 34,
    height: 34,
    zIndex: 2,
  },
  postMenu: {
    position: 'absolute',
    top: spacing.xl + spacing.sm,
    right: spacing.md,
    zIndex: 10,
    width: 150,
    padding: spacing.xs,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.md,
    backgroundColor: colors.background.surface,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  menuItem: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  body: { gap: spacing.sm },
  copy: { paddingHorizontal: spacing.md, gap: spacing.xs },
  postImage: { width: '100%', height: 250, borderRadius: 0 },
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
