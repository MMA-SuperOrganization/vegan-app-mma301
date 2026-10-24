import { useEffect } from 'react';
import { Alert, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppButton, AppText, CustomHeader, ScreenWrapper } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { ContentSaveButton } from '@/features/recipes/components/ContentSaveButton';
import { communityApi } from '../communityApi';
import { useAuthStore } from '@/features/auth';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme';
import { engagementApi } from '@/features/engagement/engagementApi';
import { RatingPanel } from '@/features/engagement/RatingPanel';
import { DiscussionPanel } from '@/features/engagement/DiscussionPanel';
export function VideoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vi = useTranslation().locale === 'vi';
  const router = useRouter();
  const userId = useAuthStore((state) => state.user?.id);
  const video = useQuery({
    queryKey: ['account', userId, 'video', id],
    queryFn: () => communityApi.video(id),
    enabled: Boolean(userId && id),
  });
  const player = useVideoPlayer(
    video.data?.playback?.downloadUrl ?? null,
    (value) => {
      value.timeUpdateEventInterval = 10;
    }
  );
  const progressEvent = useEvent(player, 'timeUpdate', {
    currentTime: 0,
    currentLiveTimestamp: null,
    currentOffsetFromLive: null,
    bufferedPosition: 0,
  });
  useEffect(() => {
    if (video.data?.progress?.progressSeconds)
      player.currentTime = video.data.progress.progressSeconds;
  }, [player, video.data?.progress?.progressSeconds]);
  useEffect(() => {
    if (video.data?._id)
      void engagementApi.recordView('video', video.data._id).catch(() => undefined);
  }, [video.data?._id]);
  const progress = useMutation({
    mutationFn: (seconds: number) =>
      communityApi.updateVideoProgress(
        id,
        seconds,
        Boolean(
          video.data?.durationSeconds && seconds >= video.data.durationSeconds - 2
        )
      ),
  });
  useEffect(() => {
    const seconds = Math.floor(progressEvent?.currentTime ?? 0);
    if (seconds > 0 && !progress.isPending) progress.mutate(seconds);
  }, [progressEvent?.currentTime]);
  const related = useQuery({
    queryKey: ['video-related', id],
    queryFn: () => communityApi.relatedVideos(id),
    enabled: video.data?.status === 'published',
  });
  const summary = useMutation({
    mutationFn: () => communityApi.generateVideoSummary(id),
    onSuccess: () => video.refetch(),
  });
  const remove = useMutation({
    mutationFn: () => communityApi.removeVideo(id),
    onSuccess: () => router.replace('/community'),
  });
  const mine = video.data?.authorId === userId;
  return (
    <ScreenWrapper
      scrollable
      contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
      header={
        <CustomHeader
          title={video.data?.title || 'Video'}
          showBack
          backFallbackHref="/(discover)/explore"
        />
      }
    >
      <FeatureState
        loading={video.isLoading}
        error={video.error}
        retry={() => void video.refetch()}
      />
      {video.data ? (
        <>
          <AppText variant="heading2">{video.data.title}</AppText>
          <AppText>{video.data.description}</AppText>
          <AppText selectable>{video.data.summary}</AppText>
          {video.data.playback?.downloadUrl ? (
            <VideoView
              player={player}
              nativeControls
              fullscreenOptions={{ enable: true }}
              allowsPictureInPicture
              style={{ width: '100%', aspectRatio: 16 / 9 }}
            />
          ) : (
            <AppText>
              {vi ? 'Video chưa sẵn sàng.' : 'Video is unavailable.'}
            </AppText>
          )}
          {mine ? (
            <AppButton
              title={vi ? 'Tạo tóm tắt AI' : 'Generate AI summary'}
              variant="outline"
              loading={summary.isPending}
              disabled={summary.isPending}
              onPress={() => summary.mutate()}
            />
          ) : null}
          <ContentSaveButton
            content={{ ...video.data, type: 'video' }}
            initialSaved={video.data.saved}
          />
          {mine && ['draft', 'rejected', 'published'].includes(video.data.status) ? (
            <AppButton
              title={vi ? 'Chỉnh sửa video' : 'Edit video'}
              variant="outline"
              onPress={() =>
                router.push({
                  pathname: '/community/video-editor',
                  params: { id: video.data!._id },
                })
              }
            />
          ) : null}
          {mine ? (
            <AppButton
              title={vi ? 'Xóa video' : 'Delete video'}
              variant="ghost"
              loading={remove.isPending}
              onPress={() =>
                Alert.alert(
                  vi ? 'Xóa video?' : 'Delete video?',
                  vi
                    ? 'Video sẽ bị xóa khỏi ứng dụng.'
                    : 'The video will be removed.',
                  [
                    { text: vi ? 'Hủy' : 'Cancel', style: 'cancel' },
                    {
                      text: vi ? 'Xóa' : 'Delete',
                      style: 'destructive',
                      onPress: () => remove.mutate(),
                    },
                  ]
                )
              }
            />
          ) : null}
          <RatingPanel targetType="video" targetId={video.data._id} />
          <DiscussionPanel
            targetType="video"
            targetId={video.data._id}
            initialReaction={video.data.reacted}
          />
          <AppText variant="heading3">
            {vi ? 'Video liên quan' : 'Related videos'}
          </AppText>
          <FeatureState loading={related.isLoading} error={related.error} />
          <View style={{ gap: spacing.sm }}>
            {(related.data?.data || []).map((item) => (
              <AppButton
                key={item._id}
                title={item.title}
                variant="outline"
                onPress={() =>
                  router.push({
                    pathname: '/community/video',
                    params: { id: item._id },
                  })
                }
              />
            ))}
          </View>
          <AppButton
            title={vi ? 'Báo cáo video' : 'Report video'}
            variant="ghost"
            onPress={() =>
              router.push({
                pathname: '/community/report',
                params: { targetType: 'video', targetId: video.data!._id },
              })
            }
          />
        </>
      ) : null}
      <FeatureState error={progress.error || summary.error || remove.error} />
    </ScreenWrapper>
  );
}
