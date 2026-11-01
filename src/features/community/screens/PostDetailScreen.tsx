import { useEffect, useState } from 'react';
import { Image, Pressable, Share, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppButton,
  AppIcon,
  AppText,
  Badge,
  CustomHeader,
  ScreenWrapper,
  Surface,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useAuthStore } from '@/features/auth';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { useCommunityPost } from '../hooks';
import { engagementApi } from '@/features/engagement/engagementApi';
import { postStatusLabel } from '../status';
import { ContentResultCard } from '@/features/recipes/components/ContentResultCard';
import { useRecipeDetail } from '@/features/recipes/hooks';
import { PostComments } from '../components/PostComments';

export function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const vi = useTranslation().locale === 'vi';
  const userId = useAuthStore((state) => state.user?.id);
  const actions = useCommunityPost(id);
  const post = actions.post.data;
  const linkedRecipe = useRecipeDetail(post?.recipeId ?? '');
  useEffect(() => {
    if (post?._id && post.status === 'published')
      void engagementApi.recordView('post', post._id).catch(() => undefined);
  }, [post?._id, post?.status]);
  const [deletingPost, setDeletingPost] = useState(false);
  const mine = post?.authorId === userId;
  const published = post?.status === 'published';
  const busy = actions.remove.isPending;
  return (
    <ScreenWrapper
      scrollable
      contentContainerStyle={styles.screenContent}
      header={
        <CustomHeader
          title={post?.title || (vi ? 'Bài viết' : 'Post')}
          showBack
          backFallbackHref="/community"
        />
      }
    >
      <FeatureState
        loading={actions.post.isLoading}
        error={actions.post.error}
        retry={() => void actions.post.refetch()}
      />
      {post ? (
        <>
          <Surface padding="lg" radius="xl" style={styles.articleCard}>
            <View style={styles.articleBadges}>
              <Badge
                label={vi ? 'Bài viết cộng đồng' : 'Community post'}
                variant="primary"
                size="sm"
              />
              <Badge
                label={postStatusLabel(post.status, vi)}
                variant={published ? 'success' : 'neutral'}
                size="sm"
              />
            </View>
            <AppText variant="heading2">{post.title}</AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={vi ? 'Xem hồ sơ tác giả' : 'View author profile'}
              onPress={() =>
                router.push({ pathname: '/users/[id]', params: { id: post.authorId } })
              }
              style={({ pressed }) => [styles.authorRow, pressed && styles.actionPressed]}
            >
              <View style={styles.authorAvatar}>
                <AppIcon name="user" size={20} color={colors.primary[700]} decorative />
              </View>
              <View style={styles.authorCopy}>
                <AppText variant="bodyStrong">
                  {vi ? 'Tác giả bài viết' : 'Post author'}
                </AppText>
                <AppText variant="caption" color={colors.text.secondary}>
                  {vi ? 'Chạm để xem hồ sơ' : 'Tap to view profile'}
                </AppText>
              </View>
              <AppText variant="bodyStrong" color={colors.primary[700]}>
                →
              </AppText>
            </Pressable>
            <View style={styles.articleDivider} />
            <AppText selectable style={styles.articleBody}>
              {post.content}
            </AppText>
          </Surface>
          {actions.media.data?.map((asset) =>
            asset.downloadUrl ? (
              <Image
                key={asset._id}
                source={{ uri: asset.downloadUrl }}
                style={{ width: '100%', height: 240, borderRadius: radius.lg }}
                resizeMode="cover"
              />
            ) : null
          )}
          <FeatureState error={actions.media.error} />
          {post.recipeId ? (
            <Surface bordered padding="lg" radius="xl" style={styles.linkedRecipeCard}>
              <AppText variant="heading3">
                {vi ? 'Công thức trong bài viết' : 'Recipe in this post'}
              </AppText>
              <AppText color={colors.text.secondary}>
                {vi
                  ? 'Đây là công thức độc lập được bài viết này nhắc đến.'
                  : 'This is the separate recipe referenced by this post.'}
              </AppText>
              <FeatureState
                loading={linkedRecipe.isLoading}
                error={linkedRecipe.error}
                retry={() => void linkedRecipe.refetch()}
              />
              {linkedRecipe.data ? (
                <ContentResultCard
                  item={{ ...linkedRecipe.data, type: 'recipe' }}
                  onPress={() =>
                    router.push({
                      pathname: '/(discover)/recipe/[id]',
                      params: {
                        id: linkedRecipe.data.slug ?? linkedRecipe.data._id,
                      },
                    })
                  }
                />
              ) : null}
            </Surface>
          ) : null}
          {post.rejectionReason ? <AppText>{post.rejectionReason}</AppText> : null}
          {mine &&
          ['draft', 'rejected', 'published', 'archived'].includes(post.status) ? (
            <>
              <AppButton
                title={vi ? 'Sửa bài' : 'Edit post'}
                disabled={busy}
                onPress={() =>
                  router.push({ pathname: '/community/editor', params: { id } })
                }
              />
            </>
          ) : null}
          {mine ? (
            deletingPost ? (
              <>
                <AppText>{vi ? 'Xóa bài viết này?' : 'Delete this post?'}</AppText>
                <AppButton
                  title={vi ? 'Xác nhận xóa' : 'Confirm deletion'}
                  disabled={busy}
                  onPress={() =>
                    actions.remove.mutate(id, {
                      onSuccess: () => router.replace('/community'),
                    })
                  }
                />
                <AppButton
                  title={vi ? 'Hủy' : 'Cancel'}
                  variant="ghost"
                  onPress={() => setDeletingPost(false)}
                />
              </>
            ) : (
              <AppButton
                title={vi ? 'Xóa bài' : 'Delete post'}
                variant="ghost"
                disabled={busy}
                onPress={() => setDeletingPost(true)}
              />
            )
          ) : null}
          {published ? (
            <>
              <View style={styles.secondaryActions}>
                <AppButton
                  title={vi ? 'Chia sẻ' : 'Share'}
                  variant="ghost"
                  fullWidth={false}
                  style={styles.secondaryActionButton}
                  onPress={() =>
                    void Share.share({ message: `${post.title}\n\n${post.content}` })
                  }
                />
                <AppButton
                  title={vi ? 'Báo cáo' : 'Report'}
                  variant="ghost"
                  fullWidth={false}
                  style={styles.secondaryActionButton}
                  onPress={() =>
                    router.push({
                      pathname: '/community/report',
                      params: { targetType: 'post', targetId: id },
                    })
                  }
                />
              </View>
              <PostComments postId={id} />
            </>
          ) : null}
        </>
      ) : null}
      <FeatureState error={actions.remove.error} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  articleCard: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  articleBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.background.selected,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.surface,
  },
  authorCopy: {
    flex: 1,
    minWidth: 0,
  },
  articleDivider: {
    height: 1,
    backgroundColor: colors.border.subtle,
  },
  articleBody: {
    lineHeight: 25,
  },
  linkedRecipeCard: {
    gap: spacing.md,
  },
  actionPressed: {
    opacity: 0.72,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondaryActionButton: {
    flex: 1,
    minWidth: 0,
  },
});
