import { useState } from 'react';
import { Alert, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { AppButton, AppText, CustomHeader, ScreenWrapper } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { useCommunityPosts, useCommunityVideos } from '../hooks';
import { postStatusLabel } from '../status';
import { communityApi } from '../communityApi';

export function CommunityScreen() {
  const router = useRouter();
  const vi = useTranslation().locale === 'vi';
  const [mine, setMine] = useState(false);
  const [contentType, setContentType] = useState<'posts' | 'videos'>('posts');
  const posts = useCommunityPosts(mine);
  const videos = useCommunityVideos(mine);
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: ['account'] });
  const archivePost = useMutation({
    mutationFn: communityApi.archivePost,
    onSuccess: refresh,
  });
  const archiveVideo = useMutation({
    mutationFn: communityApi.archiveVideo,
    onSuccess: refresh,
  });
  return (
    <ScreenWrapper
      scrollable
      contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
      header={
        <CustomHeader
          title={vi ? 'Cộng đồng' : 'Community'}
          showBack
          backFallbackHref="/(tabs)/profile"
        />
      }
    >
      <AppButton
        title={
          contentType === 'posts'
            ? vi
              ? 'Viết bài'
              : 'Write a post'
            : vi
              ? 'Đăng video'
              : 'Upload video'
        }
        onPress={() =>
          router.push(
            contentType === 'posts' ? '/community/editor' : '/community/video-editor'
          )
        }
      />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <AppButton
          title={vi ? 'Bài viết' : 'Posts'}
          fullWidth={false}
          variant={contentType === 'posts' ? 'primary' : 'outline'}
          onPress={() => setContentType('posts')}
        />
        <AppButton
          title="Video"
          fullWidth={false}
          variant={contentType === 'videos' ? 'primary' : 'outline'}
          onPress={() => setContentType('videos')}
        />
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <AppButton
          title={vi ? 'Bảng tin' : 'Feed'}
          fullWidth={false}
          variant={mine ? 'outline' : 'primary'}
          onPress={() => setMine(false)}
        />
        <AppButton
          title={vi ? 'Bài của tôi' : 'My posts'}
          fullWidth={false}
          variant={mine ? 'primary' : 'outline'}
          onPress={() => setMine(true)}
        />
      </View>
      <FeatureState
        loading={contentType === 'posts' ? posts.isLoading : videos.isLoading}
        error={contentType === 'posts' ? posts.error : videos.error}
        retry={() =>
          void (contentType === 'posts' ? posts.refetch() : videos.refetch())
        }
      />
      {contentType === 'posts' && posts.data?.data.length === 0 ? (
        <AppText>{vi ? 'Chưa có bài viết.' : 'No posts yet.'}</AppText>
      ) : null}
      {contentType === 'videos' && videos.data?.data.length === 0 ? (
        <AppText>{vi ? 'Chưa có video.' : 'No videos yet.'}</AppText>
      ) : null}
      {contentType === 'posts'
        ? posts.data?.data.map((post) => (
            <View
              key={post._id}
              style={{
                backgroundColor: colors.background.surface,
                borderRadius: radius.lg,
                padding: spacing.lg,
                gap: spacing.sm,
              }}
            >
              <AppText variant="heading3">{post.title}</AppText>
              <AppText numberOfLines={3}>{post.content}</AppText>
              {post.recipeId ? (
                <AppText color={colors.primary[700]}>
                  {vi ? 'Có công thức liên quan' : 'Includes a related recipe'}
                </AppText>
              ) : null}
              {mine ? <AppText>{postStatusLabel(post.status, vi)}</AppText> : null}
              <AppButton
                title={vi ? 'Xem bài viết' : 'Read post'}
                variant="outline"
                onPress={() =>
                  router.push({
                    pathname: '/community/post',
                    params: { id: post._id },
                  })
                }
              />
              {mine && ['draft', 'rejected', 'published'].includes(post.status) ? (
                <AppButton
                  title={vi ? 'Lưu trữ bài viết' : 'Archive post'}
                  variant="ghost"
                  disabled={archivePost.isPending}
                  onPress={() =>
                    Alert.alert(
                      vi ? 'Lưu trữ bài viết?' : 'Archive post?',
                      post.title,
                      [
                        { text: vi ? 'Hủy' : 'Cancel', style: 'cancel' },
                        {
                          text: vi ? 'Lưu trữ' : 'Archive',
                          onPress: () => archivePost.mutate(post),
                        },
                      ]
                    )
                  }
                />
              ) : null}
            </View>
          ))
        : videos.data?.data.map((video) => (
            <View
              key={video._id}
              style={{
                backgroundColor: colors.background.surface,
                borderRadius: radius.lg,
                padding: spacing.lg,
                gap: spacing.sm,
              }}
            >
              <AppText variant="heading3">{video.title}</AppText>
              <AppText numberOfLines={3}>{video.description}</AppText>
              {mine ? <AppText>{postStatusLabel(video.status, vi)}</AppText> : null}
              <AppButton
                title={vi ? 'Xem video' : 'View video'}
                variant="outline"
                onPress={() =>
                  router.push({
                    pathname: '/community/video',
                    params: { id: video._id },
                  })
                }
              />
              {mine && ['draft', 'rejected', 'published'].includes(video.status) ? (
                <AppButton
                  title={vi ? 'Lưu trữ video' : 'Archive video'}
                  variant="ghost"
                  disabled={archiveVideo.isPending}
                  onPress={() =>
                    Alert.alert(
                      vi ? 'Lưu trữ video?' : 'Archive video?',
                      video.title,
                      [
                        { text: vi ? 'Hủy' : 'Cancel', style: 'cancel' },
                        {
                          text: vi ? 'Lưu trữ' : 'Archive',
                          onPress: () => archiveVideo.mutate(video),
                        },
                      ]
                    )
                  }
                />
              ) : null}
            </View>
          ))}
    </ScreenWrapper>
  );
}
