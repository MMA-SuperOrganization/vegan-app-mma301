import { Linking } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppButton, AppText, CustomHeader, ScreenWrapper } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { ContentSaveButton } from '@/features/recipes/components/ContentSaveButton';
import { communityApi } from '../communityApi';
import { useAuthStore } from '@/features/auth';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme';
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
  const open = useMutation({
    mutationFn: async () => {
      const url = video.data?.playback?.downloadUrl;
      if (!url || !/^https?:\/\//.test(url)) throw new Error('VIDEO_UNAVAILABLE');
      await Linking.openURL(url);
    },
  });
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
          <AppButton
            title={vi ? 'Phát video' : 'Play video'}
            disabled={!video.data.playback?.downloadUrl || open.isPending}
            loading={open.isPending}
            onPress={() => open.mutate()}
          />
          <AppText>
            {vi
              ? 'Video mở bằng trình phát của thiết bị.'
              : 'Video opens in your device player.'}
          </AppText>
          <ContentSaveButton
            content={{ ...video.data, type: 'video' }}
            initialSaved={video.data.saved}
          />
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
      <FeatureState error={open.error} />
    </ScreenWrapper>
  );
}
