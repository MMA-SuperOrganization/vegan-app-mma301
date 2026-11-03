import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppButton,
  BackButton,
  AppIcon,
  AppText,
  ScreenWrapper,
  Surface,
  appDialog,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useAuthStore } from '@/features/auth';
import { useTranslation } from '@/i18n';
import { useSafeBack } from '@/hooks';
import { colors, spacing, webLayout } from '@/theme';
import { useCommunityPost, usePostReaction } from '../hooks';
import { engagementApi } from '@/features/engagement/engagementApi';
import { PostComments } from '../components/PostComments';
import { PostDetailEngagement } from '../components/PostDetailEngagement';
import { PostFoodSummary } from '../components/PostFoodSummary';
import { PostMediaGallery } from '../components/PostMediaGallery';
import { PostAuthorHeader } from '../components/PostAuthorHeader';
import { postCopy } from '../postPresentation';
import { usePublicProfile } from '@/features/profile/hooks';

export function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const goBack = useSafeBack('/community');
  const vi = useTranslation().locale === 'vi';
  const userId = useAuthStore((state) => state.user?.id);
  const actions = useCommunityPost(id);
  const postReaction = usePostReaction();
  const post = actions.post.data;
  const author = usePublicProfile(post?.author ? undefined : post?.authorId);
  const copy = postCopy(post?.title, post?.content);
  const presentedAuthor =
    post?.author ??
    (author.data
      ? {
          userId: post?.authorId ?? '',
          displayName: author.data.displayName,
          avatarUrl: author.data.avatarUrl,
        }
      : null);
  useEffect(() => {
    if (post?._id && post.status === 'published')
      void engagementApi.recordView('post', post._id).catch(() => undefined);
  }, [post?._id, post?.status]);
  const [deletingPost, setDeletingPost] = useState(false);
  const [commentFocusRequest, setCommentFocusRequest] = useState(0);
  const mine = post?.authorId === userId;
  const published = post?.status === 'published';
  const busy = actions.remove.isPending;
  const openPostMenu = () => {
    if (!post) return;
    appDialog.alert(
      vi ? 'Tùy chọn bài viết' : 'Post options',
      undefined,
      [
        {
          text: vi ? 'Báo cáo bài viết' : 'Report post',
          onPress: () =>
            router.push({
              pathname: '/community/report',
              params: {
                targetType: 'post',
                targetId: id,
                targetPreview: post.title,
              },
            }),
        },
        { text: vi ? 'Hủy' : 'Cancel', style: 'cancel' },
      ],
    );
  };
  return (
    <ScreenWrapper webMaxWidth={webLayout.feedMaxWidth}>
      <PostComments
        postId={id}
        scrollable
        showComments={published}
        contentContainerStyle={styles.screenContent}
        focusRequestKey={commentFocusRequest}
        contentHeader={
          <>
            {!post ? (
              <View style={styles.loadingNavigation}>
                <BackButton onPress={goBack} />
              </View>
            ) : null}
            <FeatureState
              loading={actions.post.isLoading}
              error={actions.post.error}
              retry={() => void actions.post.refetch()}
            />
            {post ? (
              <>
                <BackButton onPress={goBack} />
                <View style={styles.articleCard}>
                  <View style={styles.articleContent}>
                    <View style={styles.articleHeader}>
                      <PostAuthorHeader
                        author={presentedAuthor}
                        createdAt={post.createdAt}
                        publishedAt={post.publishedAt}
                        status={post.status}
                        visibility={post.visibility}
                        vi={vi}
                      />
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={vi ? 'Mở tùy chọn bài viết' : 'Open post options'}
                        onPress={openPostMenu}
                        hitSlop={10}
                        style={({ pressed }) => [styles.moreButton, pressed && styles.cardPressed]}
                      >
                        <AppText style={styles.moreIcon}>•••</AppText>
                      </Pressable>
                    </View>
                    {copy.title ? (
                      <AppText variant="heading3">{copy.title}</AppText>
                    ) : null}
                    {copy.content ? (
                      <AppText selectable style={styles.articleBody}>
                        {copy.content}
                      </AppText>
                    ) : null}
                  </View>

                  <PostMediaGallery assets={actions.media.data ?? []} vi={vi} />
                  <FeatureState error={actions.media.error} />

                  {post.recipeId || post.foodItemIds?.length ? (
                    <View style={styles.linkedRecipeCard}>
                      <AppText variant="bodyStrong">
                        {vi ? 'Món ăn được nhắc đến' : 'Food mentioned in this post'}
                      </AppText>
                      {post.recipeId ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={
                            vi ? 'Mở công thức liên quan' : 'Open related recipe'
                          }
                          onPress={() =>
                            router.push({
                              pathname: '/(discover)/recipe/[id]',
                              params: {
                                id:
                                  post.relatedRecipe?.slug ??
                                  post.relatedRecipe?._id ??
                                  post.recipeId!,
                              },
                            })
                          }
                          style={({ pressed }) => pressed && styles.cardPressed}
                        >
                          <PostFoodSummary
                            recipeId={post.recipeId}
                            foodItemIds={post.foodItemIds}
                            relatedRecipe={post.relatedRecipe}
                            relatedFoodItems={post.relatedFoodItems}
                          />
                        </Pressable>
                      ) : (
                        <PostFoodSummary
                          foodItemIds={post.foodItemIds}
                          relatedFoodItems={post.relatedFoodItems}
                        />
                      )}
                    </View>
                  ) : null}

                  {published ? (
                    <View style={styles.engagement}>
                      <PostDetailEngagement
                        vi={vi}
                        title={post.title}
                        content={post.content}
                        selectedReaction={post.reacted}
                        reactionCount={post.reactionCount ?? 0}
                        commentCount={
                          post.commentCount ??
                          actions.comments.data?.data.length ??
                          0
                        }
                        onReact={(type, remove) =>
                          postReaction.mutate({
                            postId: post._id,
                            nextReaction: remove ? null : type,
                          })
                        }
                        onComment={() =>
                          setCommentFocusRequest((value) => value + 1)
                        }
                      />
                      <FeatureState error={postReaction.error} />
                    </View>
                  ) : null}
                </View>
                {post.rejectionReason ? (
                  <AppText>{post.rejectionReason}</AppText>
                ) : null}
                {mine &&
                ['draft', 'rejected', 'published', 'archived'].includes(
                  post.status
                ) ? (
                  <>
                    <AppButton
                      title={vi ? 'Sửa bài' : 'Edit post'}
                      disabled={busy}
                      onPress={() =>
                        router.push({
                          pathname: '/community/editor',
                          params: { id },
                        })
                      }
                    />
                  </>
                ) : null}
                {mine ? (
                  deletingPost ? (
                    <Surface
                      bordered
                      padding="lg"
                      radius="xl"
                      style={styles.deleteCard}
                    >
                      <View style={styles.deleteTitle}>
                        <AppIcon
                          name="trash"
                          size={20}
                          color={colors.status.danger}
                          decorative
                        />
                        <AppText variant="bodyStrong" color={colors.status.danger}>
                          {vi ? 'Xóa bài viết này?' : 'Delete this post?'}
                        </AppText>
                      </View>
                      <AppText variant="bodySmall" color={colors.text.secondary}>
                        {vi
                          ? 'Bài viết và các tương tác liên quan sẽ không còn hiển thị.'
                          : 'The post and its engagement will no longer be visible.'}
                      </AppText>
                      <AppButton
                        title={vi ? 'Xác nhận xóa' : 'Confirm deletion'}
                        variant="danger"
                        disabled={busy}
                        loading={busy}
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
                    </Surface>
                  ) : (
                    <AppButton
                      title={vi ? 'Xóa bài' : 'Delete post'}
                      variant="ghost"
                      disabled={busy}
                      onPress={() => setDeletingPost(true)}
                    />
                  )
                ) : null}
              </>
            ) : null}
            <FeatureState error={actions.remove.error} />
          </>
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingNavigation: { alignItems: 'flex-start' },
  screenContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  articleCard: {
    gap: spacing.md,
  },
  articleContent: { gap: spacing.md },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  moreButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  moreIcon: {
    color: colors.text.secondary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  articleBody: {
    lineHeight: 25,
  },
  linkedRecipeCard: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  engagement: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  cardPressed: { opacity: 0.78 },
  deleteCard: { gap: spacing.sm, borderColor: colors.status.danger },
  deleteTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
